import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { SectionCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table';
import { cn, formatDateTime } from '@/lib/utils';
import type { DataSource, FeatureDefinition, ModelVersion } from '@/types/domain';
import { Database, Cpu, Box, Shield, CheckCircle, XCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type AdminTab = 'sources' | 'features' | 'models' | 'users';

const tabs: { key: AdminTab; label: string; icon: typeof Database }[] = [
  { key: 'sources', label: '数据源配置', icon: Database },
  { key: 'features', label: '特征管理', icon: Cpu },
  { key: 'models', label: '模型管理', icon: Box },
  { key: 'users', label: '用户权限', icon: Shield },
];

function SourcesPanel() {
  const { data } = useQuery({ queryKey: ['data-sources'], queryFn: api.getDataSources });

  const columns = [
    { key: 'name', header: '数据源名称' },
    { key: 'type', header: '类型', render: (s: DataSource) => <Badge value={s.type} /> },
    { key: 'syncMode', header: '接入方式', render: (s: DataSource) => (
      <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted">{s.syncMode.toUpperCase()}</span>
    )},
    { key: 'syncFreq', header: '同步频率' },
    { key: 'status', header: '状态', render: (s: DataSource) => (
      <div className="flex items-center gap-1.5">
        {s.status === 'active' ? <CheckCircle className="size-4 text-green-500" /> :
         s.status === 'error' ? <XCircle className="size-4 text-red-500" /> :
         <AlertCircle className="size-4 text-orange-500" />}
        <Badge variant="status" value={s.status} className={cn(
          s.status === 'active' && 'bg-green-50 text-green-700 border-green-200',
          s.status === 'error' && 'bg-red-50 text-red-700 border-red-200',
        )} />
      </div>
    )},
    { key: 'successRate', header: '成功率', render: (s: DataSource) => (
      <span className={cn('font-mono', s.successRate >= 99.5 ? 'text-green-600' : 'text-orange-600')}>{s.successRate}%</span>
    )},
    { key: 'lastSync', header: '最后同步', render: (s: DataSource) => formatDateTime(s.lastSync) },
  ];

  return <DataTable columns={columns} data={data || []} keyField="code" />;
}

function FeaturesPanel() {
  const { data } = useQuery({ queryKey: ['features'], queryFn: api.getFeatures });
  const [shapModel, setShapModel] = useState('dissatisfaction');

  const shapData: Record<string, { name: string; value: number; fill: string }[]> = {
    dissatisfaction: [
      { name: 'RSRP均值', value: 0.213, fill: '#3B82F6' },
      { name: 'SINR均值', value: 0.185, fill: '#3B82F6' },
      { name: '质差时段占比', value: 0.156, fill: '#3B82F6' },
      { name: '切换成功率', value: 0.132, fill: '#EF4444' },
      { name: '覆盖空洞密度', value: 0.105, fill: '#EF4444' },
      { name: 'PRB利用率', value: 0.088, fill: '#EF4444' },
      { name: '投诉累积密度', value: 0.072, fill: '#22C55E' },
      { name: '终端类型', value: 0.049, fill: '#22C55E' },
    ],
    survey: [
      { name: 'ARPU分档', value: 0.198, fill: '#3B82F6' },
      { name: '历史调研响应', value: 0.172, fill: '#3B82F6' },
      { name: '在网时长', value: 0.148, fill: '#3B82F6' },
      { name: '投诉历史', value: 0.127, fill: '#EF4444' },
      { name: '流量使用量', value: 0.111, fill: '#EF4444' },
      { name: '套餐档位', value: 0.092, fill: '#EF4444' },
      { name: '满意度历史', value: 0.078, fill: '#22C55E' },
      { name: '年龄组', value: 0.054, fill: '#22C55E' },
    ],
    complaint_cls: [
      { name: '投诉频率', value: 0.235, fill: '#3B82F6' },
      { name: 'RRC重建率', value: 0.189, fill: '#3B82F6' },
      { name: '质差小区标记', value: 0.154, fill: '#3B82F6' },
      { name: '掉话率', value: 0.129, fill: '#EF4444' },
      { name: '数据速率', value: 0.103, fill: '#EF4444' },
      { name: 'TA分布', value: 0.085, fill: '#EF4444' },
      { name: 'MR覆盖率', value: 0.064, fill: '#22C55E' },
      { name: '业务类型', value: 0.041, fill: '#22C55E' },
    ],
  };

  const columns = [
    { key: 'code', header: '特征编码', render: (f: FeatureDefinition) => <span className="font-mono text-xs">{f.code}</span> },
    { key: 'name', header: '特征名称' },
    { key: 'layer', header: '层级', render: (f: FeatureDefinition) => (
      <Badge value={f.layer === 'basic' ? '基础特征' : f.layer === 'derived' ? '衍生特征' : '场景特征'} className={cn(
        f.layer === 'basic' && 'bg-blue-50 text-blue-700',
        f.layer === 'derived' && 'bg-purple-50 text-purple-700',
        f.layer === 'scenario' && 'bg-orange-50 text-orange-700',
      )} />
    )},
    { key: 'updateFreq', header: '更新频率' },
    { key: 'version', header: '版本' },
    { key: 'importance', header: '重要性', render: (f: FeatureDefinition) => f.importance ? (
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${f.importance * 100}%` }} />
        </div>
        <span className="text-xs text-muted-foreground">{(f.importance * 100).toFixed(0)}%</span>
      </div>
    ) : '-' },
  ];

  return (
    <div className="space-y-6">
      <DataTable columns={columns} data={data || []} keyField="code" />

      {/* SHAP Feature Importance */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="size-5 text-primary" />
          <h3 className="text-base font-semibold">SHAP 特征重要性分析</h3>
          <select
            value={shapModel}
            onChange={(e) => setShapModel(e.target.value)}
            className="ml-auto border rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="dissatisfaction">不满意用户预测</option>
            <option value="survey">易受访用户预测</option>
            <option value="complaint_cls">投诉风险分类</option>
          </select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-4">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={shapData[shapModel]} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" fontSize={12} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis dataKey="name" type="category" fontSize={12} width={100} />
                <Tooltip formatter={(v) => `${(Number(v) * 100).toFixed(1)}%`} />
                <Bar dataKey="value" name="SHAP贡献度" radius={[0, 4, 4, 0]}>
                  {shapData[shapModel].map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-sm font-medium mb-3">SHAP值说明</div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p><span className="inline-block size-2 rounded bg-blue-500 mr-1" /> 蓝色：网络覆盖/质量类特征 — 基站侧状态指标</p>
              <p><span className="inline-block size-2 rounded bg-red-500 mr-1" /> 红色：用户体验/感知类特征 — 用户侧体验指标</p>
              <p><span className="inline-block size-2 rounded bg-green-500 mr-1" /> 绿色：用户画像/行为类特征 — 业务与画像</p>
              <p className="mt-3 pt-3 border-t">
                SHAP值越大表示该特征对模型预测结果的贡献度越高。
                当前展示 <strong>{shapModel === 'dissatisfaction' ? '不满意用户预测' : shapModel === 'survey' ? '易受访用户预测' : '投诉风险分类'}</strong> 模型的TOP8特征。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelsPanel() {
  const { data } = useQuery({ queryKey: ['model-versions'], queryFn: api.getModelVersions });

  const columns = [
    { key: 'name', header: '模型名称', render: (m: ModelVersion) => (
      <div>
        <div className="font-medium">{m.name}</div>
        <div className="text-xs text-muted-foreground">{m.type}</div>
      </div>
    )},
    { key: 'version', header: '版本', render: (m: ModelVersion) => <span className="font-mono text-sm">{m.version}</span> },
    { key: 'algorithm', header: '算法' },
    { key: 'status', header: '状态', render: (m: ModelVersion) => (
      <Badge variant="status" value={m.status} className={cn(
        m.status === 'prod' && 'bg-green-50 text-green-700 border-green-200',
        m.status === 'candidate' && 'bg-blue-50 text-blue-700 border-blue-200',
        m.status === 'rollback' && 'bg-red-50 text-red-700 border-red-200',
      )} />
    )},
    { key: 'metrics.accuracy', header: '准确率', render: (m: ModelVersion) => m.type === 'complaint_ts' ? 'N/A' : `${(m.metrics.accuracy * 100).toFixed(1)}%` },
    { key: 'deployTime', header: '部署时间' },
  ];

  return <DataTable columns={columns} data={data || []} keyField="version" />;
}

function UsersPanel() {
  const mockUsers = [
    { id: 'admin', name: '系统管理员', role: 'admin', region: '全省', lastLogin: '2026-07-01 09:30' },
    { id: 'analyst', name: '运营分析师', role: 'analyst', region: '深圳市', lastLogin: '2026-07-01 08:45' },
    { id: 'operator', name: '一线运营人员', role: 'operator', region: '广州市', lastLogin: '2026-07-01 10:00' },
    { id: 'auditor', name: '审计员', role: 'auditor', region: '全省', lastLogin: '2026-06-30 16:20' },
  ];

  const roleName = (r: string) => ({ admin: '管理员', analyst: '分析师', operator: '运营人员', auditor: '审计员' }[r] || r);

  return (
    <div>
      <DataTable
        columns={[
          { key: 'id', header: '用户名', render: (u: typeof mockUsers[0]) => <span className="font-mono text-sm">{u.id}</span> },
          { key: 'name', header: '姓名' },
          { key: 'role', header: '角色', render: (u: typeof mockUsers[0]) => <Badge value={roleName(u.role)} /> },
          { key: 'region', header: '数据范围' },
          { key: 'lastLogin', header: '最后登录' },
        ]}
        data={mockUsers}
        keyField="id"
      />
    </div>
  );
}

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('sources');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">系统管理</h1>
        <p className="text-sm text-muted-foreground mt-1">数据源、特征、模型版本与用户权限管理</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.key ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>

      <SectionCard title={tabs.find(t => t.key === tab)?.label || ''}>
        {tab === 'sources' && <SourcesPanel />}
        {tab === 'features' && <FeaturesPanel />}
        {tab === 'models' && <ModelsPanel />}
        {tab === 'users' && <UsersPanel />}
      </SectionCard>
    </div>
  );
}
