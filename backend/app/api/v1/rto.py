import re
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from pydantic import BaseModel

from app.database import get_db
from app.models.rto import State, RTOOffice, PlateType

router = APIRouter()

# --- Pydantic Schemas ---
class RTOOfficeSchema(BaseModel):
    id: str
    state_code: str
    rto_code: str
    district: str
    city: str
    office_name: str
    example_plate: Optional[str] = None

    class Config:
        from_attributes = True

class StateDetailSchema(BaseModel):
    id: str
    name: str
    code: str
    type: str
    capital: Optional[str] = None
    zone: Optional[str] = None
    total_rtos: int
    example_plate: Optional[str] = None
    rto_offices: List[RTOOfficeSchema] = []

    class Config:
        from_attributes = True

class StateSummarySchema(BaseModel):
    id: str
    name: str
    code: str
    type: str
    capital: Optional[str] = None
    zone: Optional[str] = None
    total_rtos: int
    example_plate: Optional[str] = None

    class Config:
        from_attributes = True

class PlateTypeSchema(BaseModel):
    id: str
    type_key: str
    name: str
    bg_color: str
    text_color: str
    border_color: Optional[str] = None
    description: str
    vehicle_category: str
    example: str
    format_guide: str

    class Config:
        from_attributes = True

class DecodeRequest(BaseModel):
    registration_number: str

class DecodeComponent(BaseModel):
    code: str
    label: str
    meaning: str
    highlight_color: str

class DecodeResponse(BaseModel):
    success: bool
    input_text: str
    normalized: str
    format_type: str  # "STANDARD", "BH_SERIES", "DIPLOMATIC", "DEFENCE", "UNKNOWN"
    state_code: Optional[str] = None
    state_name: Optional[str] = None
    rto_code: Optional[str] = None
    rto_office_name: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    series: Optional[str] = None
    vehicle_number: Optional[str] = None
    components: List[DecodeComponent] = []
    explanation: str
    example_plate_type: str = "private"

class SearchResultItem(BaseModel):
    match_type: str  # "RTO", "STATE", "DISTRICT"
    title: str
    subtitle: str
    code: str
    state_name: str
    district: Optional[str] = None
    city: Optional[str] = None
    example_plate: Optional[str] = None

class RTOOfficeCreate(BaseModel):
    state_code: str
    rto_code: str
    district: str
    city: str
    office_name: str

class RTOOfficeUpdate(BaseModel):
    district: Optional[str] = None
    city: Optional[str] = None
    office_name: Optional[str] = None

# --- Public Endpoints ---

@router.get("/states", response_model=List[StateSummarySchema])
def list_states(db: Session = Depends(get_db)):
    """Retrieve all 36 Indian States and Union Territories with RTO counts."""
    states = db.query(State).order_by(State.name.asc()).all()
    return states

@router.get("/states/{code}", response_model=StateDetailSchema)
def get_state_detail(code: str, db: Session = Depends(get_db)):
    """Get comprehensive state data along with all its associated RTO offices."""
    clean_code = code.strip().upper()
    state = db.query(State).filter(
        or_(State.code == clean_code, func.lower(State.name) == clean_code.lower())
    ).first()
    if not state:
        raise HTTPException(status_code=404, detail=f"State/UT '{code}' not found")
    return state

@router.get("/office/{code}", response_model=RTOOfficeSchema)
def get_rto_office(code: str, db: Session = Depends(get_db)):
    """Direct lookup of a specific RTO code (e.g. GJ-01 or GJ01)."""
    clean_code = code.strip().upper().replace(" ", "")
    if "-" not in clean_code and len(clean_code) >= 4:
        clean_code = f"{clean_code[:2]}-{clean_code[2:]}"
    
    office = db.query(RTOOffice).filter(RTOOffice.rto_code == clean_code).first()
    if not office:
        # Fallback search without dash
        formatted_code = clean_code.replace("-", "")
        office = db.query(RTOOffice).filter(
            func.replace(RTOOffice.rto_code, "-", "") == formatted_code
        ).first()
    
    if not office:
        raise HTTPException(status_code=404, detail=f"RTO Code '{code}' not found")
    return office

@router.get("/plate-types", response_model=List[PlateTypeSchema])
def list_plate_types(db: Session = Depends(get_db)):
    """Retrieve all official Indian number plate categories and specifications."""
    return db.query(PlateType).all()

