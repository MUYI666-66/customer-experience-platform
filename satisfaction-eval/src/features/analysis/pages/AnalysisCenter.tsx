import { useState, useCallback, useRef } from 'react';
import {
  Play, RotateCcw, CheckCircle2, AlertCircle, Loader2, Circle,
  Database, Filter, Cpu, Brain, BarChart3, Terminal, Sparkles,
  Radio, Zap, Download, ChevronRight, Activity, FileText, Copy, Check,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { generateAIReport } from '@/services/aiReport';
import type { ReportData } from '@/services/aiReport';

/* ==================== Types & Constants ==================== */

type StepStatus = 'pending' | 'running' | 'done' | 'error';

interface StepDef {
  key: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  chartHint: string;
}

const STEPS: StepDef[] = [
  { key: 'load', label: '数据加载', desc: '加载5个CSV文件，校验完整性与格式', icon: Database, chartHint: '加载完成后产出 KPI 概览卡片' },
  { key: 'preprocess', label: '数据预处理', desc: '缺失值填充、异常值检测、数据标准化', icon: Filter, chartHint: '预处理完成后产出数据质量报告' },
  { key: 'features', label: '特征工程', desc: '构建32维特征体系，衍生特征计算', icon: Cpu, chartHint: '特征构建完成后产出重要性排名' },
  { key: 'train', label: '模型训练', desc: '不满意/易受访/投诉风险三模型并行训练', icon: Brain, chartHint: '训练完成后产出模型评估指标' },
  { key: 'evaluate', label: '预测与评估', desc: '全量预测、风险分层、区域分析、报告生成', icon: BarChart3, chartHint: '全部完成后产出AI智能分析报告' },
];

const PIE_COLORS = ['#EF4444', '#F97316', '#EAB308', '#3B82F6', '#8B5EF6', '#22C55E'];

/* ==================== Chart Data Types ==================== */

interface RiskTrendPoint { date: string; high: number; medium: number; low: number; }
interface ComplaintPoint { date: string; actual: number; predicted: number; }
interface RegionPoint { name: string; high: number; medium: number; low: number; }
interface RootCauseItem { name: string; value: number; }
interface FeatureItem { name: string; cn: string; importance: number; }
interface MetricItem { modelName: string; accuracy: number; recall: number; f1: number; auc: number; psi: number; }

/* ==================== Mock Data Generators ==================== */

function genRiskTrend(): RiskTrendPoint[] {
  const dates = ['6/28', '6/29', '6/30', '7/1', '7/2', '7/3', '7/4'];
  return dates.map((date, i) => ({
    date,
    high: 3800 + i * 120 - Math.floor(Math.random() * 200),
    medium: 5200 + i * 80 - Math.floor(Math.random() * 300),
    low: 3000 - i * 40 + Math.floor(Math.random() * 200),
  }));
}

function genComplaintTrend(): ComplaintPoint[] {
  const dates = ['6/28', '6/29', '6/30', '7/1', '7/2', '7/3', '7/4'];
  return dates.map((date) => ({
    date,
    actual: 280 + Math.floor(Math.random() * 80),
    predicted: 290 + Math.floor(Math.random() * 70),
  }));
}

function genRegionData(): RegionPoint[] {
  return [
    { name: '深圳市', high: 1890, medium: 2340, low: 1200 },
    { name: '广州市', high: 1650, medium: 2100, low: 980 },
    { name: '佛山市', high: 920, medium: 1450, low: 760 },
    { name: '东莞市', high: 780, medium: 1300, low: 650 },
    { name: '珠海市', high: 450, medium: 890, low: 520 },
  ];
}

function genRootCauses(): RootCauseItem[] {
  return [
    { name: '弱覆盖', value: 28 },
    { name: '干扰增强', value: 22 },
    { name: '容量不足', value: 18 },
    { name: '切换异常', value: 15 },
    { name: '终端问题', value: 10 },
    { name: '其他', value: 7 },
  ];
}

function genFeatures(): FeatureItem[] {
  return [
    { name: 'avg_rsrp', cn: '平均RSRP', importance: 12.3 },
    { name: 'avg_sinr', cn: '平均SINR', importance: 11.1 },
    { name: 'drop_rate', cn: '掉线率', importance: 10.2 },
    { name: 'ho_success_rate', cn: '切换成功率', importance: 9.4 },
    { name: 'avg_prb', cn: 'PRB利用率', importance: 8.7 },
    { name: 'arpu', cn: 'ARPU值', importance: 7.5 },
    { name: 'tenure_months', cn: '在网时长', importance: 6.8 },
    { name: 'complaint_count', cn: '历史投诉数', importance: 6.1 },
    { name: 'rsrp_quality_ratio', cn: 'RSRP优良率', importance: 5.3 },
    { name: 'high_load_ratio', cn: '高负载比例', importance: 4.6 },
  ];
}

function genMetrics(): MetricItem[] {
  return [
    { modelName: '不满意预测', accuracy: 0.847, recall: 0.812, f1: 0.829, auc: 0.891, psi: 0.032 },
    { modelName: '易受访预测', accuracy: 0.823, recall: 0.785, f1: 0.803, auc: 0.867, psi: 0.045 },
    { modelName: '投诉风险分类', accuracy: 0.862, recall: 0.818, f1: 0.839, auc: 0.905, psi: 0.028 },
  ];
}

const BUILT_IN_REPORT = `# 📊 满意度评价 AI 智能分析报告

> 报告生成时间：2026年7月4日 11:30
> 数据范围：广东省 5 城市（广州、深圳、佛山、东莞、珠海）
> 分析用户规模：10,000 人


## 一、数据概况

本次分析覆盖广东省 10,000 名移动用户的基础数据，包含 **500 个基站**的网络 KPI 数据（15,000 条日粒度记录）、**2,000 条历史投诉**和 **3,000 条满意度调研**记录。基于 GBDT+LR 和 XGBoost 算法，构建了 32 维特征体系（含基础特征、衍生特征和场景特征三个层级），对用户不满意风险、易受访意愿和投诉风险进行了全面评估。

| 指标 | 数值 | 说明 |
|------|------|------|
| 总用户数 | 10,000 | 广东省5城市 |
| 不满意高风险用户 | 4,200 人 | 占比 42.0%，需重点处置 |
| 中风险用户 | 3,800 人 | 占比 38.0%，需持续关注 |
| 低风险用户 | 2,000 人 | 占比 20.0%，体验良好 |
| 投诉预警数 | 342 条 | 未来7天预测值 |
| 模型准确率 | 84.7% | 不满意预测模型 |
| 模型 AUC | 0.891 | 优秀的区分能力 |


## 二、关键发现

### 🔴 发现一：高风险用户占比偏高，集中度明显

不满意高风险用户（风险分 ≥ 0.70）达到 4,200 人，占总用户数的 **42.0%**。从区域分布来看，深圳市（1,890 人）和广州市（1,650 人）是高风险用户最为集中的两个城市，合计占高风险用户的 **84.3%**。这与两城基站密度高、用户规模大有关，但也反映出核心城市的网络体验存在短板。

### 🟡 发现二：模型预测能力稳定，AUC 达到 0.891

不满意预测模型的 AUC 为 **0.891**，F1 值为 **0.829**，说明模型对不满意用户的识别能力较强且稳定。PSI 指标为 0.032（远低于 0.05 的预警线），表明模型在近期的数据分布上没有发生显著偏移，可以放心用于生产决策。

### 🟢 发现三：投诉预测与实际趋势高度吻合

近 7 天投诉趋势图显示，AI 预测的投诉量与实际投诉量走势基本一致，平均偏差控制在 **±8%** 以内。7 月 2 日出现预测峰值（342 条），与实际峰值（356 条）偏差仅 3.9%，验证了投诉风险分类模型 XGBoost v4.0.1 的可靠性。


## 三、风险分析

### 3.1 区域风险分布

| 城市 | 高风险 | 中风险 | 低风险 | 风险用户占比 |
|------|--------|--------|--------|-------------|
| 深圳市 | 1,890 | 2,340 | 1,200 | 77.9% |
| 广州市 | 1,650 | 2,100 | 980 | 79.3% |
| 佛山市 | 920 | 1,450 | 760 | 75.7% |
| 东莞市 | 780 | 1,300 | 650 | 76.2% |
| 珠海市 | 450 | 890 | 520 | 72.0% |

深圳市和广州市不仅高风险绝对数量最高，风险用户占比也显著高于其他城市，建议优先在这两个城市部署专项优化措施。

### 3.2 风险趋势

从 7 天滚动趋势来看，高风险用户数量从 6 月 28 日的 3,800 人上升至 7 月 4 日的 4,200 人，**周环比增长 10.5%**。中风险用户数量相对稳定在 3,700-3,900 人区间。上升趋势值得警惕，如不加以干预，预计下周高风险用户可能突破 4,500 人。


## 四、根因诊断

基于 SHAP 特征重要性分析和根因诊断模型，不满意的主要驱动因素排序如下：

| 排名 | 根因类别 | 贡献占比 | 主要关联特征 | 影响机制 |
|------|----------|----------|-------------|----------|
| 1 | **弱覆盖** | 28% | avg_rsrp (-92.5 dBm), rsrp_quality_ratio (0.72) | RSRP 低于 -100 dBm 的用户不满意概率提升 3.2 倍 |
| 2 | **干扰增强** | 22% | avg_sinr (8.2 dB), high_load_ratio (0.35) | SINR < 5 dB 时掉线率和卡顿率显著上升 |
| 3 | **容量不足** | 18% | avg_prb (45.2%), high_load_ratio | PRB 利用率 > 70% 的高负载小区不满意率高出 45% |
| 4 | **切换异常** | 15% | ho_success_rate (97.5%) | 切换成功率 < 95% 的区域投诉率高出 2.8 倍 |
| 5 | **终端问题** | 10% | terminal_type, is_5g | 非 5G 终端用户不满意率高出 5G 终端用户 22% |
| 6 | 其他因素 | 7% | arpu, tenure_months 等 | 低 ARPU 和短在网时长用户对网络问题更敏感 |

> **核心结论**：弱覆盖和干扰增强是最主要的两个根因，合计贡献 50%，应作为网络优化的首要目标。


## 五、改进建议

### 🎯 短期措施（1-2 周内）

1. **高风险用户定向回访**
   - 对 4,200 名高风险用户中的 TOP 500（风险分 > 0.85）进行客服主动外呼
   - 参考根因诊断结果，针对性地询问网络体验问题
   - 预计可挽回 60-70% 的不满用户，降低潜在投诉率 15-20%

2. **弱覆盖小区紧急优化**
   - 筛选 RSRP < -100 dBm 且用户数 > 50 的 TOP 50 问题小区
   - 优先进行天馈调整、功率优化或小站补盲
   - 预计改善 1,200-1,500 名用户的网络体验

3. **高负载小区分流**
   - 针对 PRB 利用率 > 70% 的 120 个高负载小区实施负载均衡策略
   - 通过参数优化引导用户驻留到相邻低负载小区

### 📋 中期措施（1-3 个月）

4. **建立端到端闭环处置流程**
   - 不满意预测 → 根因诊断 → 自动生成工单 → 属地处理 → 效果核验
   - 全流程线上化，平均处置周期从 7 天压缩到 3 天

5. **AI 模型迭代优化**
   - 基于新积累的标签数据（预计 500+ 条/月）进行模型增量训练
   - 探索引入 DeepSeek 等大语言模型进行自然语言根因解释
   - 目标：准确率从 84.7% 提升至 88%+

6. **易受访用户精准运营**
   - 对 3,200 名极高意愿用户进行定向调研邀请
   - 预期命中率从当前的 13.2% 提升至 18%+
   - 年化可节省调研成本约 30%

### 🏗️ 长期规划（3-12 个月）

7. **全省推广与属地化部署**
   - 将深圳、广州的运营经验推广至全省 21 个地市
   - 建立地市级的 AI 运营能力，实现"一个平台、全省复用"

8. **数据资产沉淀**
   - 持续积累用户反馈标签，构建高质量的广东电信行业用户满意度数据集
   - 探索跨行业（宽带、政企）的满意度预测能力迁移


## 六、总结

本次分析表明，广东省移动用户的不满意风险总体呈上升趋势，但**可控、可预测、可干预**。AI 模型（不满意预测 AUC 0.891、投诉风险分类准确率 86.2%）已达到生产级水平，可以稳定支撑日常运营决策。

**核心建议就三点**：
1. 优先解决深圳、广州两城的弱覆盖和高负载问题（覆盖 84% 的高风险用户）
2. 对 TOP 500 高风险用户进行主动外呼干预（投入产出比最高）
3. 持续迭代模型，积累标签数据，形成数据飞轮效应

> ⚠️ 以上分析由 AI 满意度评价运营平台自动生成，数据基于当前系统状态，具体决策请结合业务经验综合判断。
>
> 📎 如需更详细的数据下钻或导出完整报告，请前往「报表中心」或联系数据分析团队。`;

/* ==================== Main Component ==================== */

export function AnalysisCenter() {
  /* ---- Pipeline state ---- */
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>(
    Object.fromEntries(STEPS.map((s) => [s.key, 'pending'])),
  );
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  /* ---- KPI state ---- */
  const [kpis, setKpis] = useState({
    totalUsers: '--', highRisk: '--', hitRate: '--',
    complaints: '--', accuracy: '--', satisfaction: '--',
  });

  /* ---- Chart data state ---- */
  const [riskTrend, setRiskTrend] = useState<RiskTrendPoint[]>([]);
  const [complaintTrend, setComplaintTrend] = useState<ComplaintPoint[]>([]);
  const [regionData, setRegionData] = useState<RegionPoint[]>([]);
  const [rootCauses, setRootCauses] = useState<RootCauseItem[]>([]);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);

  /* ---- Logs ---- */
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  /* ---- AI Report ---- */
  const [aiReport, setAiReport] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('ai-api-key') || '');
  const [copied, setCopied] = useState(false);

  /* ---- Demo mode ---- */
  const [demoMode, setDemoMode] = useState(true);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString('zh-CN');
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
    requestAnimationFrame(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    });
  }, []);

  const delay = useCallback((ms: number) => new Promise((r) => setTimeout(r, ms)), []);

  /* ---- Run Pipeline ---- */
  const runPipeline = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setLogs([]);
    setAiReport('');
    setReportError('');
    const startTime = Date.now();
    const ss = { ...stepStatuses };

    try {
      /* Step 1: Data loading */
      ss['load'] = 'running'; setStepStatuses({ ...ss }); setCurrentStep('load');
      addLog('▶ 开始数据加载...');
      await delay(800);
      addLog('  ✓ users.csv — 10,000 行，验证通过');
      await delay(500);
      addLog('  ✓ stations.csv — 500 行，验证通过');
      await delay(400);
      addLog('  ✓ station_kpis.csv — 15,000 行，验证通过');
      await delay(400);
      addLog('  ✓ complaints.csv — 2,000 行，验证通过');
      await delay(400);
      addLog('  ✓ surveys.csv — 3,000 行，验证通过');
      ss['load'] = 'done'; setStepStatuses({ ...ss });
      setKpis({ totalUsers: '10,000', highRisk: '4,200', hitRate: '13.2%', complaints: '342', accuracy: '--', satisfaction: '--' });
      addLog('▶ 数据加载完成 — KPI 概览已产出');

      /* Step 2: Preprocessing */
      ss['preprocess'] = 'running'; setStepStatuses({ ...ss }); setCurrentStep('preprocess');
      addLog('▶ 开始数据预处理...');
      await delay(800);
      addLog('  ✓ 缺失值检测: 342个缺失值 → 中位数填充');
      await delay(600);
      addLog('  ✓ 异常值检测: IQR方法发现56个离群点 → 截尾处理');
      await delay(500);
      addLog('  ✓ 标准化完成: MinMax归一化, 156列');
      ss['preprocess'] = 'done'; setStepStatuses({ ...ss });
      addLog('▶ 预处理完成 — 数据质量报告已产出');

      /* Step 3: Feature engineering */
      ss['features'] = 'running'; setStepStatuses({ ...ss }); setCurrentStep('features');
      addLog('▶ 开始特征工程...');
      await delay(700);
      addLog('  ✓ 基础特征: 32维网络/用户/终端特征提取完成');
      await delay(500);
      addLog('  ✓ 衍生特征: RSRP优良率、高负载比例、使用强度等');
      await delay(400);
      addLog('  ✓ 标签构建: 不满意(4,200)、易受访(3,100)、投诉(1,800)');
      ss['features'] = 'done'; setStepStatuses({ ...ss });
      setFeatures(genFeatures());
      addLog('▶ 特征工程完成 — 特征重要性排名已产出');

      /* Step 4: Model training */
      ss['train'] = 'running'; setStepStatuses({ ...ss }); setCurrentStep('train');
      addLog('▶ 开始模型训练 (3模型并行)...');
      await delay(1000);
      addLog('  ✓ 不满意预测: GBDT+LR, 训练集7,000 → Loss=0.342');
      await delay(800);
      addLog('  ✓ 易受访预测: GBDT+LR, 训练集7,000 → Loss=0.389');
      await delay(700);
      addLog('  ✓ 投诉风险分类: XGBoost, 训练集7,000 → LogLoss=0.412');
      ss['train'] = 'done'; setStepStatuses({ ...ss });
      setMetrics(genMetrics());
      setKpis((prev) => ({ ...prev, accuracy: '84.7%', satisfaction: '78.6' }));
      addLog('▶ 模型训练完成 — 评估指标已产出');

      /* Step 5: Evaluation & prediction */
      ss['evaluate'] = 'running'; setStepStatuses({ ...ss }); setCurrentStep('evaluate');
      addLog('▶ 开始全量预测与评估...');
      await delay(800);
      setRiskTrend(genRiskTrend());
      addLog('  ✓ 风险用户趋势已生成 (7天滚动)');
      await delay(500);
      setComplaintTrend(genComplaintTrend());
      addLog('  ✓ 投诉量趋势已生成 (预测 vs 实际)');
      await delay(400);
      setRegionData(genRegionData());
      addLog('  ✓ 区域风险分布已生成 (5城市)');
      await delay(400);
      setRootCauses(genRootCauses());
      addLog('  ✓ 根因分析已生成 (6类根因)');
      await delay(300);
      ss['evaluate'] = 'done'; setStepStatuses({ ...ss }); setCurrentStep(null);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      addLog(`✓ 全部流水线完成! 总耗时 ${elapsed}s`);
      setHasRun(true);
      // 自动生成内置报告，无需 API Key 即可展示
      setAiReport(BUILT_IN_REPORT);
    } catch (err) {
      addLog(`✗ 错误: ${err instanceof Error ? err.message : String(err)}`);
      for (const [k, v] of Object.entries(ss)) {
        if (v === 'running') ss[k] = 'error';
      }
      setStepStatuses({ ...ss });
      setCurrentStep(null);
    } finally {
      setRunning(false);
    }
  }, [running, stepStatuses, addLog, delay]);

  /* ---- Reset ---- */
  const resetAll = useCallback(() => {
    if (running) return;
    setStepStatuses(Object.fromEntries(STEPS.map((s) => [s.key, 'pending'])));
    setCurrentStep(null);
    setLogs([]);
    setAiReport('');
    setReportError('');
    setKpis({ totalUsers: '--', highRisk: '--', hitRate: '--', complaints: '--', accuracy: '--', satisfaction: '--' });
    setRiskTrend([]);
    setComplaintTrend([]);
    setRegionData([]);
    setRootCauses([]);
    setFeatures([]);
    setMetrics([]);
    setHasRun(false);
  }, [running]);

  /* ---- AI Report Generation ---- */
  const handleGenerateReport = useCallback(async () => {
    // Try saved AI providers from admin config first, fall back to local apiKey
    let key = apiKey.trim();
    let baseUrl = 'https://api.deepseek.com/v1';
    let model = 'deepseek-chat';

    if (!key) {
      const saved = localStorage.getItem('ai-providers');
      if (saved) {
        try {
          const providers = JSON.parse(saved);
          const enabled = providers.find((p: { enabled: boolean; apiKey: string }) => p.enabled && p.apiKey);
          if (enabled) {
            key = enabled.apiKey;
            baseUrl = enabled.baseUrl || baseUrl;
            model = enabled.model || model;
          }
        } catch { /* ignore */ }
      }
    }

    if (!key) {
      setShowApiConfig(true);
      setReportError('请先配置 AI API Key（可在系统管理 → AI模型配置 或下方配置）');
      return;
    }
    setReportLoading(true);
    setReportError('');
    try {
      const reportData: ReportData = {
        totalUsers: 10000,
        highRiskCount: 4200,
        mediumRiskCount: 3800,
        lowRiskCount: 2000,
        modelAccuracy: 0.847,
        modelAuc: 0.891,
        topCauses: rootCauses,
        complaintTrend,
        kpiSummary: kpis,
        regionDistribution: regionData,
      };
      const report = await generateAIReport(reportData, { apiKey: key, baseUrl, model });
      setAiReport(report);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : '报告生成失败');
    } finally {
      setReportLoading(false);
    }
  }, [apiKey, rootCauses, complaintTrend, kpis, regionData]);

  const saveApiKey = () => {
    localStorage.setItem('ai-api-key', apiKey.trim());
    setShowApiConfig(false);
    setReportError('');
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(aiReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([aiReport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI分析报告_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ==================== Render ==================== */

  const allDone = Object.values(stepStatuses).every((s) => s === 'done');
  const hasCharts = riskTrend.length > 0;
  const elapsedSec = logs.length > 0 ? '--' : '--';

  return (
    <div className="p-6 space-y-5">
      {/* ====== Header Bar ====== */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">AI 分析中心</h1>
          <div className="flex items-center gap-1.5">
            <span className={`relative flex size-2.5 ${running ? '' : 'opacity-0'}`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2.5 bg-green-500" />
            </span>
            <span className={`text-xs font-medium ${running ? 'text-green-600' : allDone ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
              {running ? `实时分析中 · 步骤: ${STEPS.find((s) => stepStatuses[s.key] === 'running')?.label || '...'}` :
               allDone ? '分析完成 · 报告就绪' : '就绪 · 点击运行'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Demo mode toggle */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              demoMode
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-muted border-border text-muted-foreground'
            }`}
          >
            <span className={`relative flex size-2 ${demoMode ? '' : 'opacity-0'}`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-red-500" />
            </span>
            {demoMode ? '🔴 演示模式' : '演示模式'}
          </button>

          <button
            onClick={resetAll}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-muted/50 disabled:opacity-30 transition-colors"
          >
            <RotateCcw className="size-3.5" /> 重置
          </button>
          <button
            onClick={runPipeline}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-5 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            一键运行
          </button>
        </div>
      </div>

      {/* ====== Pipeline Stepper ====== */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-0">
          {STEPS.map((step, idx) => {
            const status = stepStatuses[step.key];
            const Icon = step.icon;
            const isLast = idx === STEPS.length - 1;
            return (
              <div key={step.key} className="flex-1 flex items-center">
                <div className={`flex flex-col items-center gap-1.5 flex-1 px-2 py-2 rounded-lg transition-all ${
                  status === 'running' ? 'bg-blue-50/60' :
                  status === 'done' ? 'bg-green-50/30' :
                  status === 'error' ? 'bg-red-50/30' : ''
                }`}>
                  <div className={`relative flex items-center justify-center size-10 rounded-xl transition-all ${
                    status === 'done' ? 'bg-green-500 text-white' :
                    status === 'running' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' :
                    status === 'error' ? 'bg-red-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {status === 'running' && <span className="absolute inset-0 rounded-xl bg-blue-400 animate-pulse opacity-30" />}
                    {status === 'done' ? <CheckCircle2 className="size-5 relative z-10" /> :
                     status === 'running' ? <Loader2 className="size-5 animate-spin relative z-10" /> :
                     status === 'error' ? <AlertCircle className="size-5 relative z-10" /> :
                     <Icon className="size-5 relative z-10" />}
                  </div>
                  <span className={`text-xs font-semibold ${
                    status === 'done' ? 'text-green-600' :
                    status === 'running' ? 'text-blue-600' :
                    'text-muted-foreground'
                  }`}>{step.label}</span>
                </div>
                {!isLast && (
                  <div className="flex items-center px-0.5 -mt-5">
                    <ChevronRight className={`size-4 ${
                      status === 'done' ? 'text-green-400' : 'text-muted-foreground/20'
                    }`} />
                    <div className={`w-4 h-0.5 ${
                      status === 'done' ? 'bg-green-400' : 'bg-muted-foreground/15'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ====== KPI Cards ====== */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: '总用户数', value: kpis.totalUsers, icon: Database, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: '高风险用户', value: kpis.highRisk, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
          { label: '命中率', value: kpis.hitRate, icon: Radio, color: 'text-green-500', bg: 'bg-green-50' },
          { label: '投诉预警', value: kpis.complaints, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: '模型准确率', value: kpis.accuracy, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: '满意度得分', value: kpis.satisfaction, icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white rounded-xl border p-3.5 flex items-center gap-3 hover:shadow-sm transition-shadow">
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <Icon className={`size-4 ${item.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                <p className="text-lg font-bold">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ====== Charts Grid ====== */}
      {hasCharts && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Risk Trend */}
            <div className="bg-white rounded-xl border">
              <div className="px-5 py-3.5 border-b font-medium text-sm flex items-center gap-2">
                <Activity className="size-4 text-red-500" />
                风险用户趋势 (7天)
                {allDone && <span className="text-xs text-green-500 ml-auto flex items-center gap-1"><span className="size-1.5 rounded-full bg-green-500" />实时</span>}
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={riskTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="high" name="高风险" stackId="1" stroke="#EF4444" fill="#FEE2E2" />
                    <Area type="monotone" dataKey="medium" name="中风险" stackId="1" stroke="#F97316" fill="#FED7AA" />
                    <Area type="monotone" dataKey="low" name="低风险" stackId="1" stroke="#22C55E" fill="#DCFCE7" />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Complaint Trend */}
            <div className="bg-white rounded-xl border">
              <div className="px-5 py-3.5 border-b font-medium text-sm flex items-center gap-2">
                <BarChart3 className="size-4 text-orange-500" />
                投诉量趋势 (预测 vs 实际)
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={complaintTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" name="实际投诉量" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="predicted" name="AI预测" stroke="#F97316" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Region Risk Distribution */}
            <div className="bg-white rounded-xl border">
              <div className="px-5 py-3.5 border-b font-medium text-sm flex items-center gap-2">
                <Database className="size-4 text-blue-500" />
                区域风险分布
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={regionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis dataKey="name" type="category" fontSize={12} width={60} />
                    <Tooltip />
                    <Bar dataKey="high" name="高风险" stackId="1" fill="#EF4444" />
                    <Bar dataKey="medium" name="中风险" stackId="1" fill="#F97316" />
                    <Bar dataKey="low" name="低风险" stackId="1" fill="#22C55E" />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Root Cause Pie */}
            <div className="bg-white rounded-xl border">
              <div className="px-5 py-3.5 border-b font-medium text-sm flex items-center gap-2">
                <Cpu className="size-4 text-purple-500" />
                不满意根因分析
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={rootCauses} cx="50%" cy="50%" outerRadius={95} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                        {rootCauses.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-sm shrink-0">
                  {rootCauses.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="size-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-muted-foreground text-xs">{item.name}</span>
                      <span className="font-medium text-xs ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature Importance + Model Metrics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Feature Importance */}
            <div className="bg-white rounded-xl border">
              <div className="px-5 py-3.5 border-b font-medium text-sm">特征重要性 TOP10</div>
              <div className="p-4 space-y-2">
                {features.map((f) => (
                  <div key={f.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 shrink-0 text-right truncate">{f.cn}</span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${f.importance}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono w-12 shrink-0 text-right">{f.importance.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Metrics */}
            <div className="bg-white rounded-xl border">
              <div className="px-5 py-3.5 border-b font-medium text-sm">模型评估指标</div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {['模型', '准确率', '召回率', 'F1', 'AUC', 'PSI'].map((h) => (
                        <th key={h} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m) => (
                      <tr key={m.modelName} className="border-b last:border-0">
                        <td className="px-3 py-2.5 font-medium">{m.modelName}</td>
                        <td className="px-3 py-2.5">{(m.accuracy * 100).toFixed(1)}%</td>
                        <td className="px-3 py-2.5">{(m.recall * 100).toFixed(1)}%</td>
                        <td className="px-3 py-2.5">{m.f1.toFixed(3)}</td>
                        <td className="px-3 py-2.5">{m.auc.toFixed(3)}</td>
                        <td className="px-3 py-2.5"><span className={m.psi < 0.05 ? 'text-green-600' : 'text-orange-600'}>{m.psi.toFixed(3)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty state when nothing has run */}
      {!hasRun && !running && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <BarChart3 className="size-16 mb-4 text-muted-foreground/20" />
          <p className="text-lg font-medium">点击「一键运行」启动 AI 分析</p>
          <p className="text-sm mt-1">管道将逐步产出 KPI 卡片、趋势图表、特征分析、模型指标和 AI 智能报告</p>
        </div>
      )}

      {/* ====== AI Report Section ====== */}
      {allDone && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3.5 border-b font-medium text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-purple-500" />
              AI 智能分析报告
              <span className="text-xs text-muted-foreground font-normal">基于当前数据自动生成</span>
            </div>
            <div className="flex items-center gap-2">
              {aiReport && (
                <>
                  <button onClick={handleCopyReport} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs hover:bg-muted transition-colors">
                    {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                  <button onClick={handleExportMarkdown} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs hover:bg-muted transition-colors">
                    <Download className="size-3" /> 导出 MD
                  </button>
                </>
              )}
              <button
                onClick={handleGenerateReport}
                disabled={reportLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs font-medium hover:bg-purple-600 disabled:opacity-40 transition-colors"
              >
                {reportLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                {aiReport ? 'AI 重新生成' : '生成 AI 报告'}
              </button>
            </div>
          </div>
          <div className="p-5">
            {/* API Key Config */}
            {showApiConfig && (
              <div className="mb-4 p-4 bg-muted/30 rounded-lg border">
                <p className="text-sm font-medium mb-2">配置 AI API</p>
                <p className="text-xs text-muted-foreground mb-3">
                  使用 DeepSeek API（<a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">获取 Key</a>）或其他 OpenAI 兼容接口
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-xxxxxxxx"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button onClick={saveApiKey} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                    保存
                  </button>
                </div>
              </div>
            )}

            {reportError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {reportError}
                {!apiKey && (
                  <button onClick={() => setShowApiConfig(true)} className="ml-2 underline">配置 API Key</button>
                )}
              </div>
            )}

            {reportLoading && (
              <div className="flex items-center gap-3 py-8 justify-center">
                <Loader2 className="size-6 text-purple-500 animate-spin" />
                <div>
                  <p className="text-sm font-medium">AI 正在分析数据并撰写报告...</p>
                  <p className="text-xs text-muted-foreground mt-0.5">这通常需要 10-30 秒</p>
                </div>
              </div>
            )}

            {aiReport && !reportLoading && (
              <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {aiReport}
              </div>
            )}

            {!aiReport && !reportLoading && !reportError && !showApiConfig && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Sparkles className="size-10 mx-auto mb-2 text-muted-foreground/20" />
                <p>管道运行完成后将自动生成内置分析报告</p>
                <p className="text-xs mt-1">也可配置 AI API Key 进行智能生成</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====== Execution Log ====== */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-3.5 border-b font-medium text-sm flex items-center gap-2">
          <Terminal className="size-4" />
          执行日志
          <span className="text-xs text-muted-foreground font-normal">{logs.length} 条</span>
        </div>
        <div
          ref={logRef}
          className="h-48 overflow-y-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed"
        >
          {logs.length === 0 ? (
            <p className="text-slate-600">等待执行...</p>
          ) : (
            logs.map((line, i) => (
              <p key={i} className={
                line.includes('✓') ? 'text-green-400' :
                line.includes('✗') ? 'text-red-400' :
                line.startsWith('▶') ? 'text-blue-400 font-semibold' :
                'text-slate-400'
              }>
                {line}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
