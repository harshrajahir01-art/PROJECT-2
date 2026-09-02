from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.user import User
from app.models.detection import DetectionEvent
from app.schemas.detection import DetectionEventResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[DetectionEventResponse])
def get_detection_events(
    registration_number: Optional[str] = Query(None),
    limit: int = 50,
    skip: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(DetectionEvent)
    if registration_number:
        q = q.filter(DetectionEvent.registration_number.ilike(f"%{registration_number.strip().upper()}%"))

    detections = q.order_by(desc(DetectionEvent.detected_at)).offset(skip).limit(limit).all()
    
    results = []
    for d in detections:
        v = d.vehicle
        item = DetectionEventResponse(
            id=d.id,
            vehicle_id=d.vehicle_id,
            registration_number=d.registration_number,
            ocr_confidence=d.ocr_confidence,
            plate_detection_confidence=d.plate_detection_confidence,
            image_path=d.image_path,
            plate_crop_path=f"/uploads/{d.plate_crop_path}" if d.plate_crop_path else None,
            latitude=d.latitude,
            longitude=d.longitude,
            location_name=d.location_name,
            source_device_id=d.source_device_id,
            created_by_user_id=d.created_by_user_id,
            detected_at=d.detected_at,
            created_at=d.created_at,
            vehicle_status=v.status if v else None,
            risk_level=v.risk_level if v else None,
            vehicle_type=v.vehicle_type if v else None,
            manufacturer=v.manufacturer if v else None,
            model=v.model if v else None,
            color=v.color if v else None
        )
        results.append(item)
    return results

@router.get("/{detection_id}", response_model=DetectionEventResponse)
def get_detection_by_id(
    detection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    d = db.query(DetectionEvent).filter(DetectionEvent.id == detection_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Detection record not found")
    
    v = d.vehicle
    return DetectionEventResponse(
        id=d.id,
        vehicle_id=d.vehicle_id,
        registration_number=d.registration_number,
        ocr_confidence=d.ocr_confidence,
        plate_detection_confidence=d.plate_detection_confidence,
        image_path=d.image_path,
        plate_crop_path=f"/uploads/{d.plate_crop_path}" if d.plate_crop_path else None,
        latitude=d.latitude,
        longitude=d.longitude,
        location_name=d.location_name,
        source_device_id=d.source_device_id,
        created_by_user_id=d.created_by_user_id,
        detected_at=d.detected_at,
        created_at=d.created_at,
        vehicle_status=v.status if v else None,
        risk_level=v.risk_level if v else None,
        vehicle_type=v.vehicle_type if v else None,
        manufacturer=v.manufacturer if v else None,
        model=v.model if v else None,
        color=v.color if v else None
    )
