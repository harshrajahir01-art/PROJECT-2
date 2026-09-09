import uuid
from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class State(Base):
    __tablename__ = "states"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(10), unique=True, index=True, nullable=False)  # e.g. "GJ", "MH", "DL"
    type = Column(String(50), default="STATE", nullable=False)  # "STATE" or "UNION_TERRITORY"
    capital = Column(String(100), nullable=True)
    zone = Column(String(50), nullable=True)  # "North", "West", "South", "East", "Central", "North-East"
    total_rtos = Column(Integer, default=0, nullable=False)
    example_plate = Column(String(50), nullable=True)

    rto_offices = relationship("RTOOffice", back_populates="state", cascade="all, delete-orphan")


class RTOOffice(Base):
    __tablename__ = "rto_offices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    state_id = Column(String(36), ForeignKey("states.id"), nullable=False)
    state_code = Column(String(10), index=True, nullable=False)
    rto_code = Column(String(20), index=True, nullable=False)  # e.g. "GJ-01", "MH-12"
    district = Column(String(120), nullable=False)
    city = Column(String(120), nullable=False)
    office_name = Column(String(200), nullable=False)
    example_plate = Column(String(50), nullable=True)

    state = relationship("State", back_populates="rto_offices")


class PlateType(Base):
    __tablename__ = "plate_types"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type_key = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    bg_color = Column(String(50), nullable=False)
    text_color = Column(String(50), nullable=False)
    border_color = Column(String(50), nullable=True)
    description = Column(Text, nullable=False)
    vehicle_category = Column(String(150), nullable=False)
    example = Column(String(50), nullable=False)
    format_guide = Column(Text, nullable=False)
