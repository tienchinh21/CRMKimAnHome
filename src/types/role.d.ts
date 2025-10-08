// Role table types
export interface Role {
  id: string; // BINARY(16) - Primary Key
  name: string; // VARCHAR(50) - unique
  description?: string | null; // Additional field for role description
  created_at?: Date;
  updated_at?: Date;
}

// Role response from API (based on OpenAPI spec)
export interface RoleResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Role creation DTO (without id, timestamps)
export interface CreateRoleDto {
  name: string;
  description?: string | null;
}

// Role update DTO (all fields optional except id)
export interface UpdateRoleDto {
  id: string;
  name?: string;
  description?: string | null;
}

// User-Role relationship table (many-to-many)
export interface UserRole {
  user_id: string; // BINARY(16) - Foreign Key to User
  role_id: string; // BINARY(16) - Foreign Key to Role
  assigned_at?: Date;
  assigned_by?: string; // User ID who assigned this role
}

// Role with users (for API responses)
export interface RoleWithUsers extends Role {
  users: User[];
}

// Import User type for relationships
import { User } from "./user";
