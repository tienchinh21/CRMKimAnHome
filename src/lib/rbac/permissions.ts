/**
 * RBAC Permissions Configuration
 * Cấu hình quyền hạn cho từng role
 */

import type { Permission, RoleConfig, UserRole } from "./types";

/**
 * ============ PERMISSION CONSTANTS ============
 * Các hằng số quyền hạn
 */
export const PERMISSIONS = {
  // Projects
  PROJECT_CREATE: "project:create" as Permission,
  PROJECT_READ: "project:read" as Permission,
  PROJECT_UPDATE: "project:update" as Permission,
  PROJECT_DELETE: "project:delete" as Permission,

  // Apartments
  APARTMENT_CREATE: "apartment:create" as Permission,
  APARTMENT_READ: "apartment:read" as Permission,
  APARTMENT_UPDATE: "apartment:update" as Permission,
  APARTMENT_DELETE: "apartment:delete" as Permission,

  // Customers
  CUSTOMER_CREATE: "customer:create" as Permission,
  CUSTOMER_READ: "customer:read" as Permission,
  CUSTOMER_READ_PHONE: "customer:read_phone" as Permission,
  CUSTOMER_UPDATE: "customer:update" as Permission,
  CUSTOMER_DELETE: "customer:delete" as Permission,

  // Deals
  DEAL_CREATE: "deal:create" as Permission,
  DEAL_READ: "deal:read" as Permission,
  DEAL_UPDATE: "deal:update" as Permission,
  DEAL_DELETE: "deal:delete" as Permission,
  DEAL_COMPLETE: "deal:complete" as Permission, // ⭐ Permission to mark deal as completed

  // Deal Payments
  DEAL_PAYMENT_CREATE: "deal_payment:create" as Permission,
  DEAL_PAYMENT_READ: "deal_payment:read" as Permission,
  DEAL_PAYMENT_UPDATE: "deal_payment:update" as Permission,
  DEAL_PAYMENT_DELETE: "deal_payment:delete" as Permission,

  // Blog
  BLOG_CREATE: "blog:create" as Permission,
  BLOG_READ: "blog:read" as Permission,
  BLOG_UPDATE: "blog:update" as Permission,
  BLOG_DELETE: "blog:delete" as Permission,

  // Dashboard
  DASHBOARD_READ: "dashboard:read" as Permission,

  // Payroll
  PAYROLL_READ: "payroll:read" as Permission,
  PAYROLL_MANAGE: "payroll:manage" as Permission,

  // Bonus
  BONUS_READ: "bonus:read" as Permission,
  BONUS_MANAGE: "bonus:manage" as Permission,

  // System
  USER_MANAGE: "user:manage" as Permission,
  TEAM_MANAGE: "team:manage" as Permission,
  SYSTEM_CONFIG: "system:config" as Permission,
} as const;

