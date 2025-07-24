import type { Principal } from '@dfinity/principal';

export interface TeamMember {
  status: MemberStatus;
  principal: [] | [Principal];
  principalId?: string; // Flattened principal string for frontend use
  token?: string;
  role: Role;
  roleString: RoleUnion; // Human-readable role string
  email: string;
  name: string;
  avatarUrl?: string;
}

export type MemberStatus = { Active: null } | { Pending: null };

export type Role = { ProgramManager: null } | { Viewer: null } | { SuperAdmin: null } | { Admin: null };

export type RoleUnion = 'ProgramManager' | 'Viewer' | 'SuperAdmin' | 'Admin';

// ✅ Add and export the new interfaces individually

// Used for sending invites with an identifier
export interface TeamMemberInviteWithId {
  email: string;
  role: Role; 
  accelerator_id: string;
  name: string
}

// Used when updating a team member's role
export interface UpdateTeamMemberRole {
  accelerator_id: string;
  email:string
  new_role: Role;
}

// Used when removing a team member
export interface RemoveTeamMember {
  accelerator_id: string;
  email:string
}
export const convertRoleToString = (role: Role): RoleUnion => {
  if ('Admin' in role) return 'Admin';
  if ('SuperAdmin' in role) return 'SuperAdmin';
  if ('ProgramManager' in role) return 'ProgramManager';
  if ('Viewer' in role) return 'Viewer';
  throw new Error('Unknown role');
};
