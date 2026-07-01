import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n.toLocaleString('zh-CN');
}

export function formatPercent(n: number, decimals = 1): string {
  return (n * 100).toFixed(decimals) + '%';
}

export function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function formatDateTime(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function riskLevelColor(level: string): string {
  switch (level) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function riskLevelBg(level: string): string {
  switch (level) {
    case 'high': return '#FEE2E2';
    case 'medium': return '#FED7AA';
    case 'low': return '#DCFCE7';
    default: return '#F3F4F6';
  }
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '待处理', assigned: '已指派', in_progress: '处理中',
    resolved: '已解决', verified: '已核验', closed: '已关闭',
    active: '运行中', inactive: '已停用', error: '异常',
    draft: '草稿', candidate: '候选', prod: '生产', rollback: '已回滚',
    hit: '命中', miss: '未命中',
  };
  return map[status] || status;
}
