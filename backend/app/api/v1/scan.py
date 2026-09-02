import os
import uuid
import base64
from datetime import datetime
import cv2
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleStatus, RiskLevel
from app.models.detection import DetectionEvent
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.schemas.scan import ScanResult, ScanRequestBase64
from app.cv.pipeline import cv_pipeline
from app.cv.normalizer import normalize_indian_plate
from app.core.audit_logger import log_audit_event
from app.api.deps import get_current_user, get_optional_user
from app.config import settings

router = APIRouter()

def evaluate_and_record_scan(
    db: Session,
    reg_number: str,
    ocr_conf: float,
    plate_conf: float,
    plate_crop_filename: str,
    latitude: float = None,
    longitude: float = None,
    location_name: str = None,
    source_device_id: str = None,
    current_user: User = None,
    client_ip: str = None,
    user_agent: str = None,
    raw_ocr_text: str = ""
) -> ScanResult:
    # 1. Normalize registration number
    normalized_plate, fmt_score, _ = normalize_indian_plate(reg_number)
    final_plate = normalized_plate or reg_number.strip().upper()

    # 2. Query vehicle database
    vehicle = db.query(Vehicle).filter(Vehicle.registration_number == final_plate).first()

    # 3. Create Detection Event (Observation Event)
    detection_event = DetectionEvent(
        vehicle_id=vehicle.id if vehicle else None,
        registration_number=final_plate,
        ocr_confidence=ocr_conf,
        plate_detection_confidence=plate_conf,
        plate_crop_path=plate_crop_filename,
        latitude=latitude,
        longitude=longitude,
        location_name=location_name or "Field Checkpoint",
        source_device_id=source_device_id or "Mobile_Terminal_01",
        client_ip=client_ip,
        created_by_user_id=current_user.id if current_user else None,
        detected_at=datetime.utcnow()
    )
    db.add(detection_event)
    db.commit()
    db.refresh(detection_event)

    # 4. Check Risk & Alert Status
    alert_triggered = False
    alert_id = None
    alert_severity = None
    recommended_action = "Vehicle record verified clear. Standard passage permitted."
    instructions = "No action required."

    if vehicle:
        is_flagged = vehicle.status in [
            VehicleStatus.STOLEN,
            VehicleStatus.SUSPECTED_CRIME,
            VehicleStatus.WANTED,
            VehicleStatus.TRAFFIC_VIOLATION
        ] or vehicle.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL, RiskLevel.MEDIUM]

        if is_flagged:
            alert_triggered = True
            # Map severity
            if vehicle.status == VehicleStatus.STOLEN or vehicle.risk_level == RiskLevel.CRITICAL:
                severity = AlertSeverity.CRITICAL
                recommended_action = "🚨 CRITICAL: Stolen / High-Risk Vehicle! Do not approach alone. Alert checkpoint units immediately."
                instructions = f"Reported stolen at {vehicle.reporting_police_station or 'Police Station'} (FIR #{vehicle.fir_number or 'N/A'}). Detain vehicle occupants safely."
            elif vehicle.status == VehicleStatus.SUSPECTED_CRIME or vehicle.risk_level == RiskLevel.HIGH:
                severity = AlertSeverity.HIGH
                recommended_action = "⚠️ HIGH ALERT: Vehicle wanted in active criminal investigation. Verify driver ID."
                instructions = f"FIR #{vehicle.fir_number or 'Active Case'}. Contact dispatch."
            elif vehicle.status == VehicleStatus.TRAFFIC_VIOLATION or vehicle.risk_level == RiskLevel.MEDIUM:
                severity = AlertSeverity.MEDIUM
                recommended_action = "NOTICE: Unresolved traffic violations or pending challans."
                instructions = "Inspect driver documents and issue clearance / challan."
            else:
                severity = AlertSeverity.LOW
                recommended_action = "Standard verification required."
                instructions = "Verify vehicle registration papers."

            alert_severity = severity.value

            # Create Security Alert Record
            alert = Alert(
                vehicle_id=vehicle.id,
                detection_event_id=detection_event.id,
                alert_type=f"ALERT_{vehicle.status.value}",
                severity=severity,
                status=AlertStatus.ACTIVE,
                title=f"Flagged Vehicle Sighted: {final_plate}",
                description=f"Vehicle {final_plate} ({vehicle.manufacturer or ''} {vehicle.model or ''}) detected at {location_name or 'Field Camera'}. Status: {vehicle.status.value}",
                recommended_action=recommended_action
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            alert_id = alert.id
    else:
        # Unregistered vehicle
        recommended_action = "Unregistered vehicle. Verify physical RC book and documentation."
        instructions = "Vehicle is not in the authorized database registry."

    # 5. Fetch past sightings for timeline context
    past_detections = db.query(DetectionEvent).filter(
        DetectionEvent.registration_number == final_plate
    ).order_by(DetectionEvent.detected_at.desc()).limit(5).all()

    recent_sightings = [
        {
            "id": d.id,
            "detected_at": d.detected_at.isoformat(),
            "location_name": d.location_name,
            "latitude": d.latitude,
            "longitude": d.longitude
        }
        for d in past_detections
    ]

    # 6. Log Audit Event
    log_audit_event(
        db=db,
        action="SCAN_VEHICLE",
        user_id=current_user.id if current_user else None,
        resource_type="VEHICLE",
        resource_id=final_plate,
        ip_address=client_ip,
        user_agent=user_agent,
        details={
            "registration_number": final_plate,
            "ocr_confidence": ocr_conf,
            "status": vehicle.status.value if vehicle else "UNREGISTERED",
            "alert_triggered": alert_triggered,
            "location": location_name
        }
    )

    return ScanResult(
        success=True,
        raw_text=raw_ocr_text,
        registration_number=final_plate,
        ocr_confidence=round(ocr_conf, 3),
        plate_detection_confidence=round(plate_conf, 3),
        plate_crop_url=f"/uploads/{plate_crop_filename}" if plate_crop_filename else None,
        is_registered=vehicle is not None,
        vehicle_id=vehicle.id if vehicle else None,
        vehicle_type=vehicle.vehicle_type if vehicle else None,
        manufacturer=vehicle.manufacturer if vehicle else None,
        model=vehicle.model if vehicle else None,
        color=vehicle.color if vehicle else None,
        status=vehicle.status if vehicle else VehicleStatus.UNREGISTERED,
        risk_level=vehicle.risk_level if vehicle else RiskLevel.NONE,
        alert_triggered=alert_triggered,
        alert_id=alert_id,
        alert_severity=alert_severity,
        detected_at=detection_event.detected_at,
        location_name=location_name or "Field Observation",
        recommended_action=recommended_action,
        instructions_to_officer=instructions,
        last_seen_count=len(past_detections),
        recent_sightings=recent_sightings
    )

@router.post("", response_model=ScanResult)
async def scan_vehicle_image(
    request: Request,
    file: UploadFile = File(...),
    latitude: float = Form(None),
    longitude: float = Form(None),
    location_name: str = Form(None),
    source_device_id: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process an uploaded camera image frame through the Computer Vision & OCR pipeline,
    verify against the authorized vehicle database, and generate alerts if flagged.
    """
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image encoding")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read image file: {str(e)}")

    # Run AI/CV Pipeline
    cv_res = cv_pipeline.process_image(img)
    
    if not cv_res["success"] or not cv_res.get("registration_number"):
        return ScanResult(
            success=False,
            error_message=cv_res.get("error_message", "Could not recognize license plate"),
            raw_text=cv_res.get("raw_text"),
            registration_number=None,
            ocr_confidence=cv_res.get("ocr_confidence", 0.0),
            plate_detection_confidence=cv_res.get("plate_detection_confidence", 0.0),
            detected_at=datetime.utcnow()
        )

    # Save original scan image
    full_image_name = f"scan_{uuid.uuid4().hex[:12]}.jpg"
    full_image_path = os.path.join(settings.UPLOAD_DIR, full_image_name)
    try:
        cv2.imwrite(full_image_path, img)
    except Exception:
        full_image_name = None

    return evaluate_and_record_scan(
        db=db,
        reg_number=cv_res["registration_number"],
        ocr_conf=cv_res.get("ocr_confidence", 0.0),
        plate_conf=cv_res.get("plate_detection_confidence", 0.0),
        plate_crop_filename=cv_res.get("plate_crop_path"),
        latitude=latitude,
        longitude=longitude,
        location_name=location_name,
        source_device_id=source_device_id,
        current_user=current_user,
        client_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        raw_ocr_text=cv_res.get("raw_text", "")
    )

@router.post("/base64", response_model=ScanResult)
def scan_vehicle_base64(
    payload: ScanRequestBase64,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process base64-encoded image stream from mobile camera canvas.
    """
    try:
        img_str = payload.image_base64
        if "," in img_str:
            img_str = img_str.split(",")[1]
        img_bytes = base64.b64decode(img_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode base64 image: {str(e)}")

    cv_res = cv_pipeline.process_image(img)
    
    if not cv_res["success"] or not cv_res.get("registration_number"):
        return ScanResult(
            success=False,
            error_message=cv_res.get("error_message", "Could not recognize license plate"),
            raw_text=cv_res.get("raw_text"),
            registration_number=None,
            ocr_confidence=cv_res.get("ocr_confidence", 0.0),
            plate_detection_confidence=cv_res.get("plate_detection_confidence", 0.0),
            detected_at=datetime.utcnow()
        )

    return evaluate_and_record_scan(
        db=db,
        reg_number=cv_res["registration_number"],
        ocr_conf=cv_res.get("ocr_confidence", 0.0),
        plate_conf=cv_res.get("plate_detection_confidence", 0.0),
        plate_crop_filename=cv_res.get("plate_crop_path"),
        latitude=payload.latitude,
        longitude=payload.longitude,
        location_name=payload.location_name,
        source_device_id=payload.source_device_id,
        current_user=current_user,
        client_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        raw_ocr_text=cv_res.get("raw_text", "")
    )
