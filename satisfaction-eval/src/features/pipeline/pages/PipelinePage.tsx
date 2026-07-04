import { useState, useCallback, useRef } from 'react';
import {
  Play, RotateCcw, CheckCircle2, AlertCircle, Loader2, Circle,
  Database, Filter, Cpu, Brain, BarChart3,
  Users, Zap, Clock, Target,
} from 'lucide-react';
import { SectionCard } from '@/components/ui/card';
import { DataTable } from '@/components/ui/table';
import type { ModelMetrics } from '@/types/domain';
import { formatPercent } from '@/lib/utils';

interface StepDef {
  key: string;
  label: string;
  desc: string;
  icon: React.ElementType;
}

const STEPS: StepDef[] = [
  { key: 'load', label: '数据加载', desc: '从样本目录加载CSV数据，校验完整性与格式', icon: Database },
  { key: 'preprocess', label: '数据预处理', desc: '缺失值填充、异常值检测、数据标准化', icon: Filter },
  { key: 'features', label: '特征工程', desc: '构建32维特征体系，衍生特征计算', icon: Cpu },
  { key: 'train', label: '模型训练', desc: '不满意预测、易受访预测、投诉风险三模型训练', icon: Brain },
  { key: 'evaluate', label: '预测与评估', desc: '测试集评估、生成预测结果与模型指标', icon: BarChart3 },
];

type StepStatus = 'pending' | 'running' | 'done' | 'error';

