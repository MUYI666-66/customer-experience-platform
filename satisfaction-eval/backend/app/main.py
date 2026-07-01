from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import (
    auth, overview, dissatisfaction, survey, complaint,
    operations, cases, admin, predict, ingestion, features, alerts, reports,
)

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 模块1: 基础支撑
app.include_router(ingestion.router)     # 数据接入与预处理
app.include_router(features.router)      # 特征工程

# 模块2: AI预测模型
app.include_router(predict.router)       # 三大模型推理

# 模块3: 运营平台
app.include_router(auth.router)          # 认证
app.include_router(overview.router)      # 首页总览
app.include_router(dissatisfaction.router)  # 不满意用户监控
app.include_router(survey.router)        # 易受访用户运营
app.include_router(complaint.router)     # 投诉风险预警
app.include_router(operations.router)    # 闭环任务中心
app.include_router(cases.router)         # 案例库
app.include_router(alerts.router)        # 告警系统
app.include_router(reports.router)       # 报表中心
app.include_router(admin.router)         # 系统管理


@app.get("/api/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME}
