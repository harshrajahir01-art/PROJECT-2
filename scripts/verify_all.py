import urllib.request
import json
import base64
import cv2
import numpy as np

def test_api():
    base_url = "http://127.0.0.1:8000/api/v1"
    print("==================================================")
    print("RUNNING AUTOMATED VERIFICATION SUITE")
    print("==================================================")

    # 1. Test States
    req = urllib.request.urlopen(f"{base_url}/rto/states")
    states = json.loads(req.read())
    print(f"[PASS] States & UTs Loaded: {len(states)} jurisdictions")
    assert len(states) == 36, f"Expected 36 states/UTs, got {len(states)}"

    # 2. Test Gujarat RTO listing
    req = urllib.request.urlopen(f"{base_url}/rto/states/GJ")
    gj = json.loads(req.read())
    print(f"[PASS] State Detail for Gujarat (GJ): {gj['name']}, Total RTOs: {len(gj['rto_offices'])}")
    assert len(gj['rto_offices']) >= 38, "Expected at least 38 RTOs for Gujarat"

    # 3. Test RTO Lookup
    req = urllib.request.urlopen(f"{base_url}/rto/office/GJ-01")
    rto = json.loads(req.read())
    print(f"[PASS] Office Lookup GJ-01: {rto['city']} ({rto['district']})")
    assert "Ahmedabad" in rto['city']

    # 4. Test Search (Reverse lookup "Ahmedabad")
    req = urllib.request.urlopen(f"{base_url}/rto/search?q=Ahmedabad")
    results = json.loads(req.read())
    print(f"[PASS] Reverse Search for 'Ahmedabad': Found {len(results)} matches, Top match: {results[0]['code']}")
    assert any(r['code'] == 'GJ-01' for r in results)

    # 5. Test Plate Types
    req = urllib.request.urlopen(f"{base_url}/rto/plate-types")
    plates = json.loads(req.read())
    print(f"[PASS] Plate Categories: Found {len(plates)} distinct official types")
    assert len(plates) >= 8

    # 6. Test Decoder Standard
    payload = json.dumps({"registration_number": "GJ-18-AB-1234"}).encode('utf-8')
    req = urllib.request.Request(f"{base_url}/rto/decode", data=payload, headers={"Content-Type": "application/json"})
    res = urllib.request.urlopen(req)
    dec = json.loads(res.read())
    print(f"[PASS] Decoded Standard Plate: {dec['normalized']} -> State: {dec['state_name']}, District: {dec['district']}")
    assert dec['state_code'] == 'GJ' and dec['district'] == 'Gandhinagar'

    # 7. Test Decoder BH Series
    payload = json.dumps({"registration_number": "24 BH 1234 AA"}).encode('utf-8')
    req = urllib.request.Request(f"{base_url}/rto/decode", data=payload, headers={"Content-Type": "application/json"})
    res = urllib.request.urlopen(req)
    dec_bh = json.loads(res.read())
    print(f"[PASS] Decoded BH-Series: {dec_bh['normalized']} -> {dec_bh['format_type']}")
    assert dec_bh['format_type'] == 'BH_SERIES'

    # 8. Test Photo Scan & Database Auto-Registration
    test_plate = "GJ05XY9922"
    img = np.zeros((150, 420, 3), dtype=np.uint8)
    img[:] = (255, 255, 255)
    cv2.rectangle(img, (10, 10), (410, 140), (0, 0, 0), 4)
    cv2.putText(img, test_plate, (25, 95), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 0), 4)
    _, buf = cv2.imencode('.jpg', img)
    b64 = base64.b64encode(buf).decode('utf-8')

    scan_payload = json.dumps({
        "image_base64": f"data:image/jpeg;base64,{b64}",
        "location_name": "Automated Test Toll"
    }).encode('utf-8')

    req = urllib.request.Request(f"{base_url}/scan/base64", data=scan_payload, headers={"Content-Type": "application/json"})
    res = urllib.request.urlopen(req)
    scan_res = json.loads(res.read())
    print(f"[PASS] Photo OCR Scan Result: Success={scan_res['success']}, Plate={scan_res['registration_number']}, Saved={scan_res['saved_to_registry']}")
    assert scan_res['success'] is True
    assert scan_res['saved_to_registry'] is True

    # 9. Verify direct persistence in Database
    from app.database import SessionLocal
    from app.models.vehicle import Vehicle
    from app.models.detection import DetectionEvent
    db = SessionLocal()
    try:
        v = db.query(Vehicle).filter(Vehicle.registration_number == test_plate).first()
        assert v is not None, "Vehicle was not persisted in database!"
        print(f"[PASS] SQLite Database Verification: Vehicle {v.registration_number} status={v.status.value}, type={v.vehicle_type.value} verified in DB!")

        ev = db.query(DetectionEvent).filter(DetectionEvent.registration_number == test_plate).first()
        assert ev is not None, "Detection event was not persisted!"
        print(f"[PASS] SQLite Detection Event: Event ID {ev.id} recorded at {ev.location_name}!")
    finally:
        db.close()

    print("==================================================")
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY (100% PASS)")
    print("==================================================")

if __name__ == "__main__":
    test_api()
