from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.analytics_service import get_analytics_data
from app.schemas.analytics import AnalyticsOverviewResponse

router = APIRouter()

@router.get("/analytics/overview", response_model=AnalyticsOverviewResponse)
def analytics_overview(db: Session = Depends(get_db)):
    return get_analytics_data(db)
