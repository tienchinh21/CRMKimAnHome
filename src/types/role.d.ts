
export interface Role {
  id: string; 
  name: string; 
  description?: string | null; 
  created_at?: Date;
  updated_at?: Date;
}


export interface RoleResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}


export interface CreateRoleDto {
  name: string;
  description?: string | null;
}

export interface UpdateRoleDto {
  id: string;
  name?: string;
  description?: string | null;
}


export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at?: Date;
  assigned_by?: string; 
}

export interface RoleWithUsers extends Role {
  users: User[];
}

import { User } from "./user";
