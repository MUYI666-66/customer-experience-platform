export type Role = 'admin' | 'analyst' | 'operator' | 'auditor';

export type RiskLevel = 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'verified' | 'closed';

export type RegionLevel = 'province' | 'city' | 'county' | 'grid' | 'cell';

export interface Region {
  code: string;
  name: string;
  level: RegionLevel;
  parentCode?: string;
}

export interface KpiCardData {
  title: string;
  value: number | string;
  change: number;
  changeLabel: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

export interface ModelMetrics {
  modelName: string;
  accuracy: number;
  recall: number;
  f1: number;
  auc: number;
  psi: number;
  updateTime: string;
}

export interface RiskUser {
  userId: string;
  region: string;
  riskScore: number;
  riskLevel: RiskLevel;
  topCauses: { code: string; name: string; contribution: number }[];
  lastEvent: string;
}

export interface SurveyUser {
  userId: string;
  region: string;
  score: number;
  level: string;
  lastSurveyDate: string;
  hitStatus: 'hit' | 'miss' | 'pending';
}

export interface ComplaintAlert {
  id: string;
  region: string;
  alertType: string;
  riskLevel: RiskLevel;
  predictedCount: number;
  actualCount?: number;
  trend: 'up' | 'down' | 'stable';
  alertTime: string;
  windowDays: number;
}

export interface WorkOrder {
  id: string;
  title: string;
  type: string;
  priority: RiskLevel;
  status: TaskStatus;
  assignee: string;
  region: string;
  createTime: string;
  deadline: string;
  relatedUserId?: string;
}

export interface CaseItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  problem: string;
  solution: string;
  effect: string;
  region: string;
  createTime: string;
}

export interface DataSource {
  code: string;
  name: string;
  type: string;
  syncMode: 'api' | 'ftp';
  syncFreq: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  successRate: number;
}

export interface FeatureDefinition {
  code: string;
  name: string;
  layer: 'basic' | 'derived' | 'scenario';
  updateFreq: string;
  version: string;
  importance?: number;
}

export interface ModelVersion {
  name: string;
  version: string;
  type: 'dissatisfaction' | 'survey' | 'complaint_cls' | 'complaint_ts';
  algorithm: string;
  status: 'draft' | 'candidate' | 'prod' | 'rollback';
  metrics: ModelMetrics;
  deployTime: string;
}
