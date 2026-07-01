import { SectionCard } from '@/components/ui/card';
import {
  FileText, Download, Calendar, TrendingUp,
  FileSpreadsheet, FileBarChart, Clock, CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const reportTypes = [
  { icon: FileText, title: '日报', desc: '每日感知运营简报', freq: '每日 9:00 更新', color: 'bg-blue-50 text-blue-600' },
  { icon: FileBarChart, title: '月报', desc: '月度模型优化报告', freq: '每月 1 日发布', color: 'bg-green-50 text-green-600' },
  { icon: TrendingUp, title: '季报', desc: '季度服务分析报告', freq: '每季首月 5 日发布', color: 'bg-purple-50 text-purple-600' },
  { icon: FileSpreadsheet, title: '年报', desc: '年度项目总结报告', freq: '次年 1 月 15 日发布', color: 'bg-orange-50 text-orange-600' },
  { icon: FileText, title: '专题报告', desc: '重大活动/节假日/行业影响', freq: '按需生成', color: 'bg-red-50 text-red-600' },
];

const recentReports = [
  { name: '满意度运营日报_20260701.pdf', type: '日报', size: '2.3 MB', time: '2026-07-01 09:00', status: 'ready' },
  { name: '不满意模型月度报告_202606.pdf', type: '月报', size: '8.1 MB', time: '2026-07-01 08:00', status: 'ready' },
  { name: '投诉风险预警周报_2026W27.pdf', type: '专题', size: '5.6 MB', time: '2026-06-30 17:00', status: 'ready' },
  { name: 'Q2满意度运营季报_2026.pdf', type: '季报', size: '15.2 MB', time: '2026-07-05 10:00', status: 'generating' },
  { name: '深圳大运会保障专题报告.pdf', type: '专题', size: '12.8 MB', time: '2026-06-28 14:00', status: 'ready' },
];

export function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">报表中心</h1>
        <p className="text-sm text-muted-foreground mt-1">日报/月报/季报/年报/专题报告，支持 Excel/PDF 导出</p>
      </div>

      {/* Report type cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {reportTypes.map((r) => (
          <button key={r.title} className="bg-white rounded-xl border p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group">
            <div className={cn('p-2 rounded-lg inline-flex mb-3', r.color)}>
              <r.icon className="size-5" />
            </div>
            <div className="font-semibold text-sm">{r.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{r.desc}</div>
            <div className="text-xs text-muted-foreground/60 mt-2 flex items-center gap-1">
              <Calendar className="size-3" />{r.freq}
            </div>
          </button>
        ))}
      </div>

      {/* Recent reports */}
      <SectionCard title="最近报表">
        <div className="space-y-3">
          {recentReports.map((r) => (
            <div key={r.name} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
              <div className={cn('p-2 rounded-lg', r.type === '日报' ? 'bg-blue-50' : r.type === '月报' ? 'bg-green-50' : r.type === '季报' ? 'bg-purple-50' : 'bg-orange-50')}>
                <FileText className={cn('size-5', r.type === '日报' ? 'text-blue-500' : r.type === '月报' ? 'text-green-500' : r.type === '季报' ? 'text-purple-500' : 'text-orange-500')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                  <span>{r.type}</span>
                  <span>{r.size}</span>
                  <span>{r.time}</span>
                </div>
              </div>
              {r.status === 'ready' ? (
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90">
                  <Download className="size-4" />下载
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-orange-50 text-orange-600">
                  <Clock className="size-4 animate-spin" />生成中
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
