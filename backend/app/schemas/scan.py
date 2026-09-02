from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.models.vehicle import VehicleStatus, RiskLevel, VehicleType

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int

class ScanResult(BaseModel):
    # OCR & Detection
    success: bool
    raw_text: Optional[str] = None
    registration_number: Optional[str] = None
    ocr_confidence: float = 0.0
    plate_detection_confidence: float = 0.0
    bounding_box: Optional[BoundingBox] = None
    processed_image_url: Optional[str] = None
    plate_crop_url: Optional[str] = None
    
    # Vehicle Database Match
    is_registered: bool = False
    vehicle_id: Optional[str] = None
    vehicle_type: Optional[VehicleType] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    status: VehicleStatus = VehicleStatus.CLEAR
    risk_level: RiskLevel = RiskLevel.NONE
    
    # Alert Triggered
    alert_triggered: bool = False
    alert_id: Optional[str] = None
    alert_severity: Optional[str] = None
    
    # Metadata & Instructions
    detected_at: datetime
    location_name: Optional[str] = None
    recommended_action: Optional[str] = None
    error_message: Optional[str] = None
    instructions_to_officer: Optional[str] = None
    
    # Timeline
    last_seen_count: int = 0
    recent_sightings: Optional[List[Dict[str, Any]]] = None

class ScanRequestBase64(BaseModel):
    image_base64: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    source_device_id: Optional[str] = None
