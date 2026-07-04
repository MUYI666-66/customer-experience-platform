import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileDown, FileCheck, AlertCircle, CheckCircle2, Loader2,
  Database, Radio, BarChart3, MessageSquare, ClipboardList, Play,
} from 'lucide-react';

interface TemplateDef {
  key: string;
  name: string;
  file: string;
  icon: React.ElementType;
  requiredCols: string[];
  optionalCols: string[];
  description: string;
}

const TEMPLATES: TemplateDef[] = [
  {
    key: 'users', name: '用户数据', file: 'users.csv',
    icon: Database,
    requiredCols: ['user_id', 'cell_id', 'city_code', 'city_name', 'arpu', 'tenure_months', 'is_vip', 'age_group', 'gender'],
    optionalCols: ['terminal_model', 'package_name', 'service_type', 'terminal_type', 'district_code', 'grid_code', 'region_code'],
    description: '每个用户一行，包含基本画像和归属基站信息',
  },
  {
    key: 'stations', name: '基站数据', file: 'stations.csv',
    icon: Radio,
    requiredCols: ['cell_id', 'station_name', 'city_code', 'city_name', 'network_type', 'scene_type'],
    optionalCols: ['grid_code', 'district_code', 'longitude', 'latitude'],
    description: '每个基站一行，包含位置和网络类型',
  },
  {
    key: 'station_kpis', name: '基站KPI数据', file: 'station_kpis.csv',
    icon: BarChart3,
    requiredCols: ['cell_id', 'date', 'rsrp_dbm', 'sinr_db', 'prb_utilization_pct', 'ho_success_rate_pct', 'drop_rate_pct'],
    optionalCols: ['avg_throughput_mbps', 'connected_users'],
    description: '每个基站每天一行，建议30天历史KPI数据',
  },
  {
    key: 'complaints', name: '投诉数据', file: 'complaints.csv',
    icon: MessageSquare,
    requiredCols: ['complaint_id', 'user_id', 'cell_id', 'complaint_type', 'complaint_time'],
    optionalCols: ['region_code', 'city_name', 'root_cause', 'resolved', 'description'],
    description: '每条投诉记录一行，包含投诉类型和时间',
  },
  {
    key: 'surveys', name: '调研数据', file: 'surveys.csv',
    icon: ClipboardList,
    requiredCols: ['survey_id', 'user_id', 'survey_date', 'satisfaction_score'],
    optionalCols: ['region_code', 'city_name', 'nps_score', 'feedback_text', 'hit'],
    description: '每条调研记录一行，含满意度评分',
  },
];

type FileStatus = 'waiting' | 'validating' | 'valid' | 'error';

interface FileState {
  file: File | null;
  status: FileStatus;
  message: string;
  rowCount: number;
}

function generateTemplateCSV(template: TemplateDef): string {
  const allCols = [...template.requiredCols, ...template.optionalCols];
  const header = allCols.join(',');
  const sampleRow = allCols.map((col) => {
    if (col === 'user_id' || col === 'complaint_id' || col === 'survey_id') return 'S00001';
    if (col === 'cell_id') return 'CELL001';
    if (col === 'city_code') return '440100';
    if (col === 'city_name') return '广州市';
    if (col.includes('date') || col.includes('time')) return '2026-07-01';
    if (col.includes('score') || col.includes('rate') || col.includes('pct')) return '85.5';
    if (col === 'is_vip') return '0';
    if (col === 'gender') return '男';
    if (col === 'age_group') return '25-35';
    if (col === 'arpu') return '128';
    if (col === 'tenure_months') return '36';
    if (col === 'network_type') return '5G';
    if (col === 'scene_type') return 'urban';
    if (col === 'station_name') return '基站A';
    if (col === 'complaint_type') return '网络覆盖';
    if (col === 'satisfaction_score') return '4';
    return '';
  }).join(',');
  return `${header}\n${sampleRow}\n`;
}

