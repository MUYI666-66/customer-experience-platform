import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { SectionCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table';
import { DrillDown } from '@/components/ui/drilldown';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Bar,
} from 'recharts';
import type { ComplaintAlert } from '@/types/domain';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { AlertTriangle, TrendingUp, TrendingDown, MapPin } from 'lucide-react';

const comingDaysData = [
  { day: '07/02', 深圳: 42, 广州: 30, 佛山: 25, 珠海: 10 },
  { day: '07/03', 深圳: 45, 广州: 32, 佛山: 28, 珠海: 12 },
  { day: '07/04', 深圳: 48, 广州: 35, 佛山: 30, 珠海: 11 },
  { day: '07/05', 深圳: 44, 广州: 33, 佛山: 26, 珠海: 9 },
  { day: '07/06', 深圳: 40, 广州: 28, 佛山: 22, 珠海: 8 },
  { day: '07/07', 深圳: 38, 广州: 26, 佛山: 20, 珠海: 7 },
  { day: '07/08', 深圳: 35, 广州: 25, 佛山: 18, 珠海: 6 },
];

const rootCauseBreakdown = [
  { name: '网络故障', value: 35 },
  { name: '用户行为', value: 25 },
  { name: '业务问题', value: 20 },
  { name: '终端问题', value: 12 },
  { name: '其他', value: 8 },
];

export function ComplaintPage() {
  const { data: alerts } = useQuery({ queryKey: ['complaint-alerts'], queryFn: api.getComplaintAlerts });

  const alertColumns = [
    { key: 'region', header: '区域', render: (a: ComplaintAlert) => (
      <div className="flex items-center gap-2"><MapPin className="size-3.5 text-muted-foreground" />{a.region}</div>
    )},
    { key: 'alertType', header: '预警类型' },
    { key: 'riskLevel', header: '风险等级', render: (a: ComplaintAlert) => <Badge variant="risk" value={a.riskLevel} /> },
    { key: 'predictedCount', header: '预测投诉量', render: (a: ComplaintAlert) => (
      <span className="font-mono font-bold">{a.predictedCount}</span>
    )},
    { key: 'trend', header: '趋势', render: (a: ComplaintAlert) => (
      a.trend === 'up' ? <TrendingUp className="size-4 text-red-500" /> :
      a.trend === 'down' ? <TrendingDown className="size-4 text-green-500" /> :
      <span className="text-xs text-muted-foreground">平稳</span>
    )},
    { key: 'alertTime', header: '预警时间', render: (a: ComplaintAlert) => formatDateTime(a.alertTime) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">投诉风险预警</h1>
        <p className="text-sm text-muted-foreground mt-1">分类预测 + 根因诊断 + 时序预警，72小时提前预警</p>
      </div>

      {/* Alert summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '活跃预警', value: alerts?.length || 0, color: 'text-red-600', bg: 'bg-red-50' },
          { label: '高风险区域', value: alerts?.filter(a => a.riskLevel === 'high').length || 0, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: '上升趋势', value: alerts?.filter(a => a.trend === 'up').length || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: '72h预警窗口', value: '7天', color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-xl border p-4', s.bg)}>
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className={cn('text-2xl font-bold', s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts + DrillDown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="未来7天区县投诉量预测">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comingDaysData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="深圳" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="广州" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="佛山" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="珠海" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="根因分类诊断">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={rootCauseBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={12} width={80} />
                <Tooltip />
                <Bar dataKey="value" name="占比%" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        <DrillDown className="h-fit" />
      </div>

      {/* Alerts Table */}
      <SectionCard title="预警列表">
        <DataTable columns={alertColumns} data={alerts || []} keyField="id" />
      </SectionCard>
    </div>
  );
}
