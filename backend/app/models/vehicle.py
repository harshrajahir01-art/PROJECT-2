import uuid
from datetime import datetime
import enum
from sqlalchemy import Column, String, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from app.database import Base

class VehicleStatus(str, enum.Enum):
    CLEAR = "CLEAR"
    STOLEN = "STOLEN"
    SUSPECTED_CRIME = "SUSPECTED_CRIME"
    WANTED = "WANTED"
    TRAFFIC_VIOLATION = "TRAFFIC_VIOLATION"
    UNREGISTERED = "UNREGISTERED"

class RiskLevel(str, enum.Enum):
    NONE = "NONE"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class VehicleType(str, enum.Enum):
    SEDAN = "SEDAN"
    SUV = "SUV"
    HATCHBACK = "HATCHBACK"
    MOTORCYCLE = "MOTORCYCLE"
    SCOOTER = "SCOOTER"
    TRUCK = "TRUCK"
    BUS = "BUS"
    AUTO_RICKSHAW = "AUTO_RICKSHAW"
    OTHER = "OTHER"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    registration_number = Column(String(20), unique=True, index=True, nullable=False)
    vehicle_type = Column(Enum(VehicleType), default=VehicleType.SEDAN, nullable=False)
    manufacturer = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    color = Column(String(50), nullable=True)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.CLEAR, nullable=False)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.NONE, nullable=False)
    
    # Privacy protected fields (Masked for regular field officers)
    owner_name = Column(String(255), nullable=True)
    owner_contact = Column(String(50), nullable=True)
    
    # Registration details
    registration_date = Column(DateTime, nullable=True)
    insurance_expiry = Column(DateTime, nullable=True)
    puc_expiry = Column(DateTime, nullable=True)
    registered_rto = Column(String(100), nullable=True)
    
    # Case / Alert details
    reported_at = Column(DateTime, nullable=True)
    reporting_police_station = Column(String(255), nullable=True)
    fir_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    detections = relationship("DetectionEvent", back_populates="vehicle", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="vehicle", cascade="all, delete-orphan")
