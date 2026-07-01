import { useAuthStore } from '@/stores/authStore';
import type { Role } from '@/types/domain';

export function usePermission() {
  const user = useAuthStore((s) => s.user);

  const hasRole = (role: Role) => user?.role === role;

  const hasAnyRole = (roles?: Role[]) => {
    if (!roles || roles.length === 0) return true;
    return user ? roles.includes(user.role as Role) : false;
  };

  return { role: user?.role as Role | undefined, hasRole, hasAnyRole };
}
