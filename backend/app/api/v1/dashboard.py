from datetime import datetime, timedelta
from typing import Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleStatus, RiskLevel
from app.models.detection import DetectionEvent
from app.models.alert import Alert, AlertStatus
from app.schemas.dashboard import DashboardStatistics, DailyStats
from app.schemas.detection import DetectionEventResponse
from app.schemas.alert import AlertResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/statistics", response_model=DashboardStatistics)
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_vehicles = db.query(func.count(Vehicle.id)).scalar() or 0
    total_detections = db.query(func.count(DetectionEvent.id)).scalar() or 0
    
    flagged_vehicles = db.query(func.count(Vehicle.id)).filter(
        Vehicle.status.in_([VehicleStatus.STOLEN, VehicleStatus.SUSPECTED_CRIME, VehicleStatus.WANTED, VehicleStatus.TRAFFIC_VIOLATION])
    ).scalar() or 0

    active_alerts = db.query(func.count(Alert.id)).filter(Alert.status == AlertStatus.ACTIVE).scalar() or 0
    resolved_alerts = db.query(func.count(Alert.id)).filter(Alert.status == AlertStatus.RESOLVED).scalar() or 0

    avg_conf = db.query(func.avg(DetectionEvent.ocr_confidence)).scalar() or 0.88

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_detections = db.query(func.count(DetectionEvent.id)).filter(
        DetectionEvent.detected_at >= today_start
    ).scalar() or 0

    today_flagged = db.query(func.count(Alert.id)).filter(
        Alert.created_at >= today_start
    ).scalar() or 0

    # Risk distribution
    risk_counts = {}
    for risk in RiskLevel:
        cnt = db.query(func.count(Vehicle.id)).filter(Vehicle.risk_level == risk).scalar() or 0
        risk_counts[risk.value] = cnt

    # Daily trends (last 7 days)
    daily_trends = []
    for i in range(6, -1, -1):
        day_date = (datetime.utcnow() - timedelta(days=i)).date()
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())
        
        scans_c = db.query(func.count(DetectionEvent.id)).filter(
            DetectionEvent.detected_at >= day_start,
            DetectionEvent.detected_at <= day_end
        ).scalar() or 0

        flagged_c = db.query(func.count(Alert.id)).filter(
            Alert.created_at >= day_start,
            Alert.created_at <= day_end
        ).scalar() or 0

        daily_trends.append(DailyStats(
            date=day_date.strftime("%b %d"),
            scans_count=scans_c,
            flagged_count=flagged_c
        ))

    # Recent detections
    recent_dets = db.query(DetectionEvent).order_by(
        desc(DetectionEvent.detected_at)
    ).limit(8).all()
    
    recent_dets_res = []
    for d in recent_dets:
        v = d.vehicle
        recent_dets_res.append(DetectionEventResponse(
            id=d.id,
            vehicle_id=d.vehicle_id,
            registration_number=d.registration_number,
            ocr_confidence=d.ocr_confidence,
            plate_detection_confidence=d.plate_detection_confidence,
            image_path=d.image_path,
            plate_crop_path=f"/uploads/{d.plate_crop_path}" if d.plate_crop_path else None,
            latitude=d.latitude,
            longitude=d.longitude,
            location_name=d.location_name,
            source_device_id=d.source_device_id,
            created_by_user_id=d.created_by_user_id,
            detected_at=d.detected_at,
            created_at=d.created_at,
            vehicle_status=v.status if v else None,
            risk_level=v.risk_level if v else None,
            vehicle_type=v.vehicle_type if v else None,
            manufacturer=v.manufacturer if v else None,
            model=v.model if v else None,
            color=v.color if v else None
        ))

    # Active alerts list
    active_alerts_db = db.query(Alert).filter(
        Alert.status.in_([AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED])
    ).order_by(desc(Alert.created_at)).limit(6).all()

    active_alerts_res = []
    for a in active_alerts_db:
        v = a.vehicle
        d = a.detection_event
        active_alerts_res.append(AlertResponse(
            id=a.id,
            vehicle_id=a.vehicle_id,
            detection_event_id=a.detection_event_id,
            alert_type=a.alert_type,
            severity=a.severity,
            status=a.status,
            title=a.title,
            description=a.description,
            recommended_action=a.recommended_action,
            assigned_to_user_id=a.assigned_to_user_id,
            resolution_notes=a.resolution_notes,
            created_at=a.created_at,
            resolved_at=a.resolved_at,
            registration_number=v.registration_number if v else None,
            vehicle_status=v.status if v else None,
            risk_level=v.risk_level if v else None,
            location_name=d.location_name if d else None,
            latitude=d.latitude if d else None,
            longitude=d.longitude if d else None
        ))

    return DashboardStatistics(
        total_vehicles_registered=total_vehicles,
        total_detections_logged=total_detections,
        total_flagged_vehicles=flagged_vehicles,
        active_alerts_count=active_alerts,
        resolved_alerts_count=resolved_alerts,
        average_ocr_confidence=round(float(avg_conf), 3),
        today_detections_count=today_detections,
        today_flagged_count=today_flagged,
        daily_trends=daily_trends,
        recent_detections=recent_dets_res,
        active_alerts=active_alerts_res,
        risk_distribution=risk_counts
    )
