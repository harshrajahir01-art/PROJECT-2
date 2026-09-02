from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.user import User
from app.models.alert import Alert, AlertStatus, AlertSeverity
from app.schemas.alert import AlertResponse, AlertUpdate
from app.core.audit_logger import log_audit_event
from app.api.deps import get_current_user, get_current_operator_or_admin

router = APIRouter()

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    status: Optional[AlertStatus] = Query(None),
    severity: Optional[AlertSeverity] = Query(None),
    limit: int = 50,
    skip: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Alert)
    if status:
        q = q.filter(Alert.status == status)
    if severity:
        q = q.filter(Alert.severity == severity)

    alerts = q.order_by(desc(Alert.created_at)).offset(skip).limit(limit).all()

    results = []
    for a in alerts:
        v = a.vehicle
        d = a.detection_event
        results.append(AlertResponse(
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
    return results

@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert_status(
    alert_id: str,
    payload: AlertUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_operator_or_admin)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    old_status = alert.status
    alert.status = payload.status
    if payload.resolution_notes:
        alert.resolution_notes = payload.resolution_notes
    if payload.status == AlertStatus.RESOLVED:
        alert.resolved_at = datetime.utcnow()
        alert.assigned_to_user_id = current_user.id

    db.commit()
    db.refresh(alert)

    log_audit_event(
        db=db,
        action="UPDATE_ALERT_STATUS",
        user_id=current_user.id,
        resource_type="ALERT",
        resource_id=alert.id,
        ip_address=request.client.host if request.client else None,
        details={
            "old_status": old_status.value,
            "new_status": alert.status.value,
            "notes": payload.resolution_notes
        }
    )

    v = alert.vehicle
    d = alert.detection_event
    return AlertResponse(
        id=alert.id,
        vehicle_id=alert.vehicle_id,
        detection_event_id=alert.detection_event_id,
        alert_type=alert.alert_type,
        severity=alert.severity,
        status=alert.status,
        title=alert.title,
        description=alert.description,
        recommended_action=alert.recommended_action,
        assigned_to_user_id=alert.assigned_to_user_id,
        resolution_notes=alert.resolution_notes,
        created_at=alert.created_at,
        resolved_at=alert.resolved_at,
        registration_number=v.registration_number if v else None,
        vehicle_status=v.status if v else None,
        risk_level=v.risk_level if v else None,
        location_name=d.location_name if d else None,
        latitude=d.latitude if d else None,
        longitude=d.longitude if d else None
    )
