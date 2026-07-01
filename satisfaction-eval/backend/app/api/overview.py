from fastapi import APIRouter, Depends

from app.api.auth import get_current_user
from app.services import mock_data as m

router = APIRouter(prefix="/api/v1/overview", tags=["首页总览"])


@router.get("/kpi-cards")
def get_kpi_cards(_=Depends(get_current_user)):
    return m.kpi_cards


@router.get("/risk-trend")
def get_risk_trend(_=Depends(get_current_user)):
    return m.risk_trend


@router.get("/complaint-trend")
def get_complaint_trend(_=Depends(get_current_user)):
    return m.complaint_trend


@router.get("/region-risk")
def get_region_risk(_=Depends(get_current_user)):
    return m.region_risk


@router.get("/root-cause")
def get_root_cause(_=Depends(get_current_user)):
    return m.root_cause


@router.get("/model-metrics")
def get_model_metrics(_=Depends(get_current_user)):
    return m.model_metrics
