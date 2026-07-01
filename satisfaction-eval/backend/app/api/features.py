"""特征工程API — 对应客户需求模块1.3"""
import random
from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.auth import get_current_user

router = APIRouter(prefix="/api/v1/features", tags=["特征工程"])


class FeatureSnapshotRequest(BaseModel):
    layer: str = "all"  # basic / derived / scenario / all
    biz_date: str


@router.get("/definitions")
def get_feature_definitions(layer: str = "all", _=Depends(get_current_user)):
    """获取特征定义列表"""
    from app.services.mock_data import features as all_features
    if layer == "all":
        return all_features
    return [f for f in all_features if f["layer"] == layer]


@router.get("/definitions/{feature_code}")
def get_feature_detail(feature_code: str, _=Depends(get_current_user)):
    """获取单个特征详情"""
    from app.services.mock_data import features as all_features
    for f in all_features:
        if f["code"] == feature_code:
            return {
                **f,
                "description": f"{f['name']} - {f['layer']}层特征",
                "calculation": f"-- 示例SQL/Python表达式 for {f['code']}",
                "dependencies": ["F_B_001", "F_B_002"],
                "created_at": "2026-03-15",
                "updated_at": "2026-06-20",
                "owner": "特征工程团队",
            }
    return {"error": "not found"}


@router.post("/snapshots/materialize")
def materialize_features(req: FeatureSnapshotRequest, _=Depends(get_current_user)):
    """触发特征快照计算"""
    counts = {"basic": 86, "derived": 132, "scenario": 50}
    layer_count = counts.get(req.layer, sum(counts.values()))
    return {
        "snapshot_id": f"fs_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "biz_date": req.biz_date,
        "layer": req.layer,
        "features_materialized": layer_count,
        "status": "running",
        "started_at": datetime.now().isoformat(),
    }


@router.get("/snapshots/{snapshot_id}")
def get_snapshot(snapshot_id: str, _=Depends(get_current_user)):
    """查询快照状态"""
    return {
        "snapshot_id": snapshot_id,
        "status": "completed",
        "total_features": 268,
        "success_count": 268,
        "failed_count": 0,
        "data_size_mb": 1250,
        "completed_at": datetime.now().isoformat(),
    }


@router.get("/importance/{model_name}")
def get_feature_importance(model_name: str, _=Depends(get_current_user)):
    """SHAP特征重要性分析"""
    shap_data = [
        {"feature": "RSRP均值", "importance": 0.35, "type": "basic"},
        {"feature": "切换成功率", "importance": 0.31, "type": "basic"},
        {"feature": "SINR均值", "importance": 0.28, "type": "basic"},
        {"feature": "投诉累积密度", "importance": 0.25, "type": "derived"},
        {"feature": "质差时段占比", "importance": 0.22, "type": "derived"},
        {"feature": "业务失落频段", "importance": 0.18, "type": "derived"},
        {"feature": "城中村穿透损耗", "importance": 0.15, "type": "scenario"},
        {"feature": "ARPU分档", "importance": 0.14, "type": "basic"},
        {"feature": "海岸台风系数", "importance": 0.12, "type": "scenario"},
        {"feature": "终端品牌", "importance": 0.10, "type": "basic"},
        {"feature": "交通干线距离", "importance": 0.08, "type": "scenario"},
        {"feature": "历史投诉次数", "importance": 0.07, "type": "derived"},
        {"feature": "套餐档位", "importance": 0.06, "type": "basic"},
        {"feature": "节假日标识", "importance": 0.05, "type": "scenario"},
        {"feature": "在网时长", "importance": 0.04, "type": "basic"},
    ]
    return {
        "model_name": model_name,
        "method": "SHAP",
        "generated_at": datetime.now().isoformat(),
        "top_features": shap_data,
        "total_features_analyzed": 268,
    }


@router.post("/redundancy/check")
def check_redundancy(_=Depends(get_current_user)):
    """冗余特征检测"""
    return {
        "status": "completed",
        "total_features": 268,
        "redundant_pairs": [
            {"feature_a": "RSRP均值", "feature_b": "RSRP中位数", "correlation": 0.96, "action": "建议移除RSRP中位数"},
            {"feature_a": "SINR均值", "feature_b": "SINR中位数", "correlation": 0.94, "action": "建议移除SINR中位数"},
            {"feature_a": "切换请求次数", "feature_b": "切换尝试次数", "correlation": 0.98, "action": "建议合并"},
        ],
        "features_recommended_removal": 3,
        "estimated_impact_on_accuracy": -0.002,
    }
