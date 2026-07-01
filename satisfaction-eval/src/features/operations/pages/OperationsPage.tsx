import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { SectionCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table';
import { cn, formatDateTime } from '@/lib/utils';
import type { WorkOrder } from '@/types/domain';
import { Search, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const statusTabs = [
  { key: 'all', label: '全部', count: 6 },
  { key: 'pending', label: '待处理', count: 2 },
  { key: 'in_progress', label: '处理中', count: 2 },
  { key: 'resolved', label: '已解决', count: 1 },
  { key: 'closed', label: '已关闭', count: 0 },
];

export function OperationsPage() {
  const [status, setStatus] = useState<string>('all');
  const { data: orders } = useQuery({ queryKey: ['work-orders'], queryFn: api.getWorkOrders });

  const filtered = status === 'all' ? orders : orders?.filter((o) => o.status === status);

  const priorityBadge = (p: string) => (
    <Badge variant="risk" value={p} />
  );

  const statusIcon = (s: string) => {
    switch (s) {
      case 'pending': return <Clock className="size-4 text-orange-500" />;
      case 'in_progress': return <AlertCircle className="size-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="size-4 text-green-500" />;
      case 'assigned': return <Clock className="size-4 text-purple-500" />;
      default: return null;
    }
  };

  const columns = [
    { key: 'id', header: '工单号', render: (o: WorkOrder) => <span className="font-mono text-xs">{o.id}</span> },
    { key: 'title', header: '标题', className: 'max-w-[200px]' },
    { key: 'type', header: '类型', render: (o: WorkOrder) => <Badge value={o.type} /> },
    { key: 'priority', header: '优先级', render: (o: WorkOrder) => priorityBadge(o.priority) },
    { key: 'status', header: '状态', render: (o: WorkOrder) => (
      <div className="flex items-center gap-1.5">
        {statusIcon(o.status)}
        <Badge variant="status" value={o.status} className={cn(
          o.status === 'in_progress' && 'bg-blue-50 text-blue-700 border-blue-200',
          o.status === 'resolved' && 'bg-green-50 text-green-700 border-green-200',
          o.status === 'pending' && 'bg-orange-50 text-orange-700 border-orange-200',
        )} />
      </div>
    )},
    { key: 'assignee', header: '负责人', render: (o: WorkOrder) => o.assignee || <span className="text-muted-foreground text-xs">待指派</span> },
    { key: 'region', header: '区域' },
    { key: 'deadline', header: '截止时间', render: (o: WorkOrder) => (
      <span className={cn(new Date(o.deadline) < new Date() ? 'text-red-600 font-medium' : '')}>
        {o.deadline}
      </span>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">闭环任务中心</h1>
          <p className="text-sm text-muted-foreground mt-1">预警识别 → 策略制定 → 策略执行 → 效果评估</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
          <Plus className="size-4" />新建工单
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: '总工单', value: orders?.length || 0, color: 'text-blue-600' },
          { label: '处理中', value: orders?.filter(o => o.status === 'in_progress').length || 0, color: 'text-orange-600' },
          { label: '待指派', value: orders?.filter(o => o.status === 'pending').length || 0, color: 'text-red-600' },
          { label: '已完成', value: orders?.filter(o => o.status === 'resolved' || o.status === 'closed').length || 0, color: 'text-green-600' },
          { label: '完成率', value: orders ? Math.round(orders.filter(o => o.status === 'resolved' || o.status === 'closed').length / orders.length * 100) + '%' : '0%', color: 'text-purple-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className={cn('text-2xl font-bold', s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="size-4 text-muted-foreground" />
          <input placeholder="搜索工单..." className="text-sm outline-none flex-1 bg-transparent" />
        </div>
        <div className="flex gap-2">
          {statusTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border', status === t.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary/50')}
            >
              {t.label} {t.count > 0 && `(${t.count})`}
            </button>
          ))}
        </div>
      </div>

      <SectionCard title="工单列表">
        <DataTable columns={columns} data={filtered || []} keyField="id" />
      </SectionCard>
    </div>
  );
}
