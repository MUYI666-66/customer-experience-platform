import { useState } from 'react';
import { SectionCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table';
import { cn, formatDateTime } from '@/lib/utils';
import {
  Database, HardDrive, Clock, CheckCircle, XCircle, AlertCircle,
  Loader2, Activity, ArrowRightLeft, BarChart3, Shield, Server,
  FileCheck, RefreshCw,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const pipelineStages = [
  { name: '数据校验', status: 'completed', durationSec: 620, rowsIn: 12000000, rowsOut: 11980000 },
  { name: '缺失值填充', status: 'completed', durationSec: 890, rowsIn: 11980000, rowsOut: 11980000 },
  { name: '异常值剔除', status: 'completed', durationSec: 750, rowsIn: 11980000, rowsOut: 11920000 },
  { name: '数据标准化', status: 'completed', durationSec: 1100, rowsIn: 11920000, rowsOut: 11920000 },
  { name: '质量报告生成', status: 'completed', durationSec: 340, rowsIn: 0, rowsOut: 0 },
  { name: '特征物化', status: 'running', durationSec: 1580, rowsIn: 0, rowsOut: 0 },
];

const jobs = [
  { jobId: 'ing_20260701_01', sourceCode: 'network_kpi_4g', bizDate: '2026-07-01', status: 'completed', rowsIn: 2850000, rowsOut: 2845000, durationSec: 45, errorMsg: null },
  { jobId: 'ing_20260701_02', sourceCode: 'network_kpi_5g', bizDate: '2026-07-01', status: 'completed', rowsIn: 3200000, rowsOut: 3192000, durationSec: 52, errorMsg: null },
  { jobId: 'ing_20260701_03', sourceCode: 'complaint_10010', bizDate: '2026-07-01', status: 'completed', rowsIn: 45000, rowsOut: 44800, durationSec: 18, errorMsg: null },
  { jobId: 'ing_20260701_04', sourceCode: 'user_profile', bizDate: '2026-07-01', status: 'running', rowsIn: 0, rowsOut: 0, durationSec: 0, errorMsg: null },
  { jobId: 'ing_20260630_01', sourceCode: 'terminal_info', bizDate: '2026-06-30', status: 'completed', rowsIn: 1200000, rowsOut: 1195000, durationSec: 120, errorMsg: null },
  { jobId: 'ing_20260630_02', sourceCode: 'geo_data', bizDate: '2026-06-30', status: 'failed', rowsIn: 0, rowsOut: 0, durationSec: 0, errorMsg: 'FTP连接超时' },
];

const qualityScores = [
  { name: '完整性', network_kpi_4g: 99.2, network_kpi_5g: 99.5, complaint_10010: 98.5, user_profile: 99.8, terminal_info: 97.2, geo_data: 95.5 },
  { name: '准确性', network_kpi_4g: 99.5, network_kpi_5g: 99.7, complaint_10010: 99.0, user_profile: 99.9, terminal_info: 98.5, geo_data: 96.0 },
  { name: '一致性', network_kpi_4g: 98.8, network_kpi_5g: 99.1, complaint_10010: 97.8, user_profile: 99.5, terminal_info: 96.8, geo_data: 94.2 },
];

const masterLinkage = {
  totalRecords: 15200000,
  matchedRecords: 15192000,
  unmatchedRecords: 8000,
  linkageAccuracy: 99.94,
  confidenceDistribution: [
    { name: '高置信 >0.95', value: 89.3, fill: '#22C55E' },
    { name: '中置信 0.80-0.95', value: 9.1, fill: '#FACC15' },
    { name: '低置信 <0.80', value: 1.6, fill: '#EF4444' },
  ],
  unmatchedByType: [
    { reason: '终端IMEI缺失', count: 3200 },
    { reason: '基站ID未注册', count: 2800 },
    { reason: '用户标识冲突', count: 2000 },
  ],
};

type IngestionTab = 'pipeline' | 'jobs' | 'quality' | 'linkage';

const statusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="size-4 text-green-500" />;
    case 'running': return <Loader2 className="size-4 text-blue-500 animate-spin" />;
    case 'failed': return <XCircle className="size-4 text-red-500" />;
    case 'queued': return <Clock className="size-4 text-yellow-500" />;
    default: return <AlertCircle className="size-4 text-muted-foreground" />;
  }
};

const statusLabel = (status: string) => {
  const map: Record<string, string> = { completed: '已完成', running: '运行中', failed: '失败', queued: '排队中' };
  return map[status] || status;
};

