from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from app.config import settings
from app.schemas.auth import LoginRequest, TokenResponse, UserInfo
from app.services.mock_data import users_db

router = APIRouter(prefix="/api/v1/auth", tags=["认证"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInfo:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None or user_id not in users_db:
            raise HTTPException(status_code=401, detail="无效的认证凭证")
        u = users_db[user_id]
        return UserInfo(id=u["id"], name=u["name"], role=u["role"], region=u["region"])
    except JWTError:
        raise HTTPException(status_code=401, detail="无效的认证凭证")


@router.post("/token", response_model=TokenResponse)
def login(body: LoginRequest):
    u = users_db.get(body.username)
    if not u or body.password != u["password"]:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = create_token({"sub": u["id"], "role": u["role"]})
    return TokenResponse(access_token=token, token_type="bearer")


@router.get("/me", response_model=UserInfo)
def me(user: UserInfo = Depends(get_current_user)):
    return user
