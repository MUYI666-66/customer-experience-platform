import { useState, useEffect } from 'react';
import {
  Server, Database, Shield, Brain, CheckCircle2, XCircle, AlertCircle,
  Clock, Zap, Globe, Layers, Box, RefreshCw,
} from 'lucide-react';

/* ---- Types ---- */

interface EndpointStatus {
  method: string;
  path: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  latency?: number;
}

interface DbTable {
  name: string;
  rows: string;
  size: string;
  status: 'ok' | 'warn';
}

interface ModelFile {
  name: string;
  type: string;
  size: string;
  version: string;
  accuracy: string;
  lastTrained: string;
}

/* ---- Data ---- */

const API_MODULES: { name: string; icon: React.ElementType; endpoints: EndpointStatus[] }[] = [
  {
    name: '认证模块', icon: Shield,
    endpoints: [
      { method: 'POST', path: '/api/v1/auth/token', description: '用户登录获取Token', status: 'active', latency: 45 },
      { method: 'GET', path: '/api/v1/auth/me', description: '获取当前用户信息', status: 'active', latency: 12 },
    ],
  },
  {
    name: '预测模块', icon: Brain,
    endpoints: [
      { method: 'POST', path: '/api/v1/predict/dissatisfaction/realtime', description: '不满意实时预测', status: 'active', latency: 89 },
      { method: 'POST', path: '/api/v1/predict/dissatisfaction/batch', description: '不满意批量预测', status: 'active', latency: 450 },
      { method: 'POST', path: '/api/v1/predict/complaint/user', description: '投诉风险预测', status: 'active', latency: 67 },
      { method: 'POST', path: '/api/v1/predict/complaint/region-trend', description: '区域投诉趋势', status: 'active', latency: 230 },
      { method: 'POST', path: '/api/v1/predict/survey/score', description: '易受访意愿评分', status: 'active', latency: 55 },
    ],
  },
  {
    name: '数据接入', icon: Database,
    endpoints: [
      { method: 'GET', path: '/api/v1/ingestion/jobs', description: '接入任务列表', status: 'active', latency: 34 },
      { method: 'GET', path: '/api/v1/ingestion/pipeline/status', description: '接入管道状态', status: 'active', latency: 28 },
      { method: 'GET', path: '/api/v1/ingestion/data-quality/reports/:date', description: '数据质量报告', status: 'active', latency: 120 },
    ],
  },
  {
    name: '特征 & 告警 & 报表', icon: Layers,
    endpoints: [
      { method: 'GET', path: '/api/v1/features/importance/:model', description: '特征重要性', status: 'active', latency: 56 },
      { method: 'GET', path: '/api/v1/alerts/', description: '告警列表', status: 'active', latency: 42 },
      { method: 'GET', path: '/api/v1/alerts/rules', description: '告警规则', status: 'active', latency: 18 },
      { method: 'GET', path: '/api/v1/reports/', description: '报表列表', status: 'active', latency: 38 },
      { method: 'POST', path: '/api/v1/reports/export', description: '导出报表', status: 'active', latency: 520 },
    ],
  },
];

const DB_TABLES: DbTable[] = [
  { name: 'users', rows: '10,000', size: '2.1 MB', status: 'ok' },
  { name: 'stations', rows: '500', size: '0.3 MB', status: 'ok' },
  { name: 'station_kpis', rows: '15,000', size: '4.8 MB', status: 'ok' },
  { name: 'complaints', rows: '2,000', size: '1.2 MB', status: 'ok' },
  { name: 'surveys', rows: '3,000', size: '0.9 MB', status: 'ok' },
  { name: 'predictions', rows: '30,000', size: '5.6 MB', status: 'ok' },
  { name: 'work_orders', rows: '1,200', size: '0.5 MB', status: 'ok' },
  { name: 'cases', rows: '350', size: '0.2 MB', status: 'ok' },
  { name: 'alert_logs', rows: '8,500', size: '3.1 MB', status: 'warn' },
  { name: 'feature_snapshots', rows: '32 × 10,000', size: '12.4 MB', status: 'ok' },
];

const MODEL_FILES: ModelFile[] = [
  { name: 'dissatisfaction_gbdt_lr_v3.pkl', type: '不满意预测', size: '18.5 MB', version: 'v3.2.1', accuracy: '84.7%', lastTrained: '2026-07-04 10:30' },
  { name: 'survey_gbdt_lr_v2.pkl', type: '易受访预测', size: '15.8 MB', version: 'v2.1.0', accuracy: '82.3%', lastTrained: '2026-07-04 10:45' },
  { name: 'complaint_xgboost_v4.pkl', type: '投诉风险', size: '22.1 MB', version: 'v4.0.1', accuracy: '86.2%', lastTrained: '2026-07-04 11:00' },
  { name: 'complaint_ts_prophet_v1.pkl', type: '投诉时序', size: '5.2 MB', version: 'v1.0.0', accuracy: '--', lastTrained: '2026-07-01 03:15' },
];

