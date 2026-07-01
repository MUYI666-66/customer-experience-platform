import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User } from 'lucide-react';

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">
          欢迎回来，{user?.name}
          <span className="ml-2 text-xs text-muted-foreground/60">({user?.region})</span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full" />
        </button>
        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <User className="size-5" />
        </button>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          title="退出登录"
        >
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  );
}