@router.get("/search", response_model=List[SearchResultItem])
def universal_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """
    Fast universal search:
    - Search by RTO code (e.g. 'GJ-01', 'MH-12', 'DL')
    - Search by District / City (e.g. 'Ahmedabad', 'Pune', 'Noida')
    - Search by State name (e.g. 'Gujarat', 'Maharashtra')
    """
    clean_q = q.strip().upper()
    results: List[SearchResultItem] = []

    # 1. Check exact or prefix State code
    matching_states = db.query(State).filter(
        or_(
            State.code == clean_q,
            State.name.ilike(f"%{clean_q}%")
        )
    ).limit(5).all()

    for s in matching_states:
        results.append(SearchResultItem(
            match_type="STATE",
            title=f"{s.name} ({s.code})",
            subtitle=f"{s.type.replace('_', ' ').title()} • Capital: {s.capital or 'N/A'} • {s.total_rtos} Registered RTOs",
            code=s.code,
            state_name=s.name,
            district=None,
            city=s.capital,
            example_plate=s.example_plate
        ))

    # 2. Check RTO Offices by rto_code, district, or city
    sanitized_rto = clean_q.replace(" ", "")
    matching_rtos = db.query(RTOOffice).filter(
        or_(
            RTOOffice.rto_code.ilike(f"%{clean_q}%"),
            func.replace(RTOOffice.rto_code, "-", "").ilike(f"%{sanitized_rto}%"),
            RTOOffice.district.ilike(f"%{clean_q}%"),
            RTOOffice.city.ilike(f"%{clean_q}%"),
            RTOOffice.office_name.ilike(f"%{clean_q}%")
        )
    ).limit(20).all()

    # Preload state names
    state_map = {s.code: s.name for s in db.query(State).all()}

    for r in matching_rtos:
        results.append(SearchResultItem(
            match_type="RTO",
            title=f"{r.rto_code} — {r.city}",
            subtitle=f"District: {r.district} • {r.office_name} ({state_map.get(r.state_code, r.state_code)})",
            code=r.rto_code,
            state_name=state_map.get(r.state_code, r.state_code),
            district=r.district,
            city=r.city,
            example_plate=r.example_plate
        ))

    return results

