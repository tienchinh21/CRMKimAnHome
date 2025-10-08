// Group table types
export interface Group {
  id: string; // BINARY(16) - Primary Key
  name: string; // NVARCHAR(25) - Group name
  leader_id: string; // BINARY(16) - Foreign Key to User (only 1 leader per group)
  created_at?: Date;
  updated_at?: Date;
}

// Group creation DTO (without id, timestamps)
export interface CreateGroupDto {
  name: string;
  leader_id: string;
}

// Group update DTO (all fields optional except id)
export interface UpdateGroupDto {
  id: string;
  name?: string;
  leader_id?: string;
}

// Group with leader and members (for API responses)
export interface GroupWithDetails extends Group {
  leader: User;
  members: GroupMember[];
  member_count: number;
}

// Import User type for relationships
import { User } from "./user";
