// Database relationship types
import { User } from "./user";
import { Group } from "./group";
import { GroupMember, GroupRole } from "./group-member";

// User-Group many-to-many relationship through GroupMember
export interface UserGroupAssignment {
  user_id: string;
  group_id: string;
  // Note: role is determined by business logic, not stored in DB
}

// User with groups
export interface UserWithGroups extends User {
  groups: GroupMember[];
  current_group?: Group; // User's current active group
}

// Group assignment DTO
export interface AssignGroupDto {
  user_id: string;
  group_id: string;
}

// Remove group assignment DTO
export interface RemoveGroupAssignmentDto {
  user_id: string;
  group_id: string;
}

// Bulk group assignment
export interface BulkAssignGroupDto {
  user_ids: string[];
  group_id: string;
}

// User group query filters
export interface UserGroupFilters {
  user_id?: string;
  group_id?: string;
}

// Pagination for user-group relationships
export interface UserGroupPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  data: UserGroupAssignment[];
}

// Group leadership validation
export interface GroupLeadershipValidation {
  group_id: string;
  current_leader_id?: string;
  new_leader_id: string;
  is_valid: boolean;
  error_message?: string;
}

// User permissions based on group membership and leadership
export interface UserPermissions {
  user_id: string;
  group_id: string;
  is_leader: boolean; // true if user is the leader of this group
  is_member: boolean; // true if user is a member of this group
  permissions: string[]; // Derived from membership and leadership status
  can_manage_members: boolean;
  can_manage_group: boolean;
  can_remove_members: boolean;
}
