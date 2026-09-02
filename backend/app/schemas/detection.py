from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.vehicle import VehicleStatus, RiskLevel, VehicleType

class DetectionEventResponse(BaseModel):
    id: str
    vehicle_id: Optional[str] = None
    registration_number: str
    ocr_confidence: float
    plate_detection_confidence: float
    image_path: Optional[str] = None
    plate_crop_path: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    source_device_id: Optional[str] = None
    created_by_user_id: Optional[str] = None
    detected_at: datetime
    created_at: datetime
    
    # Associated vehicle summary
    vehicle_status: Optional[VehicleStatus] = None
    risk_level: Optional[RiskLevel] = None
    vehicle_type: Optional[VehicleType] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None

    class Config:
        from_attributes = True

class TimelinePoint(BaseModel):
    id: str
    timestamp: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    source_device_id: Optional[str] = None
    ocr_confidence: float
    officer_name: Optional[str] = None

class VehicleTimelineResponse(BaseModel):
    registration_number: str
    vehicle_status: VehicleStatus
    risk_level: RiskLevel
    total_sightings: int
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    observation_timeline: List[TimelinePoint]
