export interface Group {
  id: string; 
  name: string; 
  leader_id: string; 
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateGroupDto {
  name: string;
  leader_id: string;
}

export interface UpdateGroupDto {
  id: string;
  name?: string;
  leader_id?: string;
}

export interface GroupWithDetails extends Group {
  leader: User;
  members: GroupMember[];
  member_count: number;
}

import { User } from "./user";
