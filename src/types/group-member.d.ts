export interface GroupMember {
  group_id: string; 
  staff_id: string; 
}

export enum GroupRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  LEADER = "Leader",
  STAFF = "Staff",
}

export interface CreateGroupMemberDto {
  group_id: string;
  staff_id: string;
}

export interface RemoveGroupMemberDto {
  group_id: string;
  staff_id: string;
}

export interface GroupMemberWithUser extends GroupMember {
  user: User;
}

export interface GroupMemberWithGroup extends GroupMember {
  group: Group;
}

export interface BulkAssignGroupMembersDto {
  group_id: string;
  staff_ids: string[];
}
export interface GroupMemberFilters {
  group_id?: string;
  staff_id?: string;
}

export interface GroupMemberPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  data: GroupMemberWithUser[];
}

import { User } from "./user";
