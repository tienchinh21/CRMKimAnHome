/**
 * CanAccess Component
 * Component linh hoạt cho phép kiểm tra quyền hoặc role
 * Kết hợp PermissionGuard và RoleGuard
 */

import type { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import type { Permission, UserRole } from '@/lib/rbac/types';

interface CanAccessProps {
  /**
   * Quyền cần kiểm tra (có thể là mảng)
   * Nếu không cung cấp, sẽ chỉ kiểm tra role
   */
  permission?: Permission | Permission[];

  /**
   * Role cần kiểm tra (có thể là mảng)
   * Nếu không cung cấp, sẽ chỉ kiểm tra permission
   */
  role?: UserRole | UserRole[];

  /**
   * Nội dung sẽ được render nếu user có quyền/role
   */
  children: ReactNode;

  /**
   * Nội dung sẽ được render nếu user không có quyền/role
   * @default null
   */
  fallback?: ReactNode;

  /**
   * Nếu true: user phải có TẤT CẢ quyền (AND logic)
   * Nếu false: user chỉ cần có MỘT quyền (OR logic)
   * Chỉ áp dụng khi permission là mảng
   * @default false
   */
  requireAll?: boolean;
}

/**
 * Component linh hoạt cho phép kiểm tra quyền hoặc role
 * @example
 * // Kiểm tra quyền
 * <CanAccess permission={PERMISSIONS.PROJECT_CREATE}>
 *   <Button>Tạo dự án</Button>
 * </CanAccess>
 *
 * @example
 * // Kiểm tra role
 * <CanAccess role="MANAGER">
 *   <AdminPanel />
 * </CanAccess>
 *
 * @example
 * // Kiểm tra cả quyền và role (AND logic)
 * <CanAccess
 *   permission={PERMISSIONS.PROJECT_CREATE}
 *   role={['MANAGER', 'ADMIN']}
 * >
 *   <Button>Tạo dự án (chỉ Manager/Admin)</Button>
 * </CanAccess>
 *
 * @example
 * // Kiểm tra một trong các quyền (OR logic)
 * <CanAccess
 *   permission={[PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_UPDATE]}
 * >
 *   <Button>Tạo hoặc sửa dự án</Button>
 * </CanAccess>
 *
 * @example
 * // Với fallback
 * <CanAccess
 *   permission={PERMISSIONS.PROJECT_CREATE}
 *   fallback={<p>Bạn không có quyền</p>}
 * >
 *   <Button>Tạo dự án</Button>
 * </CanAccess>
 */
export const CanAccess: React.FC<CanAccessProps> = ({
  permission,
  role,
  children,
  fallback = null,
  requireAll = false,
}) => {
  const { can, canAny, canAll, isRole } = usePermission();

  let hasAccess = true;

  // Kiểm tra quyền nếu được cung cấp
  if (permission) {
    hasAccess = Array.isArray(permission)
      ? requireAll
        ? canAll(permission)
        : canAny(permission)
      : can(permission);
  }

  // Kiểm tra role nếu được cung cấp (AND logic với permission)
  if (role && hasAccess) {
    hasAccess = isRole(role);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default CanAccess;

