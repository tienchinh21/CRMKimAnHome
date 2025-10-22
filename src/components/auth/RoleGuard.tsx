/**
 * RoleGuard Component
 * Component bảo vệ dựa trên role
 * Chỉ render children nếu user có role cụ thể
 */

import type { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import type { UserRole } from '@/lib/rbac/types';

interface RoleGuardProps {
  /**
   * Role cần kiểm tra (có thể là mảng)
   */
  role: UserRole | UserRole[];

  /**
   * Nội dung sẽ được render nếu user có role
   */
  children: ReactNode;

  /**
   * Nội dung sẽ được render nếu user không có role
   * @default null
   */
  fallback?: ReactNode;
}

/**
 * Component bảo vệ dựa trên role
 * @example
 * // Kiểm tra một role
 * <RoleGuard role="MANAGER">
 *   <AdminPanel />
 * </RoleGuard>
 *
 * @example
 * // Kiểm tra một trong các roles
 * <RoleGuard role={['MANAGER', 'ADMIN']}>
 *   <AdminPanel />
 * </RoleGuard>
 *
 * @example
 * // Với fallback
 * <RoleGuard
 *   role="MANAGER"
 *   fallback={<p>Bạn không có quyền truy cập</p>}
 * >
 *   <AdminPanel />
 * </RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  role,
  children,
  fallback = null,
}) => {
  const { isRole } = usePermission();

  return isRole(role) ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;

