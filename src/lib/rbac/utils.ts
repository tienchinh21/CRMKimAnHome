/**
 * RBAC Utility Functions
 * Các hàm tiện ích để kiểm tra quyền hạn
 */

import type { UserRole, Permission } from './types';
import { ROLE_CONFIGS } from './permissions';

/**
 * Kiểm tra user có quyền cụ thể không
 * @param userRole - Role của user
 * @param permission - Quyền cần kiểm tra
 * @returns true nếu user có quyền, false nếu không
 */
export const hasPermission = (
  userRole: UserRole | null | undefined,
  permission: Permission
): boolean => {
  if (!userRole) return false;

  const roleConfig = ROLE_CONFIGS[userRole];
  if (!roleConfig) return false;

  return roleConfig.permissions.includes(permission);
};

/**
 * Kiểm tra user có một trong các quyền không (OR logic)
 * @param userRole - Role của user
 * @param permissions - Danh sách quyền
 * @returns true nếu user có ít nhất một quyền
 */
export const hasAnyPermission = (
  userRole: UserRole | null | undefined,
  permissions: Permission[]
): boolean => {
  return permissions.some((permission) => hasPermission(userRole, permission));
};

/**
 * Kiểm tra user có tất cả các quyền không (AND logic)
 * @param userRole - Role của user
 * @param permissions - Danh sách quyền
 * @returns true nếu user có tất cả quyền
 */
export const hasAllPermissions = (
  userRole: UserRole | null | undefined,
  permissions: Permission[]
): boolean => {
  return permissions.every((permission) => hasPermission(userRole, permission));
};

/**
 * Kiểm tra user có role cụ thể không
 * @param userRole - Role của user
 * @param role - Role cần kiểm tra (có thể là mảng)
 * @returns true nếu user có role
 */
export const hasRole = (
  userRole: UserRole | null | undefined,
  role: UserRole | UserRole[]
): boolean => {
  if (!userRole) return false;

  if (Array.isArray(role)) {
    return role.includes(userRole);
  }

  return userRole === role;
};

/**
 * Lấy tất cả quyền của role
 * @param userRole - Role của user
 * @returns Danh sách quyền
 */
export const getRolePermissions = (userRole: UserRole): Permission[] => {
  return ROLE_CONFIGS[userRole]?.permissions || [];
};

/**
 * Lấy display name của role
 * @param userRole - Role của user
 * @returns Display name
 */
export const getRoleDisplayName = (userRole: UserRole): string => {
  return ROLE_CONFIGS[userRole]?.displayName || userRole;
};

/**
 * Lấy description của role
 * @param userRole - Role của user
 * @returns Description
 */
export const getRoleDescription = (userRole: UserRole): string => {
  return ROLE_CONFIGS[userRole]?.description || '';
};

/**
 * Lấy color badge của role
 * @param userRole - Role của user
 * @returns Tailwind color classes
 */
export const getRoleColor = (userRole: UserRole): string => {
  return ROLE_CONFIGS[userRole]?.color || 'bg-gray-100 text-gray-800';
};

/**
 * Lấy tất cả roles
 * @returns Danh sách tất cả roles
 */
export const getAllRoles = (): UserRole[] => {
  return Object.keys(ROLE_CONFIGS) as UserRole[];
};

/**
 * Lấy tất cả role configs
 * @returns Object chứa tất cả role configs
 */
export const getAllRoleConfigs = () => {
  return ROLE_CONFIGS;
};

