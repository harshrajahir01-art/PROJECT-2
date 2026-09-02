import uuid
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle, VehicleStatus, RiskLevel, VehicleType
from app.models.detection import DetectionEvent
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.core.security import get_password_hash

def seed_database():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            print("[INFO] Database already contains records. Skipping seed.")
            return

        print("[INFO] Seeding initial users...")
        # 1. Seed Users
        admin_user = User(
            id=str(uuid.uuid4()),
            email="admin@vehicleshield.gov",
            hashed_password=get_password_hash("Admin@1234"),
            full_name="Chief Inspector K. Sharma",
            role=UserRole.ADMIN,
            badge_number="VS-ADM-001",
            department="Central Enforcement Command",
            is_active=True
        )

        officer_user = User(
            id=str(uuid.uuid4()),
            email="officer@vehicleshield.gov",
            hashed_password=get_password_hash("Officer@1234"),
            full_name="Officer Ramesh Patel",
            role=UserRole.OPERATOR,
            badge_number="VS-FLD-104",
            department="Field Interception Unit",
            is_active=True
        )

        auditor_user = User(
            id=str(uuid.uuid4()),
            email="auditor@vehicleshield.gov",
            hashed_password=get_password_hash("Auditor@1234"),
            full_name="Auditor Sunita Rao",
            role=UserRole.AUDITOR,
            badge_number="VS-AUD-205",
            department="Internal Oversight & Compliance",
            is_active=True
        )

        db.add_all([admin_user, officer_user, auditor_user])
        db.commit()

        print("[INFO] Seeding authorized vehicle registry...")
        # 2. Seed Synthetic Vehicles
        now = datetime.utcnow()

        v1 = Vehicle(
            id=str(uuid.uuid4()),
            registration_number="GJ01AB1234",
            vehicle_type=VehicleType.SEDAN,
            manufacturer="Honda",
            model="City ZX",
            color="Taffeta White",
            status=VehicleStatus.CLEAR,
            risk_level=RiskLevel.NONE,
            owner_name="Rajesh Kumar Patel",
            owner_contact="+919876543210",
            registered_rto="GJ-01 Ahmedabad",
            notes="Valid insurance, clean record.",
            recommended_action="Standard passage permitted."
        )

        v2 = Vehicle(
            id=str(uuid.uuid4()),
            registration_number="GJ05XY7865",
            vehicle_type=VehicleType.HATCHBACK,
            manufacturer="Hyundai",
            model="i20 Asta",
            color="Fiery Red",
            status=VehicleStatus.STOLEN,
            risk_level=RiskLevel.HIGH,
            owner_name="Pooja Sharma",
            owner_contact="+919811223344",
            registered_rto="GJ-05 Surat",
            reporting_police_station="Surat City Central Police Station",
            fir_number="FIR-402/2026/SURAT",
            reported_at=now - timedelta(days=3),
            notes="Vehicle reported stolen from Varachha road market parking.",
            recommended_action="🚨 ALERT: INTERCEPT IMMEDIATELY. Vehicle reported stolen. Notify local police control room."
        )

        v3 = Vehicle(
            id=str(uuid.uuid4()),
            registration_number="MH12CD5678",
            vehicle_type=VehicleType.SUV,
            manufacturer="Mahindra",
            model="XUV700 AX7",
            color="Midnight Black",
            status=VehicleStatus.CLEAR,
            risk_level=RiskLevel.NONE,
            owner_name="Vikramaditya Shinde",
            owner_contact="+919765432109",
            registered_rto="MH-12 Pune",
            notes="Commercial IT transport vehicle with valid permits.",
            recommended_action="Clear for passage."
        )

        v4 = Vehicle(
            id=str(uuid.uuid4()),
            registration_number="DL01EF9012",
            vehicle_type=VehicleType.SEDAN,
            manufacturer="Maruti Suzuki",
            model="Dzire VXI",
            color="Pacific Blue",
            status=VehicleStatus.CLEAR,
            risk_level=RiskLevel.NONE,
            owner_name="Harish Verma",
            owner_contact="+919899001122",
            registered_rto="DL-01 Delhi North",
            notes="Authorized taxi cab.",
            recommended_action="Clear for passage."
        )

        v5 = Vehicle(
            id=str(uuid.uuid4()),
            registration_number="KA03GH3456",
            vehicle_type=VehicleType.SUV,
            manufacturer="Tata",
            model="Harrier Dark Edition",
            color="Oberon Black",
            status=VehicleStatus.SUSPECTED_CRIME,
            risk_level=RiskLevel.CRITICAL,
            owner_name="Sanjay Hegde",
            owner_contact="+919448877665",
            registered_rto="KA-03 Bengaluru East",
            reporting_police_station="Indiranagar PS, Bengaluru",
            fir_number="FIR-918/2026/BLR",
            reported_at=now - timedelta(days=1),
            notes="Vehicle suspected in high-speed hit-and-run on Outer Ring Road.",
            recommended_action="🚨 CRITICAL: High-risk suspect vehicle. Do not engage alone; deploy road spikes if fleeing."
        )

        v6 = Vehicle(
            id=str(uuid.uuid4()),
            registration_number="DL04JK9988",
            vehicle_type=VehicleType.MOTORCYCLE,
            manufacturer="Royal Enfield",
            model="Classic 350",
            color="Gunmetal Grey",
            status=VehicleStatus.TRAFFIC_VIOLATION,
            risk_level=RiskLevel.MEDIUM,
            owner_name="Aman Gupta",
            owner_contact="+919810998877",
            registered_rto="DL-04 Delhi West",
            notes="6 unpaid speed violation challans; license suspension notice served.",
            recommended_action="Collect pending dues / issue seizure memo."
        )

        v7 = Vehicle(
            id=str(uuid.uuid4()),
            registration_number="GJ18PQ4521",
            vehicle_type=VehicleType.SUV,
            manufacturer="Tata",
            model="Nexon EV Max",
            color="Intensi-Teal",
            status=VehicleStatus.CLEAR,
            risk_level=RiskLevel.NONE,
            owner_name="Mehul Mehta",
            owner_contact="+919825012345",
            registered_rto="GJ-18 Gandhinagar",
            notes="Electric green number plate, zero emissions.",
            recommended_action="Clear for passage."
        )

        v8 = Vehicle(
            id=str(uuid.uuid4()),
            registration_number="22BH1234AA",
            vehicle_type=VehicleType.SUV,
            manufacturer="Hyundai",
            model="Creta SX",
            color="Typhoon Silver",
            status=VehicleStatus.CLEAR,
            risk_level=RiskLevel.NONE,
            owner_name="Col. Arvind Deshmukh",
            owner_contact="+919833445566",
            registered_rto="BH Central Defence Registry",
            notes="Bharat series inter-state official vehicle.",
            recommended_action="Clear for passage."
        )

        vehicles_list = [v1, v2, v3, v4, v5, v6, v7, v8]
        db.add_all(vehicles_list)
        db.commit()

        print("[INFO] Seeding chronological observation timeline events...")
        # 3. Seed Observations / Sightings
        # Movement timeline for stolen vehicle GJ05XY7865 across Gujarat
        det_stolen_1 = DetectionEvent(
            id=str(uuid.uuid4()),
            vehicle_id=v2.id,
            registration_number="GJ05XY7865",
            ocr_confidence=0.96,
            plate_detection_confidence=0.94,
            latitude=23.0225,
            longitude=72.5714,
            location_name="Ahmedabad SG Highway Checkpoint",
            source_device_id="CAM_AHM_04",
            created_by_user_id=officer_user.id,
            detected_at=now - timedelta(hours=4, minutes=20)
        )

        det_stolen_2 = DetectionEvent(
            id=str(uuid.uuid4()),
            vehicle_id=v2.id,
            registration_number="GJ05XY7865",
            ocr_confidence=0.94,
            plate_detection_confidence=0.91,
            latitude=23.2156,
            longitude=72.6369,
            location_name="Gandhinagar Infocity Toll Gate",
            source_device_id="CAM_GNR_01",
            created_by_user_id=officer_user.id,
            detected_at=now - timedelta(hours=2, minutes=45)
        )

        det_stolen_3 = DetectionEvent(
            id=str(uuid.uuid4()),
            vehicle_id=v2.id,
            registration_number="GJ05XY7865",
            ocr_confidence=0.98,
            plate_detection_confidence=0.95,
            latitude=23.5880,
            longitude=72.3693,
            location_name="Mehsana North Radial Junction",
            source_device_id="MOBILE_SCANNER_104",
            created_by_user_id=officer_user.id,
            detected_at=now - timedelta(minutes=55)
        )

        # Observation for hit-and-run vehicle KA03GH3456
        det_suspect = DetectionEvent(
            id=str(uuid.uuid4()),
            vehicle_id=v5.id,
            registration_number="KA03GH3456",
            ocr_confidence=0.92,
            plate_detection_confidence=0.89,
            latitude=13.0358,
            longitude=77.5970,
            location_name="Hebbal Flyover Checkpoint, Bengaluru",
            source_device_id="MOBILE_SCANNER_002",
            created_by_user_id=officer_user.id,
            detected_at=now - timedelta(hours=3, minutes=10)
        )

        # Routine clean observations
        det_clean_1 = DetectionEvent(
            id=str(uuid.uuid4()),
            vehicle_id=v1.id,
            registration_number="GJ01AB1234",
            ocr_confidence=0.97,
            plate_detection_confidence=0.96,
            latitude=23.0338,
            longitude=72.5850,
            location_name="Ashram Road, Ahmedabad",
            source_device_id="MOBILE_SCANNER_104",
            created_by_user_id=officer_user.id,
            detected_at=now - timedelta(hours=1, minutes=15)
        )

        det_clean_2 = DetectionEvent(
            id=str(uuid.uuid4()),
            vehicle_id=v3.id,
            registration_number="MH12CD5678",
            ocr_confidence=0.95,
            plate_detection_confidence=0.92,
            latitude=18.7538,
            longitude=73.4077,
            location_name="Mumbai-Pune Expressway Toll Plaza",
            source_device_id="CAM_PUN_08",
            created_by_user_id=officer_user.id,
            detected_at=now - timedelta(hours=5)
        )

        db.add_all([det_stolen_1, det_stolen_2, det_stolen_3, det_suspect, det_clean_1, det_clean_2])
        db.commit()

        print("[INFO] Seeding active security alerts...")
        # 4. Seed Alerts
        alert_stolen = Alert(
            id=str(uuid.uuid4()),
            vehicle_id=v2.id,
            detection_event_id=det_stolen_3.id,
            alert_type="ALERT_STOLEN_VEHICLE",
            severity=AlertSeverity.CRITICAL,
            status=AlertStatus.ACTIVE,
            title="🚨 STOLEN VEHICLE SIGHTED: GJ05XY7865",
            description="Stolen Hyundai i20 sighted at Mehsana North Radial Junction. Moving northbound.",
            recommended_action="Coordinate with Mehsana Highway Patrol to establish roadblock."
        )

        alert_suspect = Alert(
            id=str(uuid.uuid4()),
            vehicle_id=v5.id,
            detection_event_id=det_suspect.id,
            alert_type="ALERT_SUSPECTED_CRIME",
            severity=AlertSeverity.HIGH,
            status=AlertStatus.ACTIVE,
            title="⚠️ CRIME SUSPECT VEHICLE: KA03GH3456",
            description="Vehicle wanted in hit-and-run FIR-918/2026 spotted at Hebbal Flyover.",
            recommended_action="Intercept and verify driver license & chassis number."
        )

        db.add_all([alert_stolen, alert_suspect])
        db.commit()

        print("[SUCCESS] VehicleShield database seeded successfully with test records!")
    except Exception as e:
        print(f"[ERROR] Database seeding error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
