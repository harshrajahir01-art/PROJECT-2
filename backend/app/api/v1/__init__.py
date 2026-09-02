from fastapi import APIRouter
from app.api.v1 import auth, scan, vehicles, detections, alerts, dashboard, audit

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(scan.router, prefix="/scan", tags=["Vehicle Scan & OCR"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicle Registry"])
api_router.include_router(detections.router, prefix="/detections", tags=["Detection Events"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Security Alerts"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard Analytics"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit Logs"])
