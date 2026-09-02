from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.user import User, UserRole
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    limit: int = 100,
    skip: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    if resource_type:
        q = q.filter(AuditLog.resource_type == resource_type)

    logs = q.order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit).all()

    results = []
    for l in logs:
        u = l.user
        results.append(AuditLogResponse(
            id=l.id,
            user_id=l.user_id,
            user_email=u.email if u else None,
            user_name=u.full_name if u else None,
            action=l.action,
            resource_type=l.resource_type,
            resource_id=l.resource_id,
            ip_address=l.ip_address,
            user_agent=l.user_agent,
            details=l.details,
            timestamp=l.timestamp
        ))
    return results