const KPI_CARD_ITEMS = [
  { key: 'users', label: '总用户数', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { key: 'features', label: '特征维度', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
  { key: 'time', label: '训练耗时', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
  { key: 'accuracy', label: '模型准确率', icon: Target, color: 'text-green-500', bg: 'bg-green-50' },
];

const MOCK_METRICS: ModelMetrics[] = [
  { modelName: '不满意用户预测', accuracy: 0.847, recall: 0.812, f1: 0.829, auc: 0.891, psi: 0.032, updateTime: '2026-07-04 10:30' },
  { modelName: '易受访用户预测', accuracy: 0.823, recall: 0.785, f1: 0.803, auc: 0.867, psi: 0.045, updateTime: '2026-07-04 10:45' },
  { modelName: '投诉风险分类', accuracy: 0.862, recall: 0.818, f1: 0.839, auc: 0.905, psi: 0.028, updateTime: '2026-07-04 11:00' },
];

const METRIC_COLUMNS = [
  { key: 'modelName', header: '模型名称' },
  { key: 'accuracy', header: '准确率', render: (m: ModelMetrics) => formatPercent(m.accuracy) },
  { key: 'recall', header: '召回率', render: (m: ModelMetrics) => formatPercent(m.recall) },
  { key: 'f1', header: 'F1', render: (m: ModelMetrics) => m.f1.toFixed(3) },
  { key: 'auc', header: 'AUC', render: (m: ModelMetrics) => m.auc.toFixed(3) },
  { key: 'psi', header: 'PSI', render: (m: ModelMetrics) => m.psi.toFixed(3) },
];

const FEATURE_LABELS = [
  { name: 'avg_rsrp', cn: '平均RSRP', importance: 0.12 },
  { name: 'avg_sinr', cn: '平均SINR', importance: 0.11 },
  { name: 'drop_rate', cn: '掉线率', importance: 0.10 },
  { name: 'ho_success_rate', cn: '切换成功率', importance: 0.09 },
  { name: 'avg_prb', cn: 'PRB利用率', importance: 0.08 },
  { name: 'arpu', cn: 'ARPU值', importance: 0.07 },
  { name: 'tenure_months', cn: '在网时长', importance: 0.06 },
  { name: 'complaint_count', cn: '历史投诉数', importance: 0.06 },
  { name: 'rsrp_quality_ratio', cn: 'RSRP优良率', importance: 0.05 },
  { name: 'high_load_ratio', cn: '高负载比例', importance: 0.04 },
];

export function PipelinePage() {
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>(
    Object.fromEntries(STEPS.map((s) => [s.key, 'pending']))
  );
  const [running, setRunning] = useState(false);
  const [kpiValues, setKpiValues] = useState<Record<string, string>>({
    users: '--', features: '--', time: '--', accuracy: '--',
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [showMetrics, setShowMetrics] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString('zh-CN');
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
    requestAnimationFrame(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    });
  }, []);

  const simulatedDelay = useCallback((ms: number) =>
    new Promise((r) => setTimeout(r, ms)), []
  );

  const runAll = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setLogs([]);
    setShowMetrics(false);
    setKpiValues({ users: '--', features: '--', time: '--', accuracy: '--' });

    const newStatuses = { ...stepStatuses };
    const startTime = Date.now();

    try {
      // Step 1: Data loading
      newStatuses['load'] = 'running';
      setStepStatuses({ ...newStatuses });
      addLog('开始数据加载...');
      await simulatedDelay(1200);
      addLog('加载 users.csv — 10,000 行，验证通过');
      await simulatedDelay(600);
      addLog('加载 stations.csv — 500 行，验证通过');
      await simulatedDelay(400);
      addLog('加载 station_kpis.csv — 15,000 行，验证通过');
      await simulatedDelay(400);
      addLog('加载 complaints.csv — 2,000 行，验证通过');
      await simulatedDelay(400);
      addLog('加载 surveys.csv — 3,000 行，验证通过');
      newStatuses['load'] = 'done';
      setStepStatuses({ ...newStatuses });
      setKpiValues((prev) => ({ ...prev, users: '10,000' }));
      addLog('数据加载完成 ✓ (总用户 10,000)');

      // Step 2: Preprocessing
      newStatuses['preprocess'] = 'running';
      setStepStatuses({ ...newStatuses });
      addLog('开始数据预处理...');
      await simulatedDelay(1000);
      addLog('缺失值检测: 发现 342 个缺失值，使用中位数填充');
      await simulatedDelay(800);
      addLog('异常值检测: IQR方法发现 56 个离群点，已截尾处理');
      await simulatedDelay(600);
      addLog('数据标准化: MinMax归一化完成，156 个特征列');
      newStatuses['preprocess'] = 'done';
      setStepStatuses({ ...newStatuses });
      addLog('数据预处理完成 ✓');

      // Step 3: Feature engineering
      newStatuses['features'] = 'running';
      setStepStatuses({ ...newStatuses });
      addLog('开始特征工程...');
      await simulatedDelay(800);
      addLog('基础特征提取: 32维网络/用户/终端特征');
      await simulatedDelay(600);
      addLog('衍生特征计算: RSRP优良率、高负载比例、使用强度等');
      await simulatedDelay(500);
      addLog('场景特征编码: OneHot编码 scene_type → 5维');
      addLog('标签构建: 不满意标签(4,200正例)、易受访标签(3,100正例)、投诉标签(1,800正例)');
      newStatuses['features'] = 'done';
      setStepStatuses({ ...newStatuses });
      setKpiValues((prev) => ({ ...prev, features: '32' }));
      addLog('特征工程完成 ✓ (32维特征体系)');

      // Step 4: Model training
      newStatuses['train'] = 'running';
      setStepStatuses({ ...newStatuses });
      addLog('开始模型训练...');
      await simulatedDelay(1200);
      addLog('不满意预测模型: GBDT+LR, 训练集7,000, 验证集3,000');
      await simulatedDelay(1000);
      addLog('易受访预测模型: GBDT+LR, 训练集7,000, 验证集3,000');
      await simulatedDelay(800);
      addLog('投诉风险分类模型: XGBoost, 训练集7,000, 验证集3,000');
      newStatuses['train'] = 'done';
      setStepStatuses({ ...newStatuses });
      setKpiValues((prev) => ({ ...prev, accuracy: '84.7%' }));
      addLog('模型训练完成 ✓ (3个模型)');

      // Step 5: Evaluation
      newStatuses['evaluate'] = 'running';
      setStepStatuses({ ...newStatuses });
      addLog('开始模型评估...');
      await simulatedDelay(800);
      addLog('不满意预测: Accuracy=0.847, AUC=0.891, F1=0.829');
      await simulatedDelay(400);
      addLog('易受访预测: Accuracy=0.823, AUC=0.867, F1=0.803');
      await simulatedDelay(400);
      addLog('投诉风险分类: Accuracy=0.862, AUC=0.905, F1=0.839');
      await simulatedDelay(200);
      addLog('PSI稳定性检查: 全部通过 (< 0.05)');
      newStatuses['evaluate'] = 'done';
      setStepStatuses({ ...newStatuses });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      setKpiValues((prev) => ({ ...prev, time: `${elapsed}s` }));
      setShowMetrics(true);
      addLog(`全部流水线完成 ✓ (总耗时 ${elapsed}s)`);
    } catch (err) {
      addLog(`错误: ${err instanceof Error ? err.message : String(err)}`);
      for (const [k, v] of Object.entries(newStatuses)) {
        if (v === 'running') newStatuses[k] = 'error';
      }
      setStepStatuses({ ...newStatuses });
    } finally {
      setRunning(false);
    }
  }, [running, stepStatuses, addLog, simulatedDelay]);

  const resetAll = useCallback(() => {
    if (running) return;
    setStepStatuses(Object.fromEntries(STEPS.map((s) => [s.key, 'pending'])));
    setLogs([]);
    setShowMetrics(false);
    setKpiValues({ users: '--', features: '--', time: '--', accuracy: '--' });
  }, [running]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI 管道工作流</h1>
          <p className="text-sm text-muted-foreground mt-1">
            端到端机器学习流水线：数据加载 → 预处理 → 特征工程 → 模型训练 → 评估
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetAll}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted/50 disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="size-4" />
            重置
          </button>
          <button
            onClick={runAll}
            disabled={running}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            一键运行全部
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {STEPS.map((step, idx) => {
          const status = stepStatuses[step.key];
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              className={`bg-white rounded-xl border-2 p-4 transition-all ${
                status === 'done'
                  ? 'border-green-300 bg-green-50/20'
                  : status === 'running'
                  ? 'border-blue-300 bg-blue-50/20 shadow-blue-100 shadow-md'
                  : status === 'error'
                  ? 'border-red-300 bg-red-50/20'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center size-6 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {idx + 1}
                </span>
                {status === 'done' && <CheckCircle2 className="size-4 text-green-500" />}
                {status === 'running' && <Loader2 className="size-4 text-blue-500 animate-spin" />}
                {status === 'error' && <AlertCircle className="size-4 text-red-500" />}
                {status === 'pending' && <Circle className="size-4 text-muted-foreground/30" />}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`size-5 ${
                  status === 'running' ? 'text-blue-500' :
                  status === 'done' ? 'text-green-600' :
                  'text-muted-foreground'
                }`} />
                <h3 className="font-semibold text-sm">{step.label}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPI_CARD_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="bg-white rounded-xl border p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <Icon className={`size-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xl font-bold">{kpiValues[item.key]}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Feature importance */}
        <SectionCard title="特征重要性 TOP10">
          {showMetrics ? (
            <div className="space-y-2">
              {FEATURE_LABELS.map((f) => (
                <div key={f.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 shrink-0 text-right">{f.cn}</span>
                  <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${f.importance * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono w-12 shrink-0">{(f.importance * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              运行流水线后显示
            </div>
          )}
        </SectionCard>

        {/* Execution log */}
        <SectionCard title="执行日志">
          <div
            ref={logContainerRef}
            className="h-40 overflow-y-auto bg-slate-900 rounded-lg p-3 font-mono text-xs"
          >
            {logs.length === 0 ? (
              <p className="text-slate-500">等待执行...</p>
            ) : (
              logs.map((line, i) => (
                <p key={i} className={`leading-relaxed ${
                  line.includes('✓') ? 'text-green-400' :
                  line.includes('错误') ? 'text-red-400' :
                  line.includes('开始') ? 'text-blue-400' :
                  'text-slate-300'
                }`}>
                  {line}
                </p>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* Model metrics table */}
      {showMetrics && (
        <SectionCard title="模型评估指标">
          <DataTable
            columns={METRIC_COLUMNS}
            data={MOCK_METRICS}
            keyField="modelName"
          />
        </SectionCard>
      )}
    </div>
  );
}
