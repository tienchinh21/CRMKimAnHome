// Group Member table types (junction table)
// Based on actual schema: only group_id and staff_id as composite primary key
export interface GroupMember {
  group_id: string; // BINARY(16) - Foreign Key to Group
  staff_id: string; // BINARY(16) - Foreign Key to User
}

// Group roles enum (for business logic, not stored in DB)
export enum GroupRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  LEADER = "Leader",
  STAFF = "Staff",
}

// Group member creation DTO
export interface CreateGroupMemberDto {
  group_id: string;
  staff_id: string;
}

// Remove group member DTO
export interface RemoveGroupMemberDto {
  group_id: string;
  staff_id: string;
}

// Group member with user details
export interface GroupMemberWithUser extends GroupMember {
  user: User;
}

// Group member with group details
export interface GroupMemberWithGroup extends GroupMember {
  group: Group;
}

// Bulk assign members to group
export interface BulkAssignGroupMembersDto {
  group_id: string;
  staff_ids: string[];
}

// Group member query filters
export interface GroupMemberFilters {
  group_id?: string;
  staff_id?: string;
}

// Pagination for group members
export interface GroupMemberPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  data: GroupMemberWithUser[];
}

// Import User type for relationships
import { User } from "./user";
