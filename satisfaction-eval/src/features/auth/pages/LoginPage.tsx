import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LogIn, Shield } from 'lucide-react';

const DEMO_USERS = [
  { id: 'admin', name: '系统管理员', role: '管理员', desc: '全部权限：系统管理、模型发布、权限配置' },
  { id: 'analyst', name: '运营分析师', role: '分析师', desc: '分析权限：看板、下钻、报表、案例管理' },
  { id: 'operator', name: '一线运营人员', role: '运营', desc: '运营权限：预警处置、工单处理' },
  { id: 'auditor', name: '审计员', role: '审计', desc: '只读权限：审计、日志、报表查看' },
];

export function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleDemoLogin = async (userId: string) => {
    setLoading(userId);
    setError('');
    const ok = await login(userId, 'demo123');
    setLoading(null);
    if (ok) {
      navigate('/overview', { replace: true });
    } else {
      setError('登录失败，请重试');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <div className="w-full max-w-lg mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <Shield className="size-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">满意度评价运营平台</h1>
          <p className="text-blue-200/60 text-sm">
            AI驱动的客户满意度预测与闭环运营系统
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white text-center mb-1">演示环境</h2>
          <p className="text-sm text-blue-200/50 text-center mb-6">选择一个账号快速体验</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {DEMO_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => handleDemoLogin(u.id)}
                disabled={loading !== null}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 text-left"
              >
                <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <LogIn className="size-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium">{u.name}</div>
                  <div className="text-xs text-blue-200/40 mt-0.5">{u.desc}</div>
                </div>
                <span className="text-xs text-blue-200/30 bg-white/5 px-2 py-1 rounded">{u.role}</span>
                {loading === u.id && (
                  <span className="text-xs text-blue-300 animate-pulse">登录中...</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-blue-200/30 mt-6">v1.0.0 | AI预测模型系统技术方案</p>
      </div>
    </div>
  );
}
