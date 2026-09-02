from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.alert import AlertSeverity, AlertStatus
from app.models.vehicle import VehicleStatus, RiskLevel

class AlertUpdate(BaseModel):
    status: AlertStatus
    resolution_notes: Optional[str] = None

class AlertResponse(BaseModel):
    id: str
    vehicle_id: str
    detection_event_id: str
    alert_type: str
    severity: AlertSeverity
    status: AlertStatus
    title: str
    description: Optional[str] = None
    recommended_action: Optional[str] = None
    assigned_to_user_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    
    # Nested vehicle info
    registration_number: Optional[str] = None
    vehicle_status: Optional[VehicleStatus] = None
    risk_level: Optional[RiskLevel] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True
