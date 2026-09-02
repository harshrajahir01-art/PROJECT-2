from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.vehicle import VehicleStatus, RiskLevel, VehicleType

class VehicleBase(BaseModel):
    registration_number: str = Field(..., description="Normalized Indian registration plate")
    vehicle_type: VehicleType = VehicleType.SEDAN
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    status: VehicleStatus = VehicleStatus.CLEAR
    risk_level: RiskLevel = RiskLevel.NONE
    owner_name: Optional[str] = None
    owner_contact: Optional[str] = None
    registered_rto: Optional[str] = None
    reporting_police_station: Optional[str] = None
    fir_number: Optional[str] = None
    notes: Optional[str] = None
    recommended_action: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    vehicle_type: Optional[VehicleType] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    status: Optional[VehicleStatus] = None
    risk_level: Optional[RiskLevel] = None
    owner_name: Optional[str] = None
    owner_contact: Optional[str] = None
    reporting_police_station: Optional[str] = None
    fir_number: Optional[str] = None
    notes: Optional[str] = None
    recommended_action: Optional[str] = None

class VehicleStatusUpdate(BaseModel):
    status: VehicleStatus
    risk_level: RiskLevel
    notes: Optional[str] = None
    fir_number: Optional[str] = None
    reporting_police_station: Optional[str] = None

class VehicleResponse(BaseModel):
    id: str
    registration_number: str
    vehicle_type: VehicleType
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    status: VehicleStatus
    risk_level: RiskLevel
    
    # Masked or unmasked depending on authorization
    owner_name_masked: Optional[str] = None
    owner_name: Optional[str] = None
    owner_contact: Optional[str] = None
    
    registered_rto: Optional[str] = None
    reporting_police_station: Optional[str] = None
    fir_number: Optional[str] = None
    reported_at: Optional[datetime] = None
    notes: Optional[str] = None
    recommended_action: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class VehicleCheckRequest(BaseModel):
    registration_number: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    source_device_id: Optional[str] = None