export function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<Record<string, FileState>>(
    Object.fromEntries(TEMPLATES.map((t) => [t.key, { file: null, status: 'waiting' as FileStatus, message: '', rowCount: 0 }]))
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const allValid = Object.values(files).every((f) => f.status === 'valid');

  const validateCSV = useCallback((file: File, template: TemplateDef): Promise<FileState> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
          resolve({ file, status: 'error', message: '文件为空或只有表头', rowCount: 0 });
          return;
        }
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^﻿/, ''));
        const missing = template.requiredCols.filter((c) => !headers.includes(c));
        if (missing.length > 0) {
          resolve({ file, status: 'error', message: `缺少必需列: ${missing.join(', ')}`, rowCount: 0 });
          return;
        }
        const dataRows = lines.slice(1).filter((l) => l.trim());
        if (dataRows.length < 10) {
          resolve({ file, status: 'error', message: `数据行数不足（至少10行，当前${dataRows.length}行）`, rowCount: 0 });
          return;
        }
        resolve({ file, status: 'valid', message: `验证通过`, rowCount: dataRows.length });
      };
      reader.onerror = () => {
        resolve({ file, status: 'error', message: '文件读取失败', rowCount: 0 });
      };
      reader.readAsText(file);
    });
  }, []);

  const handleFileSelect = async (template: TemplateDef, file: File) => {
    const key = template.key;
    setFiles((prev) => ({ ...prev, [key]: { file, status: 'validating', message: '验证中...', rowCount: 0 } }));
    const result = await validateCSV(file, template);
    setFiles((prev) => ({ ...prev, [key]: result }));
  };

  const handleDownloadTemplate = (template: TemplateDef) => {
    const csv = generateTemplateCSV(template);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = template.file;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartAnalysis = () => {
    navigate('/pipeline');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">数据上传</h1>
          <p className="text-sm text-muted-foreground mt-1">
            请上传以下5个CSV文件，或下载模板填写后上传。支持拖拽文件到对应卡片。
          </p>
        </div>
        <button
          onClick={handleStartAnalysis}
          disabled={!allValid}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Play className="size-4" />
          开始分析
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(Object.values(files).filter((f) => f.status === 'valid').length / TEMPLATES.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {Object.values(files).filter((f) => f.status === 'valid').length}/{TEMPLATES.length} 已验证
        </span>
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TEMPLATES.map((tpl) => {
          const state = files[tpl.key];
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.key}
              className={`bg-white rounded-xl border-2 transition-all ${
                state.status === 'valid'
                  ? 'border-green-300 bg-green-50/30'
                  : state.status === 'error'
                  ? 'border-red-300 bg-red-50/30'
                  : 'border-border hover:border-primary/30'
              }`}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary'); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-primary');
                const file = e.dataTransfer.files[0];
                if (file && file.name.endsWith('.csv')) {
                  handleFileSelect(tpl, file);
                }
              }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      state.status === 'valid' ? 'bg-green-100' :
                      state.status === 'error' ? 'bg-red-100' : 'bg-blue-50'
                    }`}>
                      <Icon className={`size-5 ${
                        state.status === 'valid' ? 'text-green-600' :
                        state.status === 'error' ? 'text-red-600' : 'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{tpl.name}</h3>
                      <p className="text-xs text-muted-foreground">{tpl.file}</p>
                    </div>
                  </div>
                  {state.status === 'valid' && <CheckCircle2 className="size-5 text-green-500 shrink-0" />}
                  {state.status === 'error' && <AlertCircle className="size-5 text-red-500 shrink-0" />}
                  {state.status === 'validating' && <Loader2 className="size-5 text-blue-500 animate-spin shrink-0" />}
                </div>

                <p className="text-xs text-muted-foreground mb-3">{tpl.description}</p>

                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    必需列 ({tpl.requiredCols.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tpl.requiredCols.map((col) => (
                      <span key={col} className="inline-flex px-1.5 py-0.5 bg-muted/50 rounded text-xs text-muted-foreground font-mono">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                {state.status === 'valid' && (
                  <p className="text-xs text-green-600 mb-3">
                    {state.message} — {state.rowCount.toLocaleString()} 行数据
                  </p>
                )}
                {state.status === 'error' && (
                  <p className="text-xs text-red-600 mb-3">{state.message}</p>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRefs.current[tpl.key]?.click()}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Upload className="size-3.5" />
                    上传文件
                  </button>
                  <button
                    onClick={() => handleDownloadTemplate(tpl)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-muted text-muted-foreground rounded-lg text-xs font-medium hover:bg-muted/80 transition-colors"
                  >
                    <FileDown className="size-3.5" />
                    模板
                  </button>
                </div>
                <input
                  ref={(el) => { fileInputRefs.current[tpl.key] = el; }}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(tpl, file);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <button
          onClick={() => {
            TEMPLATES.forEach((tpl) => handleDownloadTemplate(tpl));
          }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          下载全部模板
        </button>
        <span className="text-muted-foreground/40">|</span>
        <button
          onClick={handleStartAnalysis}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          使用模拟数据跳过上传
        </button>
      </div>
    </div>
  );
}
