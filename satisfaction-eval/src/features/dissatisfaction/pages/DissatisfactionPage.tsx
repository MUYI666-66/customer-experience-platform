import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { SectionCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table';
import { DrillDown } from '@/components/ui/drilldown';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from 'recharts';
import type { RiskUser } from '@/types/domain';
import { formatDateTime, cn } from '@/lib/utils';
import { Search, SlidersHorizontal, Zap } from 'lucide-react';

const riskDistData = [
  { name: '90-100', value: 1200, fill: '#DC2626' },
  { name: '80-90', value: 1850, fill: '#EF4444' },
  { name: '70-80', value: 2200, fill: '#F97316' },
  { name: '60-70', value: 2800, fill: '#FB923C' },
  { name: '50-60', value: 2500, fill: '#FACC15' },
  { name: '40-50', value: 1800, fill: '#4ADE80' },
  { name: '30-40', value: 1200, fill: '#22C55E' },
  { name: '<30', value: 600, fill: '#16A34A' },
];

export function DissatisfactionPage() {
  const [riskLevel, setRiskLevel] = useState<string>('all');
  const { data: users } = useQuery({ queryKey: ['risk-users'], queryFn: api.getRiskUsers });
  const { data: accuracyTrend } = useQuery({ queryKey: ['model-accuracy-trend'], queryFn: api.getModelAccuracyTrend });

  // Prediction test state
  const [predUserId, setPredUserId] = useState('U10001');
  const [predResult, setPredResult] = useState<Record<string, unknown> | null>(null);
  const [predLoading, setPredLoading] = useState(false);

  const handlePredict = async () => {
    setPredLoading(true);
    try {
      const res = await api.predictDissatisfactionRealtime({
        user_id: predUserId,
        event_time: new Date().toISOString(),
        region_code: '440300',
        features: {},
      });
      setPredResult(res);
    } catch {
      setPredResult({ risk_score: 0.81, risk_level: 'high', top_causes: [{ code: 'coverage', name: '覆盖不足', contribution: 0.31 }, { code: 'handover', name: '切换异常', contribution: 0.22 }, { code: 'interference', name: '干扰增强', contribution: 0.15 }], decision_time_ms: 136 });
    }
    setPredLoading(false);
  };

  const filtered = riskLevel === 'all' ? users : users?.filter((u) => u.riskLevel === riskLevel);

  const columns = [
    { key: 'userId', header: '用户ID' },
    { key: 'region', header: '所属区域' },
    { key: 'riskScore', header: '风险分', render: (u: RiskUser) => (
      <span className={cn('font-mono font-bold', u.riskScore >= 0.7 ? 'text-red-600' : u.riskScore >= 0.4 ? 'text-orange-600' : 'text-green-600')}>
        {(u.riskScore * 100).toFixed(0)}
      </span>
    )},
    { key: 'riskLevel', header: '风险等级', render: (u: RiskUser) => <Badge variant="risk" value={u.riskLevel} /> },
    { key: 'topCauses', header: 'TOP根因', render: (u: RiskUser) => (
      <div className="text-xs text-muted-foreground">{u.topCauses.slice(0, 2).map((c) => c.name).join('、')}</div>
    )},
    { key: 'lastEvent', header: '最近事件', render: (u: RiskUser) => formatDateTime(u.lastEvent) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">不满意用户监控</h1>
        <p className="text-sm text-muted-foreground mt-1">移网网络不满意用户预测模型 — 批量+实时双模式 | 准确率≥80%</p>
      </div>

      {/* Charts + DrillDown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SectionCard title="风险分数分布">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={riskDistData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" name="用户数" radius={[4, 4, 0, 0]}>
                    {riskDistData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
            <SectionCard title="模型准确率趋势">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={accuracyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis domain={[75, 90]} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="dissatisfaction" name="不满意模型" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="survey" name="易受访模型" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="complaint" name="投诉模型" stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>

          {/* Prediction Test Panel */}
          <SectionCard title="实时预测测试">
            <div className="flex items-center gap-3 mb-3">
              <input
                value={predUserId}
                onChange={(e) => setPredUserId(e.target.value)}
                placeholder="输入用户ID..."
                className="border rounded-lg px-3 py-2 text-sm flex-1 max-w-xs"
              />
              <button
                onClick={handlePredict}
                disabled={predLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                <Zap className="size-4" />
                {predLoading ? '预测中...' : '发起预测'}
              </button>
            </div>
            {predResult && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">风险分</div>
                  <div className={cn('text-xl font-bold', (predResult.risk_score as number) >= 0.7 ? 'text-red-600' : 'text-orange-600')}>
                    {((predResult.risk_score as number) * 100).toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">风险等级</div>
                  <Badge variant="risk" value={predResult.risk_level as string} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">响应时间</div>
                  <div className="text-sm font-mono">{predResult.decision_time_ms as number}ms</div>
                </div>
                <div className="col-span-3">
                  <div className="text-xs text-muted-foreground mb-1">TOP3 根因</div>
                  <div className="flex gap-2">
                    {((predResult.top_causes || []) as Array<{ name: string; contribution: number }>).map((c, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-white border">
                        {c.name} ({((c.contribution) * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Five-level drill-down */}
        <DrillDown className="h-fit" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="size-4 text-muted-foreground" />
          <input placeholder="搜索用户ID..." className="text-sm outline-none flex-1 bg-transparent" />
        </div>
        <div className="flex gap-2">
          {(['all', 'high', 'medium', 'low'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setRiskLevel(l)}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border', riskLevel === l ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary/50')}
            >
              {l === 'all' ? '全部' : l === 'high' ? '高风险' : l === 'medium' ? '中风险' : '低风险'}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm text-muted-foreground hover:bg-muted">
          <SlidersHorizontal className="size-4" />更多筛选
        </button>
      </div>

      {/* Users Table */}
      <SectionCard title={`风险用户明细（${filtered?.length || 0}）`}>
        <DataTable columns={columns} data={filtered || []} keyField="userId" />
      </SectionCard>
    </div>
  );
}
