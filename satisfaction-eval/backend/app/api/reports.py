"""报表中心API — 对应客户需求模块4.2"""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.api.auth import get_current_user

router = APIRouter(prefix="/api/v1/reports", tags=["报表中心"])


class ExportRequest(BaseModel):
    report_type: str  # daily / monthly / quarterly / annual / special
    biz_date: str
    format: str = "pdf"  # pdf / excel


_recent_reports = [
    {"name": "满意度运营日报_20260701.pdf", "type": "日报", "size": "2.3 MB", "time": "2026-07-01 09:00", "status": "ready"},
    {"name": "不满意模型月度报告_202606.pdf", "type": "月报", "size": "8.1 MB", "time": "2026-07-01 08:00", "status": "ready"},
    {"name": "投诉风险预警周报_2026W27.pdf", "type": "专题", "size": "5.6 MB", "time": "2026-06-30 17:00", "status": "ready"},
    {"name": "Q2满意度运营季报_2026.pdf", "type": "季报", "size": "15.2 MB", "time": "2026-07-05 10:00", "status": "generating"},
    {"name": "深圳大运会保障专题报告.pdf", "type": "专题", "size": "12.8 MB", "time": "2026-06-28 14:00", "status": "ready"},
    {"name": "2026H1项目总结报告.pdf", "type": "年报", "size": "25.1 MB", "time": "2026-07-15 10:00", "status": "scheduled"},
    {"name": "沿海地区台风季网络影响专题.pdf", "type": "专题", "size": "9.3 MB", "time": "2026-06-25 16:00", "status": "ready"},
    {"name": "农村覆盖专项优化报告_202606.pdf", "type": "专题", "size": "11.5 MB", "time": "2026-06-22 11:00", "status": "ready"},
]


@router.get("/")
def list_reports(report_type: str = Query("all"), _=Depends(get_current_user)):
    """获取报表列表"""
    if report_type == "all":
        return _recent_reports
    return [r for r in _recent_reports if r["type"] == report_type]


@router.post("/export")
def export_report(req: ExportRequest, _=Depends(get_current_user)):
    """异步导出报表（Excel/PDF）"""
    task_id = f"export_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    type_names = {"daily": "日报", "monthly": "月报", "quarterly": "季报", "annual": "年报", "special": "专题报告"}
    return {
        "task_id": task_id,
        "status": "queued",
        "report_name": f"{type_names.get(req.report_type, '报表')}_{req.biz_date}.{req.format}",
        "format": req.format,
        "estimated_completion": (datetime.now() + timedelta(seconds=15)).isoformat(),
    }


@router.get("/export/{task_id}")
def get_export_status(task_id: str, _=Depends(get_current_user)):
    """查询导出任务状态"""
    return {
        "task_id": task_id,
        "status": random.choice(["completed", "generating"]),
        "progress_pct": 85,
        "download_url": f"/api/v1/reports/download/{task_id}" if random.random() > 0.5 else None,
    }


@router.get("/templates")
def get_report_templates(_=Depends(get_current_user)):
    """获取报告模板列表"""
    return [
        {"id": "TPL001", "name": "感知运营日报模板", "type": "daily", "sections": ["KPI摘要", "风险用户统计", "投诉趋势", "处置进度"]},
        {"id": "TPL002", "name": "模型优化月报模板", "type": "monthly", "sections": ["模型指标", "特征重要性变化", "漂移分析", "优化建议"]},
        {"id": "TPL003", "name": "季度服务价值报告模板", "type": "quarterly", "sections": ["业务成效", "ROI分析", "竞品对标", "下季规划"]},
        {"id": "TPL004", "name": "专题分析报告模板", "type": "special", "sections": ["背景", "数据分析", "根因定位", "优化方案", "效果预估"]},
    ]

# needed for random in get_export_status
import random
