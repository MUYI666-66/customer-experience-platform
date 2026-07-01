from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class KpiCardData(BaseModel):
    title: str
    value: float | str
    change: float
    changeLabel: str
    icon: str
    color: str


class ModelMetrics(BaseModel):
    modelName: str
    accuracy: float
    recall: float
    f1: float
    auc: float
    psi: float
    updateTime: str


class RiskUser(BaseModel):
    userId: str
    region: str
    riskScore: float
    riskLevel: str
    topCauses: list[dict]
    lastEvent: str


class SurveyUser(BaseModel):
    userId: str
    region: str
    score: int
    level: str
    lastSurveyDate: str
    hitStatus: str


class ComplaintAlert(BaseModel):
    id: str
    region: str
    alertType: str
    riskLevel: str
    predictedCount: int
    actualCount: Optional[int] = None
    trend: str
    alertTime: str
    windowDays: int


class WorkOrder(BaseModel):
    id: str
    title: str
    type: str
    priority: str
    status: str
    assignee: str
    region: str
    createTime: str
    deadline: str
    relatedUserId: Optional[str] = None


class CaseItem(BaseModel):
    id: str
    title: str
    category: str
    tags: list[str]
    problem: str
    solution: str
    effect: str
    region: str
    createTime: str


class DataSource(BaseModel):
    code: str
    name: str
    type: str
    syncMode: str
    syncFreq: str
    status: str
    lastSync: str
    successRate: float


class FeatureDefinition(BaseModel):
    code: str
    name: str
    layer: str
    updateFreq: str
    version: str
    importance: Optional[float] = None


class ModelVersion(BaseModel):
    name: str
    version: str
    type: str
    algorithm: str
    status: str
    metrics: ModelMetrics
    deployTime: str
