import type { Role } from '@/types/domain';

export const ROUTES = {
  LOGIN: '/login',
  ANALYSIS: '/analysis',
  UPLOAD: '/upload',
  PIPELINE: '/pipeline',
  OVERVIEW: '/overview',
  DISSATISFACTION: '/dissatisfaction',
  SURVEY: '/survey',
  COMPLAINT: '/complaint',
  OPERATIONS: '/operations',
  CASES: '/cases',
  REPORTS: '/reports',
  ALERTS: '/alerts',
  INGESTION: '/ingestion',
  ADMIN_SOURCES: '/admin/sources',
  ADMIN_FEATURES: '/admin/features',
  ADMIN_MODELS: '/admin/models',
  ADMIN_USERS: '/admin/users',
  SYSTEM: '/system',
} as const;

export interface NavItem {
  label: string;
  icon: string;
  path?: string;
  roles: Role[];
  children?: NavItem[];
}

export const NAVIGATION: NavItem[] = [
  {
    label: 'AI 分析中心', icon: 'Sparkles', path: ROUTES.ANALYSIS,
    roles: ['admin', 'analyst', 'operator', 'auditor'],
  },
  {
    label: '数据上传', icon: 'Upload', path: ROUTES.UPLOAD,
    roles: ['admin', 'analyst', 'operator'],
  },
  {
    label: '首页总览', icon: 'LayoutDashboard', path: ROUTES.OVERVIEW,
    roles: ['admin', 'analyst', 'operator', 'auditor'],
  },
  {
    label: '不满意用户监控', icon: 'Frown', path: ROUTES.DISSATISFACTION,
    roles: ['admin', 'analyst', 'operator'],
  },
  {
    label: '易受访用户运营', icon: 'Users', path: ROUTES.SURVEY,
    roles: ['admin', 'analyst', 'operator'],
  },
  {
    label: '投诉风险预警', icon: 'AlertTriangle', path: ROUTES.COMPLAINT,
    roles: ['admin', 'analyst', 'operator'],
  },
  {
    label: '闭环任务中心', icon: 'CheckSquare', path: ROUTES.OPERATIONS,
    roles: ['admin', 'analyst', 'operator'],
  },
  {
    label: '案例库', icon: 'BookOpen', path: ROUTES.CASES,
    roles: ['admin', 'analyst', 'operator', 'auditor'],
  },
  {
    label: '报表中心', icon: 'FileText', path: ROUTES.REPORTS,
    roles: ['admin', 'analyst', 'operator', 'auditor'],
  },
  {
    label: '告警监控', icon: 'Bell', path: ROUTES.ALERTS,
    roles: ['admin', 'analyst', 'operator'],
  },
  {
    label: '数据接入', icon: 'Database', path: ROUTES.INGESTION,
    roles: ['admin', 'analyst'],
  },
  {
    label: '系统管理', icon: 'Settings', roles: ['admin'],
    children: [
      { label: '数据源配置', icon: 'Database', path: ROUTES.ADMIN_SOURCES, roles: ['admin'] },
      { label: '特征管理', icon: 'Cpu', path: ROUTES.ADMIN_FEATURES, roles: ['admin'] },
      { label: '模型管理', icon: 'Box', path: ROUTES.ADMIN_MODELS, roles: ['admin'] },
      { label: '用户权限', icon: 'Shield', path: ROUTES.ADMIN_USERS, roles: ['admin'] },
    ],
  },
  {
    label: '系统状态', icon: 'Activity', path: ROUTES.SYSTEM,
    roles: ['admin', 'analyst', 'operator', 'auditor'],
  },
];