/**
 * ============ ROLE CONFIGURATIONS ============
 * Cấu hình chi tiết cho từng role
 */
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  ADMIN: {
    name: "ADMIN",
    displayName: "Admin",
    description: "Quản lý hệ thống (Dev Team)",
    color: "bg-red-100 text-red-800",
    permissions: [
      // Full access
      PERMISSIONS.PROJECT_CREATE,
      PERMISSIONS.PROJECT_READ,
      PERMISSIONS.PROJECT_UPDATE,
      PERMISSIONS.PROJECT_DELETE,
      PERMISSIONS.APARTMENT_CREATE,
      PERMISSIONS.APARTMENT_READ,
      PERMISSIONS.APARTMENT_UPDATE,
      PERMISSIONS.APARTMENT_DELETE,
      PERMISSIONS.CUSTOMER_CREATE,
      PERMISSIONS.CUSTOMER_READ,
      PERMISSIONS.CUSTOMER_READ_PHONE,
      PERMISSIONS.CUSTOMER_UPDATE,
      PERMISSIONS.CUSTOMER_DELETE,
      PERMISSIONS.DEAL_CREATE,
      PERMISSIONS.DEAL_READ,
      PERMISSIONS.DEAL_UPDATE,
      PERMISSIONS.DEAL_DELETE,
      PERMISSIONS.DEAL_COMPLETE,
      PERMISSIONS.DEAL_PAYMENT_CREATE,
      PERMISSIONS.DEAL_PAYMENT_READ,
      PERMISSIONS.DEAL_PAYMENT_UPDATE,
      PERMISSIONS.DEAL_PAYMENT_DELETE,
      PERMISSIONS.BLOG_CREATE,
      PERMISSIONS.BLOG_READ,
      PERMISSIONS.BLOG_UPDATE,
      PERMISSIONS.BLOG_DELETE,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.TEAM_MANAGE,
      PERMISSIONS.PAYROLL_READ,
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.BONUS_READ,
      PERMISSIONS.BONUS_MANAGE,
      PERMISSIONS.SYSTEM_CONFIG,
    ],
  },

  MANAGER: {
    name: "MANAGER",
    displayName: "Sếp",
    description: "Quản lý toàn bộ hệ thống",
    color: "bg-blue-100 text-blue-800",
    permissions: [
      // Full access to everything (same as ADMIN for business logic)
      PERMISSIONS.PROJECT_CREATE,
      PERMISSIONS.PROJECT_READ,
      PERMISSIONS.PROJECT_UPDATE,
      PERMISSIONS.PROJECT_DELETE,
      PERMISSIONS.APARTMENT_CREATE,
      PERMISSIONS.APARTMENT_READ,
      PERMISSIONS.APARTMENT_UPDATE,
      PERMISSIONS.APARTMENT_DELETE,
      PERMISSIONS.CUSTOMER_CREATE,
      PERMISSIONS.CUSTOMER_READ,
      PERMISSIONS.CUSTOMER_READ_PHONE,
      PERMISSIONS.CUSTOMER_UPDATE,
      PERMISSIONS.CUSTOMER_DELETE,
      PERMISSIONS.DEAL_CREATE,
      PERMISSIONS.DEAL_READ,
      PERMISSIONS.DEAL_UPDATE,
      PERMISSIONS.DEAL_DELETE,
      PERMISSIONS.DEAL_COMPLETE,
      PERMISSIONS.DEAL_PAYMENT_CREATE,
      PERMISSIONS.DEAL_PAYMENT_READ,
      PERMISSIONS.DEAL_PAYMENT_UPDATE,
      PERMISSIONS.DEAL_PAYMENT_DELETE,
      PERMISSIONS.BLOG_CREATE,
      PERMISSIONS.BLOG_READ,
      PERMISSIONS.BLOG_UPDATE,
      PERMISSIONS.BLOG_DELETE,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.TEAM_MANAGE,
      PERMISSIONS.PAYROLL_READ,
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.BONUS_READ,
      PERMISSIONS.BONUS_MANAGE,
      PERMISSIONS.SYSTEM_CONFIG,
    ],
  },

  LEADER: {
    name: "LEADER",
    displayName: "Đội trưởng",
    description: "Quản lý nhóm của mình",
    color: "bg-green-100 text-green-800",
    permissions: [
      PERMISSIONS.CUSTOMER_CREATE,
      PERMISSIONS.CUSTOMER_READ,
      PERMISSIONS.DEAL_CREATE,
      PERMISSIONS.DEAL_READ,
      PERMISSIONS.DEAL_UPDATE,
      PERMISSIONS.DEAL_PAYMENT_READ,
      PERMISSIONS.TEAM_MANAGE,
      PERMISSIONS.PAYROLL_READ,
    ],
  },

  SUPERMARKET: {
    name: "SUPERMARKET",
    displayName: "Vợ Manager",
    description: "Quản lý deal và nội dung",
    color: "bg-purple-100 text-purple-800",
    permissions: [
      PERMISSIONS.PROJECT_CREATE,
      PERMISSIONS.PROJECT_READ,
      PERMISSIONS.PROJECT_UPDATE,
      PERMISSIONS.PROJECT_DELETE,
      PERMISSIONS.APARTMENT_CREATE,
      PERMISSIONS.APARTMENT_READ,
      PERMISSIONS.APARTMENT_UPDATE,
      PERMISSIONS.APARTMENT_DELETE,
      PERMISSIONS.DEAL_READ,
      PERMISSIONS.DEAL_UPDATE,
      PERMISSIONS.DEAL_DELETE,
      PERMISSIONS.DEAL_COMPLETE,
      PERMISSIONS.DEAL_PAYMENT_CREATE,
      PERMISSIONS.DEAL_PAYMENT_READ,
      PERMISSIONS.DEAL_PAYMENT_UPDATE,
      PERMISSIONS.DEAL_PAYMENT_DELETE,
      PERMISSIONS.BLOG_CREATE,
      PERMISSIONS.BLOG_READ,
      PERMISSIONS.BLOG_UPDATE,
      PERMISSIONS.BLOG_DELETE,
    ],
  },

  MARKET: {
    name: "MARKET",
    displayName: "Market",
    description: "Quản lý deal payment của dự án",
    color: "bg-yellow-100 text-yellow-800",
    permissions: [
      PERMISSIONS.DEAL_PAYMENT_READ,
      PERMISSIONS.DEAL_PAYMENT_UPDATE,
    ],
  },

  SALE: {
    name: "SALE",
    displayName: "Nhân viên kinh doanh",
    description: "Tạo khách hàng và deal",
    color: "bg-indigo-100 text-indigo-800",
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.APARTMENT_READ,
      PERMISSIONS.PROJECT_READ,
      PERMISSIONS.CUSTOMER_CREATE,
      PERMISSIONS.CUSTOMER_READ,
      PERMISSIONS.CUSTOMER_READ_PHONE,
      PERMISSIONS.DEAL_CREATE,
      PERMISSIONS.DEAL_READ,
      PERMISSIONS.DEAL_PAYMENT_READ,
      PERMISSIONS.PAYROLL_READ,
      PERMISSIONS.BONUS_READ,
    ],
  },
};
