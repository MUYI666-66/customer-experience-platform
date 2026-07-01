from fastapi import APIRouter, Depends, Query

from app.api.auth import get_current_user
from app.services import mock_data as m

router = APIRouter(prefix="/api/v1/dissatisfaction", tags=["不满意用户监控"])


@router.get("/risk-users")
def get_risk_users(risk_level: str = Query("all"), _=Depends(get_current_user)):
    if risk_level == "all":
        return m.risk_users
    return [u for u in m.risk_users if u["riskLevel"] == risk_level]


@router.get("/model-accuracy-trend")
def get_model_accuracy_trend(_=Depends(get_current_user)):
    return m.model_accuracy_trend
