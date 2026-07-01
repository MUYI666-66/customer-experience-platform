import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { NAVIGATION, type NavItem } from '@/lib/constants';
import { usePermission } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Frown, Users, AlertTriangle, CheckSquare,
  BookOpen, FileText, Settings, Database, Cpu, Box, Shield, Bell,
  ChevronDown, ChevronLeft,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Frown, Users, AlertTriangle, CheckSquare,
  BookOpen, FileText, Settings, Database, Cpu, Box, Shield, Bell,
};

function NavItemRenderer({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { hasAnyRole } = usePermission();
  const location = useLocation();
  const [open, setOpen] = useState(() =>
    item.children?.some((c) => location.pathname.startsWith(c.path || ''))
  );

  if (!hasAnyRole(item.roles)) return null;

  const Icon = iconMap[item.icon] || FileText;
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path ? location.pathname.startsWith(item.path) : false;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-160',
            'text-sidebar-muted hover:text-sidebar-fg hover:bg-white/5',
            open && 'text-sidebar-fg bg-white/5',
          )}
        >
          <Icon className="size-5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown className={cn('size-4 transition-transform duration-160', open && 'rotate-180')} />
            </>
          )}
        </button>
        {open && !collapsed && (
          <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
            {item.children!.filter((c) => hasAnyRole(c.roles)).map((child) => (
              <NavLink
                key={child.path}
                to={child.path!}
                className={({ isActive: childActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-160',
                    'text-sidebar-muted hover:text-sidebar-fg hover:bg-white/5',
                    childActive && 'text-sidebar-fg bg-sidebar-active/20 font-medium',
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path!}
      className={({ isActive: linkActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-160',
          'text-sidebar-muted hover:text-sidebar-fg hover:bg-white/5',
          (linkActive || isActive) && 'text-sidebar-fg bg-sidebar-active/20',
        )
      }
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col bg-sidebar-bg text-sidebar-fg transition-all duration-240 z-40',
        sidebarCollapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="size-9 shrink-0 rounded bg-primary flex items-center justify-center text-white font-bold text-sm">
          满
        </div>
        {!sidebarCollapsed && <span className="font-semibold text-sm whitespace-nowrap">满意度评价平台</span>}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {NAVIGATION.map((item) => (
          <NavItemRenderer key={item.label} item={item} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-12 border-t border-white/10 text-sidebar-muted hover:text-sidebar-fg transition-colors"
      >
        <ChevronLeft className={cn('size-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
      </button>
    </aside>
  );
}
