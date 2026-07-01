from fastapi import APIRouter, Depends, Query

from app.api.auth import get_current_user
from app.services import mock_data as m

router = APIRouter(prefix="/api/v1/operations", tags=["闭环任务中心"])


@router.get("/work-orders")
def get_work_orders(status: str = Query("all"), _=Depends(get_current_user)):
    if status == "all":
        return m.work_orders
    return [o for o in m.work_orders if o["status"] == status]
