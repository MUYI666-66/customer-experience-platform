from fastapi import APIRouter, Depends

from app.api.auth import get_current_user
from app.services import mock_data as m

router = APIRouter(prefix="/api/v1/cases", tags=["案例库"])


@router.get("/")
def get_cases(_=Depends(get_current_user)):
    return m.case_items
