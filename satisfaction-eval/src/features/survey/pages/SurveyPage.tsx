import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { SectionCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table';
import { DrillDown } from '@/components/ui/drilldown';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import type { SurveyUser } from '@/types/domain';
import { cn } from '@/lib/utils';
import { Search, Download } from 'lucide-react';

const levelDistData = [
  { name: '极高意愿', value: 3200, fill: '#16A34A' },
  { name: '高意愿', value: 8500, fill: '#22C55E' },
  { name: '中意愿', value: 15200, fill: '#FACC15' },
  { name: '低意愿', value: 23100, fill: '#F97316' },
];

export function SurveyPage() {
  const [level, setLevel] = useState<string>('all');
  const { data: users } = useQuery({ queryKey: ['survey-users'], queryFn: api.getSurveyUsers });
  const { data: hitRateTrend } = useQuery({ queryKey: ['hit-rate-trend'], queryFn: api.getHitRateTrend });

  const filtered = level === 'all' ? users : users?.filter((u) => u.level.includes(level));

  const columns = [
    { key: 'userId', header: '用户ID' },
    { key: 'region', header: '区域' },
    { key: 'score', header: '意愿分', render: (u: SurveyUser) => (
      <span className={cn('font-mono font-bold', u.score >= 80 ? 'text-green-600' : u.score >= 60 ? 'text-orange-600' : 'text-gray-500')}>
        {u.score}
      </span>
    )},
    { key: 'level', header: '意愿等级', render: (u: SurveyUser) => <Badge value={u.level} /> },
    { key: 'hitStatus', header: '命中状态', render: (u: SurveyUser) => (
      <Badge variant="status" value={u.hitStatus} className={cn(
        u.hitStatus === 'hit' && 'bg-green-50 text-green-700 border-green-200',
        u.hitStatus === 'miss' && 'bg-red-50 text-red-700 border-red-200',
        u.hitStatus === 'pending' && 'bg-orange-50 text-orange-700 border-orange-200',
      )} />
    )},
    { key: 'lastSurveyDate', header: '最近调研' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">易受访用户运营</h1>
          <p className="text-sm text-muted-foreground mt-1">移网易受访用户预测模型 - 五级钻取与抽样推送</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors">
          <Download className="size-4" />导出名单
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: '月度输出用户', value: '8.5万', sub: '/100万限额' },
          { label: '当前命中率', value: '13.2%', sub: '目标 ≥10%' },
          { label: '极高意愿', value: '3,200', sub: '分数 ≥90' },
          { label: '高意愿', value: '8,500', sub: '分数 80-89' },
          { label: '待调研批次', value: '2,800', sub: '本周推送' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts + DrillDown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SectionCard title="月度命中率趋势">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={hitRateTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis domain={[8, 15]} fontSize={12} />
                  <Tooltip />
                  <ReferenceLine y={10} stroke="#EF4444" strokeDasharray="5 5" label={{ value: '目标线 10%', position: 'right', fontSize: 11 }} />
                  <Area type="monotone" dataKey="hitRate" name="命中率" stroke="#3B82F6" fill="#BFDBFE" strokeWidth={2} />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="意愿等级分布">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={levelDistData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>
        </div>

        <DrillDown className="h-fit" />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="size-4 text-muted-foreground" />
          <input placeholder="搜索用户ID..." className="text-sm outline-none flex-1 bg-transparent" />
        </div>
        <div className="flex gap-2">
          {['all', '极高意愿', '高意愿', '中意愿', '低意愿'].map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border', level === l ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary/50')}
            >
              {l === 'all' ? '全部' : l}
            </button>
          ))}
        </div>
      </div>

      <SectionCard title={`易受访用户名单（${filtered?.length || 0}）`}>
        <DataTable columns={columns} data={filtered || []} keyField="userId" />
      </SectionCard>
    </div>
  );
}
