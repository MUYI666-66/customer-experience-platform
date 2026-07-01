import {
  kpiCards, modelMetrics, riskUsers, surveyUsers,
  complaintAlerts, workOrders, caseItems,
  dataSources, features, modelVersions,
  riskTrendData, complaintTrendData, hitRateTrendData,
  modelAccuracyTrendData, regionRiskData, rootCauseData,
} from '@/mocks/data';

const BASE = 'http://localhost:8000/api/v1';
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

function getToken() {
  return localStorage.getItem('auth-token') || '';
}

async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '请求失败' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // ====== Overview ======
  getKpiCards: async () => { await delay(); return kpiCards; },
  getRiskTrend: async () => { await delay(); return riskTrendData; },
  getComplaintTrend: async () => { await delay(); return complaintTrendData; },
  getRegionRisk: async () => { await delay(); return regionRiskData; },
  getRootCause: async () => { await delay(); return rootCauseData; },
  getModelMetrics: async () => { await delay(); return modelMetrics; },

  // ====== Dissatisfaction ======
  getRiskUsers: async () => { await delay(); return riskUsers; },
  getModelAccuracyTrend: async () => { await delay(); return modelAccuracyTrendData; },

  // ====== Survey ======
  getSurveyUsers: async () => { await delay(); return surveyUsers; },
  getHitRateTrend: async () => { await delay(); return hitRateTrendData; },

  // ====== Complaint ======
  getComplaintAlerts: async () => { await delay(); return complaintAlerts; },

  // ====== Operations ======
  getWorkOrders: async () => { await delay(); return workOrders; },

  // ====== Cases ======
  getCases: async () => { await delay(); return caseItems; },

  // ====== Admin ======
  getDataSources: async () => { await delay(); return dataSources; },
  getFeatures: async () => { await delay(); return features; },
  getModelVersions: async () => { await delay(); return modelVersions; },

  // ====== Prediction APIs (call backend) ======
  predictDissatisfactionRealtime: (data: object) =>
    fetchApi('/predict/dissatisfaction/realtime', { method: 'POST', body: JSON.stringify(data) }),
  predictDissatisfactionBatch: (data: object) =>
    fetchApi('/predict/dissatisfaction/batch', { method: 'POST', body: JSON.stringify(data) }),
  predictComplaintUser: (data: object) =>
    fetchApi('/predict/complaint/user', { method: 'POST', body: JSON.stringify(data) }),
  predictComplaintRegionTrend: (data: object) =>
    fetchApi('/predict/complaint/region-trend', { method: 'POST', body: JSON.stringify(data) }),
  predictSurveyScore: (data: object) =>
    fetchApi('/predict/survey/score', { method: 'POST', body: JSON.stringify(data) }),

  // ====== Ingestion APIs ======
  getIngestionJobs: () => fetchApi('/ingestion/jobs'),
  getPipelineStatus: () => fetchApi('/ingestion/pipeline/status'),
  getDataQualityReport: (date: string) => fetchApi(`/ingestion/data-quality/reports/${date}`),

  // ====== Feature APIs ======
  getFeatureImportance: (model: string) => fetchApi(`/features/importance/${model}`),

  // ====== Alert APIs ======
  getAlerts: () => fetchApi('/alerts/'),
  getAlertRules: () => fetchApi('/alerts/rules'),

  // ====== Report APIs ======
  getReports: () => fetchApi('/reports/'),
  exportReport: (data: object) => fetchApi('/reports/export', { method: 'POST', body: JSON.stringify(data) }),
};