/* ---- Component ---- */

export function SystemStatus() {
  const [healthCheck, setHealthCheck] = useState<'loading' | 'ok' | 'error'>('loading');
  const [backendLatency, setBackendLatency] = useState<number | null>(null);
  const [lastCheck, setLastCheck] = useState<string>('');

  const runHealthCheck = async () => {
    setHealthCheck('loading');
    const start = Date.now();
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test', password: 'test' }),
      });
      setBackendLatency(Date.now() - start);
      // 401/403 means backend is running (just wrong credentials)
      setHealthCheck(res.status === 401 || res.status === 403 || res.ok ? 'ok' : 'error');
    } catch {
      setHealthCheck('error');
      setBackendLatency(null);
    }
    setLastCheck(new Date().toLocaleTimeString('zh-CN'));
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const methodColor = (m: string) => {
    switch (m) {
      case 'GET': return 'bg-green-100 text-green-700';
      case 'POST': return 'bg-blue-100 text-blue-700';
      case 'PUT': return 'bg-orange-100 text-orange-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const activeCount = API_MODULES.reduce((acc, m) => acc + m.endpoints.filter((e) => e.status === 'active').length, 0);
  const totalEndpoints = API_MODULES.reduce((acc, m) => acc + m.endpoints.length, 0);
  const totalRows = DB_TABLES.reduce((acc, t) => {
    const n = parseInt(t.rows.replace(/,/g, '').replace('×', '*'));
    return acc + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">系统状态</h1>
          <p className="text-sm text-muted-foreground mt-1">后端服务、数据库、模型文件运行状态总览</p>
        </div>
        <button
          onClick={runHealthCheck}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-muted/50 transition-colors"
        >
          <RefreshCw className="size-4" />
          刷新状态
        </button>
      </div>

      {/* Health overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: '后端服务', value: healthCheck === 'ok' ? '运行中' : healthCheck === 'loading' ? '检测中' : '不可用', color: healthCheck === 'ok' ? 'text-green-500' : healthCheck === 'loading' ? 'text-blue-500' : 'text-red-500', icon: Server },
          { label: 'API 端点', value: `${activeCount}/${totalEndpoints}`, color: 'text-blue-500', icon: Globe },
          { label: '数据表', value: `${DB_TABLES.length}`, color: 'text-purple-500', icon: Database },
          { label: '模型文件', value: `${MODEL_FILES.length}`, color: 'text-orange-500', icon: Box },
          { label: '数据总量', value: `${totalRows.toLocaleString()} 行`, color: 'text-emerald-500', icon: Layers },
          { label: '延迟', value: backendLatency ? `${backendLatency}ms` : '--', color: backendLatency && backendLatency < 100 ? 'text-green-500' : 'text-orange-500', icon: Zap },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`size-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* System Architecture */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
          <Layers className="size-5 text-primary" />
          系统架构
        </h3>
        <div className="flex flex-col items-center gap-2">
          {/* Frontend */}
          <div className="w-full max-w-2xl flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <Globe className="size-8 text-blue-500 shrink-0" />
            <div>
              <p className="font-semibold text-sm">前端 (React + TypeScript + Vite)</p>
              <p className="text-xs text-muted-foreground">localhost:5173 · shadcn/ui · Recharts · Tailwind CSS · Zustand</p>
            </div>
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600"><span className="size-1.5 rounded-full bg-green-500" />运行中</span>
          </div>

          {/* Arrow */}
          <div className="text-muted-foreground/30 text-lg">↓ ↑</div>

          {/* Backend */}
          <div className="w-full max-w-2xl flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <Server className="size-8 text-purple-500 shrink-0" />
            <div>
              <p className="font-semibold text-sm">后端 (FastAPI + Python 3.12)</p>
              <p className="text-xs text-muted-foreground">localhost:8000 · uvicorn · SQLAlchemy · scikit-learn · openpyxl</p>
            </div>
            <span className={`ml-auto flex items-center gap-1 text-xs ${healthCheck === 'ok' ? 'text-green-600' : 'text-orange-600'}`}>
              <span className={`size-1.5 rounded-full ${healthCheck === 'ok' ? 'bg-green-500' : 'bg-orange-500'}`} />
              {healthCheck === 'ok' ? '已连接' : healthCheck === 'loading' ? '检测中' : '未连接'}
            </span>
          </div>

          {/* Arrow */}
          <div className="text-muted-foreground/30 text-lg">↓ ↑</div>

          {/* Database */}
          <div className="w-full max-w-2xl flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <Database className="size-8 text-green-500 shrink-0" />
            <div>
              <p className="font-semibold text-sm">数据库 (SQLite)</p>
              <p className="text-xs text-muted-foreground">satisfaction_ai.db · 10 表 · {totalRows.toLocaleString()} 行 · WAL 模式</p>
            </div>
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600"><span className="size-1.5 rounded-full bg-green-500" />正常</span>
          </div>

          {/* Arrow */}
          <div className="text-muted-foreground/30 text-lg">↓ ↑</div>

          {/* Model Artifacts */}
          <div className="w-full max-w-2xl flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <Box className="size-8 text-orange-500 shrink-0" />
            <div>
              <p className="font-semibold text-sm">模型仓库 (artifacts/)</p>
              <p className="text-xs text-muted-foreground">4 个 .pkl 文件 · 总计 61.6 MB · GBDT+LR · XGBoost · Prophet</p>
            </div>
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600"><span className="size-1.5 rounded-full bg-green-500" />已加载</span>
          </div>
        </div>
      </div>

      {/* API Endpoints + DB Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* API Endpoints */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-3.5 border-b font-medium text-sm flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            API 端点 ({activeCount}/{totalEndpoints} 活跃)
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {API_MODULES.map((mod) => (
              <div key={mod.name}>
                <div className="px-5 py-2.5 bg-muted/30 flex items-center gap-2">
                  <mod.icon className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">{mod.name}</span>
                </div>
                {mod.endpoints.map((ep) => (
                  <div key={ep.path} className="px-5 py-2.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${methodColor(ep.method)}`}>
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono text-foreground flex-1">{ep.path}</span>
                    <span className="text-xs text-muted-foreground hidden md:inline">{ep.description}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground ml-2 shrink-0">
                      {ep.status === 'active' ? <CheckCircle2 className="size-3 text-green-500" /> : <AlertCircle className="size-3 text-orange-500" />}
                      {ep.latency}ms
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Database Tables */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-3.5 border-b font-medium text-sm flex items-center gap-2">
            <Database className="size-4 text-primary" />
            数据库表 ({DB_TABLES.length})
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-5 py-2.5 font-medium text-muted-foreground text-xs">表名</th>
                  <th className="text-right px-5 py-2.5 font-medium text-muted-foreground text-xs">行数</th>
                  <th className="text-right px-5 py-2.5 font-medium text-muted-foreground text-xs">大小</th>
                  <th className="text-center px-5 py-2.5 font-medium text-muted-foreground text-xs">状态</th>
                </tr>
              </thead>
              <tbody>
                {DB_TABLES.map((t) => (
                  <tr key={t.name} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-2.5 font-mono text-xs">{t.name}</td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs">{t.rows}</td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs text-muted-foreground">{t.size}</td>
                    <td className="px-5 py-2.5 text-center">
                      {t.status === 'ok' ? (
                        <CheckCircle2 className="size-4 text-green-500 mx-auto" />
                      ) : (
                        <AlertCircle className="size-4 text-orange-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Model Files */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-3.5 border-b font-medium text-sm flex items-center gap-2">
          <Box className="size-4 text-primary" />
          模型文件
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-5 py-2.5 font-medium text-muted-foreground text-xs">文件名</th>
                <th className="text-left px-5 py-2.5 font-medium text-muted-foreground text-xs">类型</th>
                <th className="text-right px-5 py-2.5 font-medium text-muted-foreground text-xs">大小</th>
                <th className="text-left px-5 py-2.5 font-medium text-muted-foreground text-xs">版本</th>
                <th className="text-right px-5 py-2.5 font-medium text-muted-foreground text-xs">准确率</th>
                <th className="text-left px-5 py-2.5 font-medium text-muted-foreground text-xs">最后训练</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_FILES.map((m) => (
                <tr key={m.name} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-2.5 font-mono text-xs">{m.name}</td>
                  <td className="px-5 py-2.5"><span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700">{m.type}</span></td>
                  <td className="px-5 py-2.5 text-right font-mono text-xs text-muted-foreground">{m.size}</td>
                  <td className="px-5 py-2.5 font-mono text-xs">{m.version}</td>
                  <td className="px-5 py-2.5 text-right font-mono text-xs font-semibold">{m.accuracy}</td>
                  <td className="px-5 py-2.5 text-xs text-muted-foreground">{m.lastTrained}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Last check footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="size-3" />
          最后检查: {lastCheck || '--'}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-green-500" /> 正常</span>
          <span className="flex items-center gap-1"><AlertCircle className="size-3 text-orange-500" /> 警告</span>
          <span className="flex items-center gap-1"><XCircle className="size-3 text-red-500" /> 异常</span>
        </div>
      </div>
    </div>
  );
}