export function IngestionPage() {
  const [tab, setTab] = useState<IngestionTab>('pipeline');

  const tabs: { key: IngestionTab; label: string; icon: typeof Database }[] = [
    { key: 'pipeline', label: '流水线状态', icon: Activity },
    { key: 'jobs', label: '接入任务', icon: RefreshCw },
    { key: 'quality', label: '数据质量', icon: Shield },
    { key: 'linkage', label: '主数据关联', icon: ArrowRightLeft },
  ];

  const completedStages = pipelineStages.filter(s => s.status === 'completed').length;
  const totalStages = pipelineStages.length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">数据接入监控</h1>
        <p className="text-sm text-muted-foreground mt-1">6大主数据源接入 + 预处理流水线 + 质量监控 — 支持全量+增量双模式</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: '流水线状态', value: `${completedStages}/${totalStages}`, sub: '阶段完成', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '数据总量', value: '4.2TB', sub: '日均处理', icon: HardDrive, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: '整体质量评分', value: '98.1', sub: '/100分', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '关联准确率', value: '99.94%', sub: '≥99.9%目标', icon: ArrowRightLeft, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '检查间隔', value: '15min', sub: '异常自动告警', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-xl border p-4', s.bg)}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <s.icon className="size-3.5" />{s.label}
            </div>
            <div className={cn('text-xl font-bold', s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.key ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pipeline' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: '上次运行', value: '2026-07-01 03:45' },
              { label: '下次运行', value: '2026-07-02 02:00' },
              { label: '运行耗时', value: '88min' },
              { label: '运行状态', value: 'healthy' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border p-4">
                <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                <div className="text-lg font-bold">{s.value}</div>
              </div>
            ))}
          </div>

          <SectionCard title="预处理流水线阶段（daily_preprocessing）">
            <div className="space-y-3">
              {pipelineStages.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="size-8 rounded-full bg-white border flex items-center justify-center">
                    {statusIcon(stage.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{stage.name}</span>
                      <Badge variant="status" value={stage.status === 'completed' ? 'completed' : 'running'} className={cn(
                        stage.status === 'completed' && 'bg-green-50 text-green-700 border-green-200',
                        stage.status === 'running' && 'bg-blue-50 text-blue-700 border-blue-200',
                      )} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      耗时 {stage.durationSec}s · 输入 {stage.rowsIn?.toLocaleString()} · 输出 {stage.rowsOut?.toLocaleString()}
                    </div>
                  </div>
                  {stage.status === 'completed' && <CheckCircle className="size-5 text-green-500 shrink-0" />}
                  {stage.status === 'running' && <Loader2 className="size-5 text-blue-500 animate-spin shrink-0" />}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {tab === 'jobs' && (
        <SectionCard title={`接入任务（${jobs.length}）`}>
          <DataTable
            columns={[
              { key: 'jobId', header: '任务ID', render: (j: typeof jobs[0]) => <span className="font-mono text-xs">{j.jobId}</span> },
              { key: 'sourceCode', header: '数据源', render: (j: typeof jobs[0]) => <span className="font-mono text-sm">{j.sourceCode}</span> },
              { key: 'bizDate', header: '业务日期' },
              { key: 'status', header: '状态', render: (j: typeof jobs[0]) => (
                <div className="flex items-center gap-1.5">
                  {statusIcon(j.status)}
                  <Badge variant="status" value={j.status} className={cn(
                    j.status === 'completed' && 'bg-green-50 text-green-700 border-green-200',
                    j.status === 'running' && 'bg-blue-50 text-blue-700 border-blue-200',
                    j.status === 'failed' && 'bg-red-50 text-red-700 border-red-200',
                  )} />
                </div>
              )},
              { key: 'rowsIn', header: '输入行数', render: (j: typeof jobs[0]) => j.rowsIn > 0 ? j.rowsIn.toLocaleString() : '—' },
              { key: 'rowsOut', header: '输出行数', render: (j: typeof jobs[0]) => j.rowsOut > 0 ? j.rowsOut.toLocaleString() : '—' },
              { key: 'durationSec', header: '耗时', render: (j: typeof jobs[0]) => j.durationSec > 0 ? `${j.durationSec}s` : '—' },
              { key: 'errorMsg', header: '错误信息', render: (j: typeof jobs[0]) => j.errorMsg ? (
                <span className="text-xs text-red-600">{j.errorMsg}</span>
              ) : '—' },
            ]}
            data={jobs}
            keyField="jobId"
          />
        </SectionCard>
      )}

      {tab === 'quality' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="数据质量评分（按数据源）">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={qualityScores} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" domain={[90, 100]} fontSize={12} />
                  <YAxis dataKey="name" type="category" fontSize={12} width={60} />
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="数据源质量明细">
              <div className="space-y-3">
                {qualityScores.map((metric) => (
                  <div key={metric.name} className="border rounded-lg p-3">
                    <div className="text-sm font-medium mb-2">{metric.name}</div>
                    <div className="space-y-1.5">
                      {Object.entries(metric).filter(([k]) => k !== 'name').map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-mono">{k}</span>
                          <span className={cn('font-mono font-bold', (v as number) >= 99 ? 'text-green-600' : (v as number) >= 95 ? 'text-orange-600' : 'text-red-600')}>
                            {(v as number).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {tab === 'linkage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { label: '总记录数', value: masterLinkage.totalRecords.toLocaleString() },
              { label: '匹配成功', value: masterLinkage.matchedRecords.toLocaleString(), color: 'text-green-600' },
              { label: '未匹配', value: masterLinkage.unmatchedRecords.toLocaleString(), color: 'text-red-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border p-4">
                <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                <div className={cn('text-2xl font-bold', s.color)}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title={`关联准确率: ${masterLinkage.linkageAccuracy}%`}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={masterLinkage.confidenceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" fontSize={11} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="value" name="占比%" radius={[4, 4, 0, 0]}>
                    {masterLinkage.confidenceDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="未匹配分析">
              <div className="space-y-3">
                {masterLinkage.unmatchedByType.map((item) => (
                  <div key={item.reason} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <FileCheck className="size-4 text-orange-500" />
                    <span className="flex-1 text-sm">{item.reason}</span>
                    <span className="text-sm font-mono font-bold">{item.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
