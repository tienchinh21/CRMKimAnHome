// Team types based on API
export interface Team {
  id: string;
  name: string;
  leaderId: string;
  leaderName?: string;
  members?: User[];
}

export interface CreateTeamDto {
  name: string;
  leaderId: string;
}

export interface UpdateTeamDto {
  name?: string;
  leaderId?: string;
}

export interface TeamResponse {
  id: string;
  name: string;
  leaderName: string;
}

export interface TeamDetailResponse {
  id: string;
  name: string;
  leaderName: string;
  members: UserResponse[];
}

// User types based on API
export interface UserResponse {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  avatarUrl?: string;
  isActive: boolean;
  gender: string;
  roleNames: string[];
  birthDay?: string;
}

export interface UserDetailResponse {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  avatarUrl?: string;
  isActive: boolean;
  gender: string;
  roleNames: string[];
  birthDay?: string;
  ledGroupName?: string;
  inGroupName: string[];
  birthDay?: string;
}

export interface CreateUserDto {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  isActive: boolean;
  genderId: string;
  roleIds: string[];
}

export interface UpdateUserDto {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  genderId?: string;
  roleIds?: string[];
}

// Core Enum types
export interface CoreEnum {
  id: string;
  type: string;
  name: string;
}

export interface CreateCoreEnumDto {
  type: string;
  name: string;
}

export interface UpdateCoreEnumDto {
  type?: string;
  name?: string;
}

// Role types
export interface Role {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateRoleDto {
  name: string;
}

export interface UpdateRoleDto {
  name?: string;
}
