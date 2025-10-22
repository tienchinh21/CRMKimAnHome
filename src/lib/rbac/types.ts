/**
 * RBAC (Role-Based Access Control) Type Definitions
 * Định nghĩa các types cho hệ thống phân quyền
 */

/**
 * User Roles - Các vai trò người dùng
 */
export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'LEADER'
  | 'SUPERMARKET'
  | 'MARKET'
  | 'SALE';

/**
 * Permissions - Các quyền hạn
 */
export type Permission =
  // Projects
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  // Apartments
  | 'apartment:create'
  | 'apartment:read'
  | 'apartment:update'
  | 'apartment:delete'
  // Customers
  | 'customer:create'
  | 'customer:read'
  | 'customer:read_phone'
  | 'customer:update'
  | 'customer:delete'
  // Deals
  | 'deal:create'
  | 'deal:read'
  | 'deal:update'
  | 'deal:delete'
  // Deal Payments
  | 'deal_payment:create'
  | 'deal_payment:read'
  | 'deal_payment:update'
  | 'deal_payment:delete'
  // Blog
  | 'blog:create'
  | 'blog:read'
  | 'blog:update'
  | 'blog:delete'
  // System
  | 'user:manage'
  | 'team:manage'
  | 'system:config';

/**
 * Role Configuration Interface
 */
export interface RoleConfig {
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
  color?: string;
}

/**
 * Role Permissions Map
 */
export interface RolePermissions {
  [key: string]: Permission[];
}

