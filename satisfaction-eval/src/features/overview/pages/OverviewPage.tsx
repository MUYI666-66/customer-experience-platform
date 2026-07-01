import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { KpiCard, SectionCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Frown, Target, AlertTriangle, TrendingUp, CheckCircle, Smile,
} from 'lucide-react';
import type { ModelMetrics } from '@/types/domain';
import { formatPercent } from '@/lib/utils';

const kpiIcons = {
  Frown, Target, AlertTriangle, TrendingUp, CheckCircle, Smile,
} as const;

const PIE_COLORS = ['#EF4444', '#F97316', '#EAB308', '#3B82F6', '#8B5CF6', '#6B7280'];

export function OverviewPage() {
  const { data: cards } = useQuery({ queryKey: ['kpi-cards'], queryFn: api.getKpiCards });
  const { data: riskTrend } = useQuery({ queryKey: ['risk-trend'], queryFn: api.getRiskTrend });
  const { data: complaintTrend } = useQuery({ queryKey: ['complaint-trend'], queryFn: api.getComplaintTrend });
  const { data: regionRisk } = useQuery({ queryKey: ['region-risk'], queryFn: api.getRegionRisk });
  const { data: rootCause } = useQuery({ queryKey: ['root-cause'], queryFn: api.getRootCause });
  const { data: metrics } = useQuery({ queryKey: ['model-metrics'], queryFn: api.getModelMetrics });

  const metricColumns = [
    { key: 'modelName', header: '模型名称' },
    { key: 'accuracy', header: '准确率', render: (m: ModelMetrics) => m.modelName === '投诉时序预测' ? 'N/A' : formatPercent(m.accuracy) },
    { key: 'recall', header: '召回率', render: (m: ModelMetrics) => m.modelName === '投诉时序预测' ? 'N/A' : formatPercent(m.recall) },
    { key: 'auc', header: 'AUC', render: (m: ModelMetrics) => m.modelName === '投诉时序预测' ? 'N/A' : m.auc.toFixed(3) },
    { key: 'psi', header: 'PSI', render: (m: ModelMetrics) => m.modelName === '投诉时序预测' ? 'N/A' : m.psi.toFixed(3) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">首页总览</h1>
        <p className="text-sm text-muted-foreground mt-1">全流程满意度运营指标一目了然</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards?.map((c) => {
          const Icon = kpiIcons[c.icon as keyof typeof kpiIcons] || TrendingUp;
          return <KpiCard key={c.title} {...c} icon={Icon} />;
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="风险用户趋势">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={riskTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="high" name="高风险" stackId="1" stroke="#EF4444" fill="#FEE2E2" />
              <Area type="monotone" dataKey="medium" name="中风险" stackId="1" stroke="#F97316" fill="#FED7AA" />
              <Area type="monotone" dataKey="low" name="低风险" stackId="1" stroke="#22C55E" fill="#DCFCE7" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="投诉量趋势（预测 vs 实际）">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={complaintTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="actual" name="实际投诉量" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="predicted" name="预测投诉量" stroke="#F97316" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Second Chart Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="各地区风险用户分布">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionRisk} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="name" type="category" fontSize={12} width={70} />
              <Tooltip />
              <Bar dataKey="high" name="高风险" stackId="1" fill="#EF4444" />
              <Bar dataKey="medium" name="中风险" stackId="1" fill="#F97316" />
              <Bar dataKey="low" name="低风险" stackId="1" fill="#22C55E" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="不满意根因分布">
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="60%" height={280}>
              <PieChart>
                <Pie data={rootCause} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                  {rootCause?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              {rootCause?.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="size-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Model Metrics Table */}
      <SectionCard title="模型运行指标">
        <DataTable
          columns={metricColumns}
          data={metrics || []}
          keyField="modelName"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {metrics?.map((m) => (
            <Badge key={m.modelName} value={m.updateTime} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
