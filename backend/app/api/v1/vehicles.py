from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database import get_db
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle, VehicleStatus, RiskLevel
from app.models.detection import DetectionEvent
from app.schemas.vehicle import (
    VehicleCreate, VehicleUpdate, VehicleResponse, 
    VehicleStatusUpdate, VehicleCheckRequest
)
from app.schemas.detection import VehicleTimelineResponse, TimelinePoint
from app.cv.normalizer import normalize_indian_plate
from app.core.privacy import mask_owner_name, mask_phone_number
from app.core.audit_logger import log_audit_event
from app.api.deps import get_current_user, get_current_admin, get_current_operator_or_admin

router = APIRouter()

def format_vehicle_response(v: Vehicle, current_user: User) -> dict:
    res = {
        "id": v.id,
        "registration_number": v.registration_number,
        "vehicle_type": v.vehicle_type,
        "manufacturer": v.manufacturer,
        "model": v.model,
        "color": v.color,
        "status": v.status,
        "risk_level": v.risk_level,
        "registered_rto": v.registered_rto,
        "reporting_police_station": v.reporting_police_station,
        "fir_number": v.fir_number,
        "reported_at": v.reported_at,
        "notes": v.notes,
        "recommended_action": v.recommended_action,
        "created_at": v.created_at,
        "updated_at": v.updated_at
    }
    # Privacy protection: only ADMIN can view raw unmasked PII
    if current_user and current_user.role == UserRole.ADMIN:
        res["owner_name"] = v.owner_name
        res["owner_contact"] = v.owner_contact
        res["owner_name_masked"] = v.owner_name
    else:
        res["owner_name"] = None
        res["owner_contact"] = None
        res["owner_name_masked"] = mask_owner_name(v.owner_name)
    return res

@router.get("", response_model=List[VehicleResponse])
def get_vehicles(
    query: Optional[str] = Query(None, description="Search by plate, manufacturer, model"),
    status: Optional[VehicleStatus] = Query(None),
    risk_level: Optional[RiskLevel] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Vehicle)
    if query:
        term = f"%{query.strip().upper()}%"
        q = q.filter(
            or_(
                Vehicle.registration_number.ilike(term),
                Vehicle.manufacturer.ilike(term),
                Vehicle.model.ilike(term),
                Vehicle.fir_number.ilike(term)
            )
        )
    if status:
        q = q.filter(Vehicle.status == status)
    if risk_level:
        q = q.filter(Vehicle.risk_level == risk_level)

    vehicles = q.order_by(desc(Vehicle.updated_at)).offset(skip).limit(limit).all()
    return [format_vehicle_response(v, current_user) for v in vehicles]