@router.post("/decode", response_model=DecodeResponse)
def decode_plate(payload: DecodeRequest, db: Session = Depends(get_db)):
    """
    Parse and decode any Indian vehicle number plate:
    - Standard Format: GJ-01-AB-1234
    - Bharat Series (BH): 24 BH 1234 AA
    - Diplomatic: 77 CD 01
    - Defence: ↑ 22 B 123456 X
    """
    raw = payload.registration_number.strip().upper()
    cleaned = re.sub(r'[^A-Z0-9↑]', '', raw)

    # 1. Test Bharat Series (BH Series): e.g. 24 BH 1234 AA
    bh_match = re.match(r'^([0-9]{2})BH([0-9]{4})([A-Z]{1,2})$', cleaned)
    if bh_match:
        yy, num, series = bh_match.groups()
        full_year = f"20{yy}"
        return DecodeResponse(
            success=True,
            input_text=payload.registration_number,
            normalized=f"{yy} BH {num} {series}",
            format_type="BH_SERIES",
            state_code="BH",
            state_name="All-India (Bharat Series)",
            rto_code="BH",
            rto_office_name="Central Pan-India Registration",
            district="Pan-India Multi-State Jurisdiction",
            city="Nationwide Validity",
            series=series,
            vehicle_number=num,
            components=[
                DecodeComponent(code=yy, label="Year of Registration", meaning=f"Registered in the year {full_year}", highlight_color="#3B82F6"),
                DecodeComponent(code="BH", label="Bharat Series Prefix", meaning="All-India Transferable Registration without State Tax Re-registration", highlight_color="#10B981"),
                DecodeComponent(code=num, label="Vehicle Identification Number", meaning=f"Randomized 4-digit allotment ({num})", highlight_color="#F59E0B"),
                DecodeComponent(code=series, label="Allotment Series", meaning=f"Alphabetical vehicle classification series ({series})", highlight_color="#8B5CF6")
            ],
            explanation="The BH-Series (Bharat Series) registration was enacted by MoRTH in Sept 2021 to free defense personnel, government employees, and multi-state private employees from cumbersome state-to-state re-registration upon job transfer.",
            example_plate_type="bh_series"
        )

    # 2. Test Defence Military Registration: e.g. ↑ 22 B 123456 X
    def_match = re.match(r'^[↑|^]?([0-9]{2})([A-Z])([0-9]{5,6})([A-Z])$', cleaned)
    if def_match:
        yy, vclass, serial, check_char = def_match.groups()
        return DecodeResponse(
            success=True,
            input_text=payload.registration_number,
            normalized=f"↑ {yy} {vclass} {serial} {check_char}",
            format_type="DEFENCE",
            state_code="MOD",
            state_name="Ministry of Defence (Armed Forces)",
            rto_code="MOD",
            rto_office_name="Army / Navy / Air Force Command",
            district="Military Logistics Corps",
            city="Armed Forces Base",
            series=vclass,
            vehicle_number=serial,
            components=[
                DecodeComponent(code="↑", label="Broad Arrow", meaning="Military heraldic symbol of Indian Armed Forces property", highlight_color="#EF4444"),
                DecodeComponent(code=yy, label="Procurement Year", meaning=f"Procured / Commissioned in 20{yy}", highlight_color="#3B82F6"),
                DecodeComponent(code=vclass, label="Vehicle Class Code", meaning=f"Class {vclass} tactical/transport vehicle", highlight_color="#F59E0B"),
                DecodeComponent(code=serial, label="Base Serial Number", meaning=f"Six-digit military base registration ({serial})", highlight_color="#10B981"),
                DecodeComponent(code=check_char, label="Check Character", meaning=f"Security checksum character ({check_char})", highlight_color="#8B5CF6")
            ],
            explanation="Defence vehicles do not follow standard civilian state RTO registration. They carry the historic Broad Arrow and are registered directly under the Ministry of Defence to safeguard strategic movement details.",
            example_plate_type="defence"
        )

    # 3. Test Diplomatic Mission: e.g. 77 CD 01 or 12 CC 05
    dip_match = re.match(r'^([0-9]{1,3})(CD|CC|UN)([0-9]{1,4})$', cleaned)
    if dip_match:
        mission_code, mission_type, num = dip_match.groups()
        type_desc = "Corps Diplomatique (Embassy)" if mission_type == "CD" else ("Corps Consulaire (Consulate)" if mission_type == "CC" else "United Nations Agency")
        return DecodeResponse(
            success=True,
            input_text=payload.registration_number,
            normalized=f"{mission_code} {mission_type} {num}",
            format_type="DIPLOMATIC",
            state_code="DIP",
            state_name="Diplomatic Mission",
            rto_code=mission_type,
            rto_office_name="Ministry of External Affairs (MEA)",
            district=type_desc,
            city="Foreign Mission Headquarters",
            series=mission_type,
            vehicle_number=num,
            components=[
                DecodeComponent(code=mission_code, label="Country / Mission Code", meaning=f"Assigned country code ({mission_code})", highlight_color="#0284C7"),
                DecodeComponent(code=mission_type, label="Mission Category", meaning=type_desc, highlight_color="#10B981"),
                DecodeComponent(code=num, label="Vehicle Serial", meaning=f"Mission vehicle index #{num}", highlight_color="#F59E0B")
            ],
            explanation="Diplomatic plates are light blue with white characters. The leading number specifies the accredited foreign mission, while CD/CC/UN indicates diplomatic rank.",
            example_plate_type="diplomatic"
        )

    # 4. Standard Indian State Registration: e.g. GJ-01-AB-1234 or GJ01AB1234 or DL1CAA1111
    std_match = re.match(r'^([A-Z]{2})([0-9]{1,2})([A-Z]{0,3})([0-9]{1,4})$', cleaned)
    if std_match:
        st_code, rto_num, series, num = std_match.groups()
        rto_code_formatted = f"{st_code}-{rto_num.zfill(2)}"
        normalized_str = f"{st_code}-{rto_num.zfill(2)}{f'-{series}' if series else ''}-{num.zfill(4)}"

        # Query database for state and RTO details
        state_obj = db.query(State).filter(State.code == st_code).first()
        rto_obj = db.query(RTOOffice).filter(
            or_(
                RTOOffice.rto_code == rto_code_formatted,
                func.replace(RTOOffice.rto_code, "-", "") == f"{st_code}{rto_num.zfill(2)}"
            )
        ).first()

        state_name = state_obj.name if state_obj else f"{st_code} State / UT"
        district_name = rto_obj.district if rto_obj else "Transport District"
        city_name = rto_obj.city if rto_obj else "RTO Office"
        office_name = rto_obj.office_name if rto_obj else f"{st_code}-{rto_num.zfill(2)} Regional Transport Office"

        components = [
            DecodeComponent(
                code=st_code,
                label="State / UT Code",
                meaning=f"{state_name} ({state_obj.type.title() if state_obj else 'State'})",
                highlight_color="#3B82F6"
            ),
            DecodeComponent(
                code=rto_num.zfill(2),
                label="RTO / District Office",
                meaning=f"{rto_code_formatted} — {office_name} ({district_name})",
                highlight_color="#10B981"
            )
        ]

        if series:
            components.append(
                DecodeComponent(
                    code=series,
                    label="Vehicle Series",
                    meaning=f"Sequential alphabetical batch '{series}' allocated to this district",
                    highlight_color="#8B5CF6"
                )
            )

        components.append(
            DecodeComponent(
                code=num.zfill(4),
                label="Unique Vehicle Number",
                meaning=f"Distinct vehicle identification number ({num.zfill(4)})",
                highlight_color="#F59E0B"
            )
        )

        return DecodeResponse(
            success=True,
            input_text=payload.registration_number,
            normalized=normalized_str,
            format_type="STANDARD",
            state_code=st_code,
            state_name=state_name,
            rto_code=rto_code_formatted,
            rto_office_name=office_name,
            district=district_name,
            city=city_name,
            series=series or "None",
            vehicle_number=num.zfill(4),
            components=components,
            explanation=f"Standard 4-part Indian registration format. {st_code} identifies the State of {state_name}, {rto_num.zfill(2)} designates the {district_name} RTO jurisdiction, '{series or 'N/A'}' is the running batch series, and {num.zfill(4)} is the assigned vehicle number.",
            example_plate_type="private"
        )

    # Could not decode
    return DecodeResponse(
        success=False,
        input_text=payload.registration_number,
        normalized=raw,
        format_type="UNKNOWN",
        components=[],
        explanation=f"Could not parse '{raw}' as a standard Indian vehicle registration. Indian plates follow either standard format (e.g. GJ-01-AB-1234), Bharat Series (e.g. 24 BH 1234 AA), Diplomatic (e.g. 77 CD 01), or Military (e.g. ↑ 22 B 123456 X)."
    )

