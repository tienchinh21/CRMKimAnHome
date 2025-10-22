/**
 * usePermission Hook
 * Custom hook để kiểm tra quyền hạn trong components
 */

import { useAppSelector } from "./redux";
import type { Permission, UserRole } from "@/lib/rbac/types";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  getRolePermissions,
  getRoleDisplayName,
  getRoleDescription,
  getRoleColor,
} from "@/lib/rbac/utils";

/**
 * Hook để sử dụng RBAC trong components
 * @returns Object chứa các hàm kiểm tra quyền
 */
export const usePermission = () => {
  // Lấy role từ Redux store và convert thành uppercase
  const rawRole = useAppSelector(
    (state) => state.auth.userProfile?.roleNames?.[0]
  );

  // ⭐ Convert role thành uppercase để match với ROLE_CONFIGS
  const userRole = (rawRole?.toUpperCase() || null) as UserRole | null;

  return {
    /**
     * Kiểm tra user có quyền cụ thể không
     * @example
     * const { can } = usePermission();
     * if (can(PERMISSIONS.PROJECT_CREATE)) {
     *   // render button
     * }
     */
    can: (permission: Permission): boolean =>
      hasPermission(userRole, permission),

    /**
     * Kiểm tra user có một trong các quyền không (OR logic)
     * @example
     * const { canAny } = usePermission();
     * if (canAny([PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_UPDATE])) {
     *   // render button
     * }
     */
    canAny: (permissions: Permission[]): boolean =>
      hasAnyPermission(userRole, permissions),

    /**
     * Kiểm tra user có tất cả các quyền không (AND logic)
     * @example
     * const { canAll } = usePermission();
     * if (canAll([PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_DELETE])) {
     *   // render button
     * }
     */
    canAll: (permissions: Permission[]): boolean =>
      hasAllPermissions(userRole, permissions),

    /**
     * Kiểm tra user có role cụ thể không
     * @example
     * const { isRole } = usePermission();
     * if (isRole('MANAGER')) {
     *   // render admin panel
     * }
     * if (isRole(['MANAGER', 'ADMIN'])) {
     *   // render for multiple roles
     * }
     */
    isRole: (role: UserRole | UserRole[]): boolean => hasRole(userRole, role),

    /**
     * Lấy tất cả quyền của user
     * @example
     * const { getPermissions } = usePermission();
     * const permissions = getPermissions();
     */
    getPermissions: (): Permission[] =>
      userRole ? getRolePermissions(userRole) : [],

    /**
     * Lấy display name của role
     * @example
     * const { getRoleName } = usePermission();
     * const roleName = getRoleName(); // "Sếp", "Nhân viên kinh doanh", etc.
     */
    getRoleName: (): string =>
      userRole ? getRoleDisplayName(userRole) : "Unknown",

    /**
     * Lấy description của role
     * @example
     * const { getRoleDesc } = usePermission();
     * const desc = getRoleDesc();
     */
    getRoleDesc: (): string => (userRole ? getRoleDescription(userRole) : ""),

    /**
     * Lấy color badge của role
     * @example
     * const { getRoleColorClass } = usePermission();
     * const colorClass = getRoleColorClass(); // "bg-blue-100 text-blue-800"
     */
    getRoleColorClass: (): string =>
      userRole ? getRoleColor(userRole) : "bg-gray-100 text-gray-800",

    /**
     * Lấy role hiện tại
     * @example
     * const { role } = usePermission();
     * console.log(role); // "MANAGER", "SALE", etc.
     */
    role: userRole,
  };
};
