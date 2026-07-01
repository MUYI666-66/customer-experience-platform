from fastapi import APIRouter, Depends, Query

from app.api.auth import get_current_user
from app.services import mock_data as m

router = APIRouter(prefix="/api/v1/survey", tags=["易受访用户运营"])


@router.get("/users")
def get_survey_users(level: str = Query("all"), _=Depends(get_current_user)):
    if level == "all":
        return m.survey_users
    return [u for u in m.survey_users if level in u["level"]]


@router.get("/hit-rate-trend")
def get_hit_rate_trend(_=Depends(get_current_user)):
    return m.hit_rate_trend
