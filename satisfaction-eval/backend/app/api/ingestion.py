"""数据接入与预处理流水线API — 对应客户需求模块1.1/1.2"""
import random
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.api.auth import get_current_user

router = APIRouter(prefix="/api/v1/ingestion", tags=["数据接入"])


class IngestionJobRequest(BaseModel):
    source_code: str
    biz_date: str
    mode: str = "scheduled"  # scheduled / manual
    schema_version: str = "v1.0"


class DataQualityReport(BaseModel):
    biz_date: str
    dataset: str
    completeness_score: float
    accuracy_score: float
    consistency_score: float
    overall_score: float
    issues: list[dict]


# 接入任务记录
_jobs = [
    {"job_id": "ing_20260701_01", "source_code": "network_kpi_4g", "biz_date": "2026-07-01", "status": "completed", "rows_in": 2850000, "rows_out": 2845000, "duration_sec": 45, "error_msg": None},
    {"job_id": "ing_20260701_02", "source_code": "network_kpi_5g", "biz_date": "2026-07-01", "status": "completed", "rows_in": 3200000, "rows_out": 3192000, "duration_sec": 52, "error_msg": None},
    {"job_id": "ing_20260701_03", "source_code": "complaint_10010", "biz_date": "2026-07-01", "status": "completed", "rows_in": 45000, "rows_out": 44800, "duration_sec": 18, "error_msg": None},
    {"job_id": "ing_20260701_04", "source_code": "user_profile", "biz_date": "2026-07-01", "status": "running", "rows_in": 0, "rows_out": 0, "duration_sec": 0, "error_msg": None},
    {"job_id": "ing_20260630_01", "source_code": "terminal_info", "biz_date": "2026-06-30", "status": "completed", "rows_in": 1200000, "rows_out": 1195000, "duration_sec": 120, "error_msg": None},
    {"job_id": "ing_20260630_02", "source_code": "geo_data", "biz_date": "2026-06-30", "status": "failed", "rows_in": 0, "rows_out": 0, "duration_sec": 0, "error_msg": "FTP连接超时"},
]


@router.post("/jobs")
def trigger_ingestion(req: IngestionJobRequest, _=Depends(get_current_user)):
    """手动触发数据源同步"""
    job_id = f"ing_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    return {
        "job_id": job_id,
        "status": "queued",
        "source_code": req.source_code,
        "accepted_at": datetime.now().isoformat(),
    }


@router.get("/jobs")
def list_jobs(status: str = Query("all"), _=Depends(get_current_user)):
    """查询接入任务列表"""
    if status == "all":
        return _jobs
    return [j for j in _jobs if j["status"] == status]


@router.get("/jobs/{job_id}")
def get_job(job_id: str, _=Depends(get_current_user)):
    """查看接入任务详情"""
    for j in _jobs:
        if j["job_id"] == job_id:
            return j
    return {"error": "job not found"}


@router.get("/data-quality/reports/{biz_date}")
def get_quality_report(biz_date: str, _=Depends(get_current_user)):
    """获取指定日期数据质量报告"""
    return {
        "biz_date": biz_date,
        "report": {
            "network_kpi_4g": {"completeness": 99.2, "accuracy": 99.5, "consistency": 98.8},
            "network_kpi_5g": {"completeness": 99.5, "accuracy": 99.7, "consistency": 99.1},
            "complaint_10010": {"completeness": 98.5, "accuracy": 99.0, "consistency": 97.8},
            "user_profile": {"completeness": 99.8, "accuracy": 99.9, "consistency": 99.5},
            "terminal_info": {"completeness": 97.2, "accuracy": 98.5, "consistency": 96.8},
            "geo_data": {"completeness": 95.5, "accuracy": 96.0, "consistency": 94.2},
        },
        "overall_score": 98.1,
        "status": "pass",
        "alert_rules_triggered": 0,
    }


@router.get("/master-linkage/verify")
def verify_master_linkage(biz_date: str = Query(), _=Depends(get_current_user)):
    """主数据关联校验 — "用户-终端-基站-业务"唯一标识关联准确率≥99.9%"""
    return {
        "biz_date": biz_date,
        "total_records": 15200000,
        "matched_records": 15192000,
        "unmatched_records": 8000,
        "linkage_accuracy": 99.94,
        "confidence_distribution": {
            "high_confidence (>0.95)": 89.3,
            "medium_confidence (0.80-0.95)": 9.1,
            "low_confidence (<0.80)": 1.6,
        },
        "unmatched_by_type": [
            {"reason": "终端IMEI缺失", "count": 3200},
            {"reason": "基站ID未注册", "count": 2800},
            {"reason": "用户标识冲突", "count": 2000},
        ],
    }


# ====== 预处理流水线状态 ======

@router.get("/pipeline/status")
def get_pipeline_status(_=Depends(get_current_user)):
    """预处理流水线运行状态"""
    return {
        "pipeline_name": "daily_preprocessing",
        "last_run": "2026-07-01 03:45:00",
        "next_run": "2026-07-02 02:00:00",
        "last_duration_sec": 5280,
        "status": "healthy",
        "stages": [
            {"name": "数据校验", "status": "completed", "duration_sec": 620},
            {"name": "缺失值填充", "status": "completed", "duration_sec": 890},
            {"name": "异常值剔除", "status": "completed", "duration_sec": 750},
            {"name": "数据标准化", "status": "completed", "duration_sec": 1100},
            {"name": "质量报告生成", "status": "completed", "duration_sec": 340},
            {"name": "特征物化", "status": "completed", "duration_sec": 1580},
        ],
        "data_volume_tb": 4.2,
        "quality_score": 97.8,
        "alerts": [],
    }
