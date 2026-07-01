import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function AppLayout() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <Outlet />
        </main>
      </div>

      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2 max-w-sm">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg shadow-lg border animate-slide-in bg-white',
                toast.type === 'success' && 'border-green-200',
                toast.type === 'error' && 'border-red-200',
                toast.type === 'warning' && 'border-orange-200',
                toast.type === 'info' && 'border-blue-200',
              )}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.message && <p className="text-xs text-muted-foreground mt-0.5">{toast.message}</p>}
              </div>
              <button onClick={() => removeToast(toast.id)} className="shrink-0">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