@router.get("/stats")
def get_rto_stats(db: Session = Depends(get_db)):
    """Retrieve summary statistics for dashboard display."""
    total_states = db.query(State).filter(State.type == "STATE").count()
    total_uts = db.query(State).filter(State.type == "UNION_TERRITORY").count()
    total_rtos = db.query(RTOOffice).count()
    total_plate_types = db.query(PlateType).count()

    return {
        "total_states": total_states,
        "total_union_territories": total_uts,
        "total_jurisdictions": total_states + total_uts,
        "total_rtos": total_rtos,
        "total_plate_types": total_plate_types,
        "popular_searches": [
            {"label": "GJ-01", "sub": "Ahmedabad"},
            {"label": "MH-12", "sub": "Pune"},
            {"label": "DL-01", "sub": "Delhi Central"},
            {"label": "KA-01", "sub": "Bengaluru"},
            {"label": "24 BH", "sub": "Bharat Series"},
            {"label": "RJ-14", "sub": "Jaipur"}
        ]
    }

# --- Administrative Endpoints ---

@router.post("/admin/office", response_model=RTOOfficeSchema, status_code=status.HTTP_201_CREATED)
def create_rto_office(payload: RTOOfficeCreate, db: Session = Depends(get_db)):
    """Create a new RTO code record."""
    clean_rto = payload.rto_code.strip().upper()
    existing = db.query(RTOOffice).filter(RTOOffice.rto_code == clean_rto).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"RTO code {clean_rto} already exists")

    state = db.query(State).filter(State.code == payload.state_code.strip().upper()).first()
    if not state:
        raise HTTPException(status_code=404, detail=f"State code {payload.state_code} not found")

    office = RTOOffice(
        state_id=state.id,
        state_code=state.code,
        rto_code=clean_rto,
        district=payload.district.strip(),
        city=payload.city.strip(),
        office_name=payload.office_name.strip(),
        example_plate=f"{clean_rto}-AB-1234"
    )
    db.add(office)
    state.total_rtos += 1
    db.commit()
    db.refresh(office)
    return office

@router.put("/admin/office/{office_id}", response_model=RTOOfficeSchema)
def update_rto_office(office_id: str, payload: RTOOfficeUpdate, db: Session = Depends(get_db)):
    """Update district or city details of an existing RTO record."""
    office = db.query(RTOOffice).filter(RTOOffice.id == office_id).first()
    if not office:
        raise HTTPException(status_code=404, detail="RTO office not found")

    if payload.district:
        office.district = payload.district.strip()
    if payload.city:
        office.city = payload.city.strip()
    if payload.office_name:
        office.office_name = payload.office_name.strip()

    db.commit()
    db.refresh(office)
    return office

@router.delete("/admin/office/{office_id}")
def delete_rto_office(office_id: str, db: Session = Depends(get_db)):
    """Delete an RTO office record."""
    office = db.query(RTOOffice).filter(RTOOffice.id == office_id).first()
    if not office:
        raise HTTPException(status_code=404, detail="RTO office not found")

    state = db.query(State).filter(State.id == office.state_id).first()
    if state and state.total_rtos > 0:
        state.total_rtos -= 1

    db.delete(office)
    db.commit()
    return {"success": True, "message": f"Deleted RTO office {office.rto_code}"}
