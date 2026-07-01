from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserInfo(BaseModel):
    id: str
    name: str
    role: str
    region: str
