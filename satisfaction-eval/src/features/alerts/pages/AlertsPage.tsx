import { useState } from 'react';
import { SectionCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table';
import { cn, formatDateTime } from '@/lib/utils';
import {
  Bell, BellRing, CheckCircle, AlertTriangle, Clock, ShieldBan,
  Activity, Zap, Gauge, Database, FileWarning, TrendingDown,
} from 'lucide-react';

const alertRules = [
  { ruleId: 'R001', name: '数据质量下降', category: 'data', condition: 'quality_score < 95', threshold: '95分', severity: 'critical', enabled: true },
  { ruleId: 'R002', name: '实时推理P95超时', category: 'inference', condition: 'p95_latency > 800ms 连续5分钟', threshold: '800ms', severity: 'high', enabled: true },
  { ruleId: 'R003', name: '模型准确率漂移', category: 'model', condition: 'PSI月环比 > 0.1', threshold: 'PSI 0.1', severity: 'high', enabled: true },
  { ruleId: 'R004', name: '命中率低于基线', category: 'business', condition: 'hit_rate < 10% 当月', threshold: '10%', severity: 'high', enabled: true },
  { ruleId: 'R005', name: '投诉时序MAPE超标', category: 'model', condition: 'MAPE > 15% 连续7天', threshold: '15%', severity: 'medium', enabled: true },
  { ruleId: 'R006', name: '接入任务失败', category: 'data', condition: 'ingestion_job.status = failed', threshold: '立即', severity: 'critical', enabled: true },
  { ruleId: 'R007', name: '批量预测超时', category: 'inference', condition: 'batch_duration > 10s', threshold: '10秒', severity: 'medium', enabled: true },
  { ruleId: 'R008', name: '预处理流水线异常', category: 'data', condition: 'pipeline_stage_failed', threshold: '15分钟', severity: 'critical', enabled: true },
];

const activeAlerts = [
  { id: 'ALT20260701001', ruleId: 'R003', title: '不满意模型PSI漂移', severity: 'high', detail: 'PSI从0.032上升至0.048，月环比+50%', triggeredAt: '2026-07-01 08:15', status: 'acknowledged', handler: '模型工程组' },
  { id: 'ALT20260701002', ruleId: 'R006', title: '地理场景数据FTP接入失败', severity: 'critical', detail: 'FTP连接超时，geo_data源最后成功同步: 2026-06-01', triggeredAt: '2026-07-01 06:00', status: 'open', handler: null },
  { id: 'ALT20260701003', ruleId: 'R004', title: '珠海地区命中率降至8.5%', severity: 'high', detail: '珠海市本月命中率8.5%，低于10%基线', triggeredAt: '2026-07-01 09:00', status: 'open', handler: null },
  { id: 'ALT20260701004', ruleId: 'R001', title: '客服数据完整性降至93.2%', severity: 'medium', detail: 'complaint_10010数据源完整性评分93.2，低于95分阈值', triggeredAt: '2026-07-01 07:30', status: 'resolved', handler: '数据治理组' },
];

const dqAlerts = [
  { type: '完整性告警', dataset: 'complaint_10010', score: 93.2, threshold: 95, triggered: true, time: '2026-07-01 07:30' },
  { type: '一致性告警', dataset: 'geo_data', score: 94.2, threshold: 95, triggered: true, time: '2026-07-01 06:00' },
];

const alertStats = {
  totalToday: 4,
  bySeverity: { critical: 1, high: 2, medium: 1, low: 0 },
  byStatus: { open: 2, acknowledged: 1, resolved: 1 },
  avgResponseMin: 12,
  avgResolveMin: 45,
  within15minRate: 0.92,
};

type AlertTab = 'active' | 'rules' | 'data-quality' | 'stats';

const severityIcon = (s: string) => {
  switch (s) {
    case 'critical': return <ShieldBan className="size-4 text-red-600" />;
    case 'high': return <AlertTriangle className="size-4 text-orange-600" />;
    case 'medium': return <Activity className="size-4 text-yellow-600" />;
    default: return <CheckCircle className="size-4 text-green-600" />;
  }
};

export function AlertsPage() {
  const [tab, setTab] = useState<AlertTab>('active');

  const tabs: { key: AlertTab; label: string; icon: typeof Bell }[] = [
    { key: 'active', label: '活跃告警', icon: BellRing },
    { key: 'rules', label: '告警规则', icon: ShieldBan },
    { key: 'data-quality', label: '数据质量', icon: Database },
    { key: 'stats', label: '告警统计', icon: Activity },
  ];

  const alertColumns = [
    { key: 'id', header: '告警ID', render: (a: typeof activeAlerts[0]) => <span className="font-mono text-xs">{a.id}</span> },
    {
      key: 'severity', header: '级别', render: (a: typeof activeAlerts[0]) => (
        <div className="flex items-center gap-1.5">
          {severityIcon(a.severity)}
          <Badge variant="risk" value={a.severity === 'critical' ? 'high' : a.severity === 'high' ? 'high' : a.severity === 'medium' ? 'medium' : 'low'} />
        </div>
      ),
    },
    { key: 'title', header: '告警标题', render: (a: typeof activeAlerts[0]) => <span className="font-medium text-sm">{a.title}</span> },
    { key: 'detail', header: '详情', render: (a: typeof activeAlerts[0]) => <span className="text-xs text-muted-foreground max-w-xs line-clamp-1">{a.detail}</span> },
    { key: 'triggeredAt', header: '触发时间', render: (a: typeof activeAlerts[0]) => formatDateTime(a.triggeredAt) },
    { key: 'status', header: '状态', render: (a: typeof activeAlerts[0]) => (
      <Badge variant="status" value={a.status} className={cn(
        a.status === 'open' && 'bg-red-50 text-red-700 border-red-200',
        a.status === 'acknowledged' && 'bg-orange-50 text-orange-700 border-orange-200',
        a.status === 'resolved' && 'bg-green-50 text-green-700 border-green-200',
      )} />
    )},
    { key: 'handler', header: '处理人', render: (a: typeof activeAlerts[0]) => a.handler || <span className="text-xs text-muted-foreground">—</span> },
  ];

  const ruleColumns = [
    { key: 'ruleId', header: '规则ID', render: (r: typeof alertRules[0]) => <span className="font-mono text-xs">{r.ruleId}</span> },
    { key: 'name', header: '规则名称', render: (r: typeof alertRules[0]) => <span className="font-medium text-sm">{r.name}</span> },
    { key: 'category', header: '类别', render: (r: typeof alertRules[0]) => (
      <Badge value={r.category === 'data' ? '数据' : r.category === 'inference' ? '推理' : r.category === 'model' ? '模型' : '业务'} className={cn(
        r.category === 'data' && 'bg-blue-50 text-blue-700',
        r.category === 'inference' && 'bg-purple-50 text-purple-700',
        r.category === 'model' && 'bg-orange-50 text-orange-700',
        r.category === 'business' && 'bg-green-50 text-green-700',
      )} />
    )},
    { key: 'condition', header: '触发条件', render: (r: typeof alertRules[0]) => <span className="text-xs font-mono">{r.condition}</span> },
    { key: 'threshold', header: '阈值' },
    { key: 'severity', header: '严重度', render: (r: typeof alertRules[0]) => <Badge variant="risk" value={r.severity} /> },
    { key: 'enabled', header: '启用', render: (r: typeof alertRules[0]) => (
      r.enabled ? <span className="inline-flex size-2 rounded-full bg-green-500" /> : <span className="inline-flex size-2 rounded-full bg-gray-300" />
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">告警监控中心</h1>
        <p className="text-sm text-muted-foreground mt-1">数据质量 + 模型性能 + 推理服务 — 异常15分钟内触发告警</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: '今日告警', value: alertStats.totalToday, icon: BellRing, color: 'text-red-600', bg: 'bg-red-50' },
          { label: '未关闭', value: alertStats.byStatus.open, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: '平均响应', value: `${alertStats.avgResponseMin}min`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '平均解决', value: `${alertStats.avgResolveMin}min`, icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: '15分钟内响应率', value: `${(alertStats.within15minRate * 100).toFixed(0)}%`, icon: Gauge, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-xl border p-4', s.bg)}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <s.icon className="size-3.5" />{s.label}
            </div>
            <div className={cn('text-xl font-bold', s.color)}>{s.value}</div>
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

      {tab === 'active' && (
        <SectionCard title={`活跃告警（${activeAlerts.length}）`}>
          <DataTable columns={alertColumns} data={activeAlerts} keyField="id" />
        </SectionCard>
      )}

      {tab === 'rules' && (
        <SectionCard title={`告警规则（${alertRules.length}条）`}>
          <DataTable columns={ruleColumns} data={alertRules} keyField="ruleId" />
        </SectionCard>
      )}

      {tab === 'data-quality' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm font-medium mb-3"><Database className="size-4 text-primary" />检查间隔</div>
              <div className="text-2xl font-bold">15<sup className="text-sm text-muted-foreground">分钟</sup></div>
              <div className="text-xs text-muted-foreground mt-1">下次检查: 2026-07-01 10:45</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm font-medium mb-3"><FileWarning className="size-4 text-orange-500" />当前告警</div>
              <div className="text-2xl font-bold text-orange-600">{dqAlerts.length}</div>
              <div className="text-xs text-muted-foreground mt-1">已触发数据质量告警</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm font-medium mb-3"><TrendingDown className="size-4 text-red-500" />最低评分</div>
              <div className="text-2xl font-bold text-red-600">93.2</div>
              <div className="text-xs text-muted-foreground mt-1">complaint_10010 完整性评分</div>
            </div>
          </div>

          <SectionCard title="数据质量告警明细">
            <DataTable
              columns={[
                { key: 'time', header: '触发时间', render: (a: typeof dqAlerts[0]) => formatDateTime(a.time) },
                { key: 'type', header: '告警类型', render: (a: typeof dqAlerts[0]) => <Badge variant="risk" value={a.type.includes('完整性') ? 'high' : 'medium'} /> },
                { key: 'dataset', header: '数据源', render: (a: typeof dqAlerts[0]) => <span className="font-mono text-sm">{a.dataset}</span> },
                { key: 'score', header: '当前评分', render: (a: typeof dqAlerts[0]) => (
                  <span className={cn('font-mono font-bold', a.score < 95 ? 'text-red-600' : 'text-green-600')}>{a.score}</span>
                )},
                { key: 'threshold', header: '阈值' },
                { key: 'triggered', header: '状态', render: (a: typeof dqAlerts[0]) => (
                  a.triggered ? <Badge variant="status" value="triggered" className="bg-red-50 text-red-700 border-red-200" /> :
                    <Badge variant="status" value="normal" className="bg-green-50 text-green-700 border-green-200" />
                )},
              ]}
              data={dqAlerts}
              keyField="dataset"
            />
          </SectionCard>
        </div>
      )}

      {tab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="按严重级别统计">
              <div className="space-y-3">
                {[
                  { label: '严重', value: alertStats.bySeverity.critical, color: 'bg-red-500', count: alertStats.bySeverity.critical },
                  { label: '高', value: alertStats.bySeverity.high, color: 'bg-orange-500', count: alertStats.bySeverity.high },
                  { label: '中', value: alertStats.bySeverity.medium, color: 'bg-yellow-500', count: alertStats.bySeverity.medium },
                  { label: '低', value: alertStats.bySeverity.low, color: 'bg-green-500', count: alertStats.bySeverity.low },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-sm w-10 text-muted-foreground">{s.label}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', s.color)} style={{ width: `${(s.count / alertStats.totalToday) * 100}%` }} />
                    </div>
                    <span className="text-sm font-mono font-bold w-8 text-right">{s.count}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="按处理状态统计">
              <div className="space-y-3">
                {[
                  { label: '未处理', value: alertStats.byStatus.open, color: 'bg-red-500' },
                  { label: '已确认', value: alertStats.byStatus.acknowledged, color: 'bg-orange-500' },
                  { label: '已解决', value: alertStats.byStatus.resolved, color: 'bg-green-500' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-sm w-16 text-muted-foreground">{s.label}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', s.color)} style={{ width: `${(s.value / alertStats.totalToday) * 100}%` }} />
                    </div>
                    <span className="text-sm font-mono font-bold w-8 text-right">{s.value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: '平均响应时间', value: `${alertStats.avgResponseMin}min`, desc: '目标 ≤15min', sub: '92%达标' },
              { label: '平均解决时间', value: `${alertStats.avgResolveMin}min`, desc: '目标 ≤60min', sub: '88%达标' },
              { label: '7天告警趋势', value: alertStats.totalToday > 0 ? '↓ 较昨日-1' : '—', desc: '较昨天', sub: '呈下降趋势' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border p-4">
                <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-2">{s.desc}</div>
                <div className="text-xs text-green-600">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
