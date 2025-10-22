/**
 * PermissionGuard Component
 * Component bảo vệ dựa trên quyền hạn
 * Chỉ render children nếu user có quyền
 */

import type { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import type { Permission } from '@/lib/rbac/types';

interface PermissionGuardProps {
  /**
   * Quyền cần kiểm tra (có thể là mảng)
   */
  permission: Permission | Permission[];

  /**
   * Nội dung sẽ được render nếu user có quyền
   */
  children: ReactNode;

  /**
   * Nội dung sẽ được render nếu user không có quyền
   * @default null
   */
  fallback?: ReactNode;

  /**
   * Nếu true: user phải có TẤT CẢ quyền (AND logic)
   * Nếu false: user chỉ cần có MỘT quyền (OR logic)
   * @default false
   */
  requireAll?: boolean;
}

/**
 * Component bảo vệ dựa trên quyền
 * @example
 * // Kiểm tra một quyền
 * <PermissionGuard permission={PERMISSIONS.PROJECT_CREATE}>
 *   <Button>Tạo dự án</Button>
 * </PermissionGuard>
 *
 * @example
 * // Kiểm tra một trong các quyền (OR logic)
 * <PermissionGuard permission={[PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_UPDATE]}>
 *   <Button>Tạo hoặc sửa dự án</Button>
 * </PermissionGuard>
 *
 * @example
 * // Kiểm tra tất cả quyền (AND logic)
 * <PermissionGuard
 *   permission={[PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_DELETE]}
 *   requireAll={true}
 * >
 *   <Button>Tạo và xóa dự án</Button>
 * </PermissionGuard>
 *
 * @example
 * // Với fallback
 * <PermissionGuard
 *   permission={PERMISSIONS.PROJECT_CREATE}
 *   fallback={<p>Bạn không có quyền tạo dự án</p>}
 * >
 *   <Button>Tạo dự án</Button>
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null,
  requireAll = false,
}) => {
  const { can, canAny, canAll } = usePermission();

  // Kiểm tra quyền
  const hasAccess = Array.isArray(permission)
    ? requireAll
      ? canAll(permission)
      : canAny(permission)
    : can(permission);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;

