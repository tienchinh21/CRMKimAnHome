import { User } from "./user";
import { Group } from "./group";
import { GroupMember, GroupRole } from "./group-member";

export interface UserGroupAssignment {
  user_id: string;
  group_id: string;
}

export interface UserWithGroups extends User {
  groups: GroupMember[];
  current_group?: Group;
}

export interface AssignGroupDto {
  user_id: string;
  group_id: string;
}

export interface RemoveGroupAssignmentDto {
  user_id: string;
  group_id: string;
}
export interface BulkAssignGroupDto {
  user_ids: string[];
  group_id: string;
}
export interface UserGroupFilters {
  user_id?: string;
  group_id?: string;
}

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

export interface UserPermissions {
  user_id: string;
  group_id: string;
  is_leader: boolean; 
  is_member: boolean; 
  permissions: string[]; 
  can_manage_members: boolean;
  can_manage_group: boolean;
  can_remove_members: boolean;
}
