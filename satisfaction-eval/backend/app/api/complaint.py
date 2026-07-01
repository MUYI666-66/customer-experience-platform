from fastapi import APIRouter, Depends

from app.api.auth import get_current_user
from app.services import mock_data as m

router = APIRouter(prefix="/api/v1/complaint", tags=["投诉风险预警"])


@router.get("/alerts")
def get_complaint_alerts(_=Depends(get_current_user)):
    return m.complaint_alerts
