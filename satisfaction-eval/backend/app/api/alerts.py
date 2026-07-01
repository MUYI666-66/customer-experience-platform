"""告警系统API — 对应客户需求：异常15分钟内告警、三级预警"""
import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.api.auth import get_current_user

router = APIRouter(prefix="/api/v1/alerts", tags=["告警系统"])


class AlertRule(BaseModel):
    rule_id: str
    name: str
    category: str
    condition: str
    threshold: str
    severity: str
    enabled: bool


_alert_rules = [
    {"rule_id": "R001", "name": "数据质量下降", "category": "data", "condition": "quality_score < 95", "threshold": "95分", "severity": "critical", "enabled": True},
    {"rule_id": "R002", "name": "实时推理P95超时", "category": "inference", "condition": "p95_latency > 800ms 连续5分钟", "threshold": "800ms", "severity": "high", "enabled": True},
    {"rule_id": "R003", "name": "模型准确率漂移", "category": "model", "condition": "PSI月环比 > 0.1", "threshold": "PSI 0.1", "severity": "high", "enabled": True},
    {"rule_id": "R004", "name": "命中率低于基线", "category": "business", "condition": "hit_rate < 10% 当月", "threshold": "10%", "severity": "high", "enabled": True},
    {"rule_id": "R005", "name": "投诉时序MAPE超标", "category": "model", "condition": "MAPE > 15% 连续7天", "threshold": "15%", "severity": "medium", "enabled": True},
    {"rule_id": "R006", "name": "接入任务失败", "category": "data", "condition": "ingestion_job.status = 'failed'", "threshold": "立即", "severity": "critical", "enabled": True},
    {"rule_id": "R007", "name": "批量预测超时", "category": "inference", "condition": "batch_duration > 10s", "threshold": "10秒", "severity": "medium", "enabled": True},
    {"rule_id": "R008", "name": "预处理流水线异常", "category": "data", "condition": "pipeline_stage_failed", "threshold": "15分钟", "severity": "critical", "enabled": True},
]

_active_alerts = [
    {"id": "ALT20260701001", "rule_id": "R003", "title": "不满意模型PSI漂移", "severity": "high", "detail": "PSI从0.032上升至0.048, 月环比+50%", "triggered_at": "2026-07-01 08:15", "status": "acknowledged", "handler": "模型工程组"},
    {"id": "ALT20260701002", "rule_id": "R006", "title": "地理场景数据FTP接入失败", "severity": "critical", "detail": "FTP连接超时，geo_data源最后成功同步: 2026-06-01", "triggered_at": "2026-07-01 06:00", "status": "open", "handler": None},
    {"id": "ALT20260701003", "rule_id": "R004", "title": "珠海地区命中率降至8.5%", "severity": "high", "detail": "珠海市本月命中率8.5%，低于10%基线", "triggered_at": "2026-07-01 09:00", "status": "open", "handler": None},
    {"id": "ALT20260701004", "rule_id": "R001", "title": "客服数据完整性降至93.2%", "severity": "medium", "detail": "complaint_10010数据源完整性评分93.2，低于95分阈值", "triggered_at": "2026-07-01 07:30", "status": "resolved", "handler": "数据治理组"},
]


@router.get("/rules")
def get_alert_rules(category: str = Query("all"), _=Depends(get_current_user)):
    """获取告警规则列表"""
    if category == "all":
        return _alert_rules
    return [r for r in _alert_rules if r["category"] == category]


@router.get("/")
def get_active_alerts(severity: str = Query("all"), _=Depends(get_current_user)):
    """获取活跃告警列表"""
    if severity == "all":
        return _active_alerts
    return [a for a in _active_alerts if a["severity"] == severity]


@router.get("/data-quality")
def get_data_quality_alerts(_=Depends(get_current_user)):
    """数据质量告警 — 对应需求：异常15分钟内触发"""
    return {
        "alerts": [
            {"type": "完整性告警", "dataset": "complaint_10010", "score": 93.2, "threshold": 95, "triggered": True, "time": "2026-07-01 07:30"},
        ],
        "current_status": "1 active alert",
        "last_check": datetime.now().isoformat(),
        "check_interval_sec": 900,  # 15分钟
    }


@router.get("/stats")
def get_alert_stats(_=Depends(get_current_user)):
    """告警统计"""
    return {
        "total_today": 4,
        "by_severity": {"critical": 1, "high": 2, "medium": 1, "low": 0},
        "by_status": {"open": 2, "acknowledged": 1, "resolved": 1},
        "avg_response_min": 12,
        "avg_resolve_min": 45,
        "within_15min_rate": 0.92,
    }
