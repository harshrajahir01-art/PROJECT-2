import os
import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.seed.seed_data import seed_database

class TestVehicleShieldAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        seed_database()
        cls.client = TestClient(app)

    def test_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "HEALTHY")
        self.assertEqual(data["service"], "VehicleShield")

    def test_login_success(self):
        res = self.client.post("/api/v1/auth/login", json={
            "email": "officer@vehicleshield.gov",
            "password": "Officer@1234"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["email"], "officer@vehicleshield.gov")
        self.assertEqual(data["user"]["role"], "OPERATOR")

    def test_login_invalid_password(self):
        res = self.client.post("/api/v1/auth/login", json={
            "email": "officer@vehicleshield.gov",
            "password": "WrongPassword"
        })
        self.assertEqual(res.status_code, 401)

    def test_manual_check_clear_vehicle(self):
        # 1. Login
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "officer@vehicleshield.gov",
            "password": "Officer@1234"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Check GJ01AB1234
        res = self.client.post("/api/v1/vehicles/check", json={
            "registration_number": "GJ01AB1234",
            "location_name": "Test Checkpoint",
            "latitude": 23.0225,
            "longitude": 72.5714
        }, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["found"])
        self.assertEqual(data["vehicle"]["registration_number"], "GJ01AB1234")
        self.assertEqual(data["vehicle"]["status"], "CLEAR")
        self.assertFalse(data["is_flagged"])

    def test_manual_check_stolen_vehicle(self):
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "officer@vehicleshield.gov",
            "password": "Officer@1234"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Check GJ05XY7865 (Stolen)
        res = self.client.post("/api/v1/vehicles/check", json={
            "registration_number": "GJ05XY7865"
        }, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["found"])
        self.assertEqual(data["vehicle"]["status"], "STOLEN")
        self.assertEqual(data["vehicle"]["risk_level"], "HIGH")
        self.assertTrue(data["is_flagged"])

    def test_vehicle_timeline(self):
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "officer@vehicleshield.gov",
            "password": "Officer@1234"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = self.client.get("/api/v1/vehicles/GJ05XY7865/timeline", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["registration_number"], "GJ05XY7865")
        self.assertGreaterEqual(data["total_sightings"], 1)
        self.assertIsInstance(data["observation_timeline"], list)

    def test_dashboard_statistics(self):
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "admin@vehicleshield.gov",
            "password": "Admin@1234"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = self.client.get("/api/v1/dashboard/statistics", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["total_vehicles_registered"], 5)
        self.assertGreaterEqual(data["total_flagged_vehicles"], 2)
        self.assertIn("risk_distribution", data)
        self.assertIn("daily_trends", data)

    def test_scan_image_endpoint(self):
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "officer@vehicleshield.gov",
            "password": "Officer@1234"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        test_img_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "test_images", "plate_clear_honda.jpg")
        if os.path.exists(test_img_path):
            with open(test_img_path, "rb") as f:
                res = self.client.post(
                    "/api/v1/scan",
                    files={"file": ("test_plate.jpg", f, "image/jpeg")},
                    data={"location_name": "Field Intercept Highway 10", "latitude": "23.01", "longitude": "72.58"},
                    headers=headers
                )
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertTrue(data["success"])
                self.assertEqual(data["registration_number"], "GJ01AB1234")
                self.assertEqual(data["status"], "CLEAR")

if __name__ == "__main__":
    unittest.main()
