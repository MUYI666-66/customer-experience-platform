import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LogIn, Shield, User, Lock, Eye, EyeOff } from 'lucide-react';

const DEMO_USERS = [
  { id: 'admin', name: '系统管理员', role: '管理员', desc: '全部权限：系统管理、模型发布、权限配置' },
  { id: 'analyst', name: '运营分析师', role: '分析师', desc: '分析权限：看板、下钻、报表、案例管理' },
  { id: 'operator', name: '一线运营人员', role: '运营', desc: '运营权限：预警处置、工单处理' },
  { id: 'auditor', name: '审计员', role: '审计', desc: '只读权限：审计、日志、报表查看' },
];

export function LoginPage() {
  const [tab, setTab] = useState<'form' | 'demo'>('form');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError('请输入用户名'); return; }
    if (!password.trim()) { setError('请输入密码'); return; }
    setLoading(true);
    setError('');
    const ok = await login(username.trim(), password);
    setLoading(false);
    if (ok) {
      navigate('/analysis', { replace: true });
    } else {
      setError('用户名或密码错误');
    }
  };

  const handleDemoLogin = async (userId: string) => {
    setLoading(true);
    setError('');
    const ok = await login(userId, 'demo123');
    setLoading(false);
    if (ok) {
      navigate('/analysis', { replace: true });
    } else {
      setError('登录失败，请重试');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <Shield className="size-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">满意度评价运营平台</h1>
          <p className="text-blue-200/60 text-sm">
            AI驱动的客户满意度预测与闭环运营系统
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => { setTab('form'); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                tab === 'form'
                  ? 'text-white border-b-2 border-blue-400 bg-white/5'
                  : 'text-blue-200/50 hover:text-blue-200/80'
              }`}
            >
              账号登录
            </button>
            <button
              onClick={() => { setTab('demo'); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                tab === 'demo'
                  ? 'text-white border-b-2 border-blue-400 bg-white/5'
                  : 'text-blue-200/50 hover:text-blue-200/80'
              }`}
            >
              演示账号
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            {tab === 'form' ? (
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-blue-200/70 mb-1.5">用户名</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-blue-200/30" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="请输入用户名"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-lg text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 transition-colors text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-blue-200/70 mb-1.5">密码</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-blue-200/30" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/10 rounded-lg text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/30 hover:text-blue-200/60"
                    >
                      {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-pulse">登录中...</span>
                  ) : (
                    <>
                      <LogIn className="size-4" />
                      登 录
                    </>
                  )}
                </button>
                <p className="text-xs text-blue-200/30 text-center">
                  演示环境任意密码均可登录，或切换到「演示账号」快速体验
                </p>
              </form>
            ) : (
              <div className="space-y-2.5">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleDemoLogin(u.id)}
                    disabled={loading}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 text-left"
                  >
                    <div className="size-9 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <LogIn className="size-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-blue-200/40 mt-0.5">{u.desc}</div>
                    </div>
                    <span className="text-xs text-blue-200/30 bg-white/5 px-2 py-1 rounded">{u.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-blue-200/30 mt-6">v1.0.0 | AI预测模型系统技术方案</p>
      </div>
    </div>
  );
}
