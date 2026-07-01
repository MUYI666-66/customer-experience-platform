import { create } from 'zustand';

interface UserInfo {
  id: string;
  name: string;
  role: string;
  region: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('auth-token'),
  user: JSON.parse(localStorage.getItem('auth-user') || 'null'),
  token: localStorage.getItem('auth-token'),
  login: async (username: string, password: string) => {
    // Try real backend first
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.access_token;
        const meRes = await fetch('http://localhost:8000/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await meRes.json();
        localStorage.setItem('auth-token', token);
        localStorage.setItem('auth-user', JSON.stringify(user));
        set({ isAuthenticated: true, user, token });
        return true;
      }
    } catch {
      // Backend not available, fall back to mock
    }

    // Mock fallback
    const mockUsers: Record<string, UserInfo> = {
      admin: { id: 'admin', name: '系统管理员', role: 'admin', region: '全省' },
      analyst: { id: 'analyst', name: '运营分析师', role: 'analyst', region: '深圳市' },
      operator: { id: 'operator', name: '一线运营人员', role: 'operator', region: '广州市' },
      auditor: { id: 'auditor', name: '审计员', role: 'auditor', region: '全省' },
    };
    const u = mockUsers[username];
    if (u) {
      const token = 'mock-jwt-token';
      localStorage.setItem('auth-token', token);
      localStorage.setItem('auth-user', JSON.stringify(u));
      set({ isAuthenticated: true, user: u, token });
      return true;
    }
    return false;
  },
  logout: () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    set({ isAuthenticated: false, user: null, token: null });
  },
}));
