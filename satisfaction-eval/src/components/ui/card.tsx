import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string;
  change: number;
  changeLabel: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
  green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
  red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
};

export function KpiCard({ title, value, change, changeLabel, icon: Icon, color }: KpiCardProps) {
  const c = colorMap[color];
  const isPositive = change > 0;

  return (
    <div className="bg-white rounded-xl border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        <div className={cn('p-2 rounded-lg', c.bg)}>
          <Icon className={cn('size-5', c.icon)} />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="flex items-center gap-1 text-xs">
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
          {isPositive ? '+' : ''}{change > 0 ? (change * 100).toFixed(1) + '%' : (change * 100).toFixed(1) + '%'}
        </span>
        <span className="text-muted-foreground">{changeLabel}</span>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export function SectionCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl border', className)}>
      <div className="px-5 py-4 border-b font-medium text-sm">{title}</div>
      <div className="p-5">{children}</div>
    </div>
  );
}
