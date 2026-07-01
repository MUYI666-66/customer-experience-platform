from fastapi import APIRouter, Depends, HTTPException

from app.api.auth import get_current_user
from app.schemas.auth import UserInfo
from app.services import mock_data as m

router = APIRouter(prefix="/api/v1/admin", tags=["系统管理"])


def require_admin(user: UserInfo = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return user


@router.get("/data-sources")
def get_data_sources(_=Depends(require_admin)):
    return m.data_sources


@router.get("/features")
def get_features(_=Depends(require_admin)):
    return m.features


@router.get("/model-versions")
def get_model_versions(_=Depends(require_admin)):
    return m.model_versions
