from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.detection import DetectionEventResponse
from app.schemas.alert import AlertResponse

class DailyStats(BaseModel):
    date: str
    scans_count: int
    flagged_count: int

class DashboardStatistics(BaseModel):
    total_vehicles_registered: int
    total_detections_logged: int
    total_flagged_vehicles: int
    active_alerts_count: int
    resolved_alerts_count: int
    average_ocr_confidence: float
    today_detections_count: int
    today_flagged_count: int
    
    daily_trends: List[DailyStats]
    recent_detections: List[DetectionEventResponse]
    active_alerts: List[AlertResponse]
    risk_distribution: Dict[str, int]
