from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "满意度评价运营平台"
    SECRET_KEY: str = "satisfaction-eval-secret-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    DATABASE_URL: str = "sqlite:///./data/satisfaction.db"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"


settings = Settings()
