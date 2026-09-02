import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class DetectionEvent(Base):
    __tablename__ = "detection_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True, index=True)
    registration_number = Column(String(20), index=True, nullable=False)
    
    # Confidence metrics
    ocr_confidence = Column(Float, nullable=False, default=0.0)
    plate_detection_confidence = Column(Float, nullable=False, default=0.0)
    
    # Media reference
    image_path = Column(String(500), nullable=True)
    plate_crop_path = Column(String(500), nullable=True)
    
    # Geographic & Device observation metadata
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True)
    source_device_id = Column(String(100), nullable=True)
    client_ip = Column(String(50), nullable=True)
    
    # Operator
    created_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    detected_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="detections")
    creator = relationship("User")
    alerts = relationship("Alert", back_populates="detection_event")