@router.post("/check")
def check_vehicle_manual(
    payload: VehicleCheckRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manual text plate verification.
    """
    normalized_plate, _, _ = normalize_indian_plate(payload.registration_number)
    plate = normalized_plate or payload.registration_number.strip().upper()

    vehicle = db.query(Vehicle).filter(Vehicle.registration_number == plate).first()

    # Create observation event
    detection_event = DetectionEvent(
        vehicle_id=vehicle.id if vehicle else None,
        registration_number=plate,
        ocr_confidence=1.0,
        plate_detection_confidence=1.0,
        latitude=payload.latitude,
        longitude=payload.longitude,
        location_name=payload.location_name or "Manual Checkpoint Entry",
        source_device_id=payload.source_device_id or "Manual_Search",
        client_ip=request.client.host if request.client else None,
        created_by_user_id=current_user.id,
        detected_at=datetime.utcnow()
    )
    db.add(detection_event)
    db.commit()

    log_audit_event(
        db=db,
        action="MANUAL_PLATE_CHECK",
        user_id=current_user.id,
        resource_type="VEHICLE",
        resource_id=plate,
        ip_address=request.client.host if request.client else None,
        details={"plate": plate, "found": vehicle is not None}
    )

    if not vehicle:
        return {
            "found": False,
            "registration_number": plate,
            "status": "UNREGISTERED",
            "risk_level": "NONE",
            "message": "Vehicle not found in registry."
        }

    return {
        "found": True,
        "vehicle": format_vehicle_response(vehicle, current_user),
        "is_flagged": vehicle.status in [VehicleStatus.STOLEN, VehicleStatus.SUSPECTED_CRIME, VehicleStatus.WANTED]
    }

@router.get("/{registration_number}", response_model=VehicleResponse)
def get_vehicle_by_plate(
    registration_number: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    norm, _, _ = normalize_indian_plate(registration_number)
    plate = norm or registration_number.strip().upper()

    vehicle = db.query(Vehicle).filter(Vehicle.registration_number == plate).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found in database")

    log_audit_event(
        db=db,
        action="VIEW_VEHICLE_DETAILS",
        user_id=current_user.id,
        resource_type="VEHICLE",
        resource_id=plate,
        ip_address=request.client.host if request.client else None
    )

    return format_vehicle_response(vehicle, current_user)

@router.get("/{registration_number}/timeline", response_model=VehicleTimelineResponse)
def get_vehicle_timeline(
    registration_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves chronological observation events for the vehicle to map movement timeline.
    """
    norm, _, _ = normalize_indian_plate(registration_number)
    plate = norm or registration_number.strip().upper()

    vehicle = db.query(Vehicle).filter(Vehicle.registration_number == plate).first()
    
    detections = db.query(DetectionEvent).filter(
        DetectionEvent.registration_number == plate
    ).order_by(DetectionEvent.detected_at.asc()).all()

    timeline_points = [
        TimelinePoint(
            id=d.id,
            timestamp=d.detected_at,
            latitude=d.latitude,
            longitude=d.longitude,
            location_name=d.location_name,
            source_device_id=d.source_device_id,
            ocr_confidence=d.ocr_confidence,
            officer_name=d.creator.full_name if d.creator else "Automated Scanner"
        )
        for d in detections
    ]

    return VehicleTimelineResponse(
        registration_number=plate,
        vehicle_status=vehicle.status if vehicle else VehicleStatus.UNREGISTERED,
        risk_level=vehicle.risk_level if vehicle else RiskLevel.NONE,
        total_sightings=len(detections),
        first_seen=detections[0].detected_at if detections else None,
        last_seen=detections[-1].detected_at if detections else None,
        observation_timeline=timeline_points
    )

@router.post("", response_model=VehicleResponse)
def create_vehicle(
    vehicle_in: VehicleCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    norm, _, _ = normalize_indian_plate(vehicle_in.registration_number)
    plate = norm or vehicle_in.registration_number.strip().upper()

    existing = db.query(Vehicle).filter(Vehicle.registration_number == plate).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle registration number already exists")

    vehicle = Vehicle(
        registration_number=plate,
        vehicle_type=vehicle_in.vehicle_type,
        manufacturer=vehicle_in.manufacturer,
        model=vehicle_in.model,
        color=vehicle_in.color,
        status=vehicle_in.status,
        risk_level=vehicle_in.risk_level,
        owner_name=vehicle_in.owner_name,
        owner_contact=vehicle_in.owner_contact,
        registered_rto=vehicle_in.registered_rto,
        reporting_police_station=vehicle_in.reporting_police_station,
        fir_number=vehicle_in.fir_number,
        notes=vehicle_in.notes,
        recommended_action=vehicle_in.recommended_action,
        reported_at=datetime.utcnow() if vehicle_in.status != VehicleStatus.CLEAR else None
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)

    log_audit_event(
        db=db,
        action="REGISTER_VEHICLE",
        user_id=current_admin.id,
        resource_type="VEHICLE",
        resource_id=plate,
        ip_address=request.client.host if request.client else None,
        details={"plate": plate, "status": vehicle.status.value}
    )

    return format_vehicle_response(vehicle, current_admin)

@router.put("/{vehicle_id}/status", response_model=VehicleResponse)
def update_vehicle_status(
    vehicle_id: str,
    status_in: VehicleStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_operator_or_admin)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    old_status = vehicle.status
    vehicle.status = status_in.status
    vehicle.risk_level = status_in.risk_level
    if status_in.notes:
        vehicle.notes = f"[{datetime.utcnow().strftime('%Y-%m-%d %H:%M')}] {status_in.notes}\n" + (vehicle.notes or "")
    if status_in.fir_number:
        vehicle.fir_number = status_in.fir_number
    if status_in.reporting_police_station:
        vehicle.reporting_police_station = status_in.reporting_police_station

    if status_in.status != VehicleStatus.CLEAR and not vehicle.reported_at:
        vehicle.reported_at = datetime.utcnow()

    db.commit()
    db.refresh(vehicle)

    log_audit_event(
        db=db,
        action="UPDATE_VEHICLE_STATUS",
        user_id=current_user.id,
        resource_type="VEHICLE",
        resource_id=vehicle.registration_number,
        ip_address=request.client.host if request.client else None,
        details={
            "old_status": old_status.value,
            "new_status": vehicle.status.value,
            "risk_level": vehicle.risk_level.value
        }
    )

    return format_vehicle_response(vehicle, current_user)
