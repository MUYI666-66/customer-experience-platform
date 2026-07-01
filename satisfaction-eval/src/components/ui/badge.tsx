import { cn } from '@/lib/utils';
import { riskLevelColor, statusLabel } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'risk' | 'status';
  value: string;
  className?: string;
}

export function Badge({ variant = 'default', value, className }: BadgeProps) {
  if (variant === 'risk') {
    return (
      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', riskLevelColor(value), className)}>
        {value === 'high' ? '高风险' : value === 'medium' ? '中风险' : '低风险'}
      </span>
    );
  }

  if (variant === 'status') {
    return (
      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', className)}>
        {statusLabel(value)}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground', className)}>
      {value}
    </span>
  );
}

interface TagProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Tag({ label, active, onClick }: TagProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors border',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-white text-muted-foreground border-border hover:border-primary/50',
      )}
    >
      {label}
    </button>
  );
}
