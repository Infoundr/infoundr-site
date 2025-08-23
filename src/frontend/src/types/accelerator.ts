/*import type { Principal } from '@dfinity/principal';

export interface Accelerator {
  id: Principal;
  graduated_startups: number;
  active_startups: number;
  logo: [] | [Array<Uint8Array | number[]>];
  name: string;
  email: string;
  website: string;
  team_members: TeamMember[];
  total_startups: number;
  recent_activity: Activity[];
  email_verified: boolean;
  invites_sent: number;

}

export interface TeamMember {
  status: MemberStatus;
  principal: [] | [Principal];
  token: [] | [string];
  role: Role;
  email: string;
}

export interface Activity {
  activity_type: ActivityType;
  description: string;
  timestamp: bigint;
}

export type ActivityType = 
  | { Graduated: null }
  | { UpdatedPitchDeck: null }
  | { Joined: null }
  | { Other: string }
  | { AcceleratorCreated: null }
  | { SentInvite: null }
  | { MissedMilestone: null };

export type MemberStatus = { Active: null } | { Pending: null };

export type Role = { ProgramManager: null } | { Viewer: null } | { SuperAdmin: null } | { Admin: null };

export interface AcceleratorStats {
  total_startups: number;
  invites_sent: number;
  active_startups: number;
  graduated_startups: number;
} */
import type { Principal } from '@dfinity/principal';

export interface Accelerator {
  id: Principal;
  graduated_startups: number;
  active_startups: number;
  logo: [] | [Array<Uint8Array | number[]>];
  name: string;
  email: string;
  website: string;
  team_members: TeamMember[];
  total_startups: number;
  recent_activity: Activity[];
  email_verified: boolean;
  invites_sent: number;
}

export interface TeamMember {
  status: MemberStatus;
  principal: [] | [Principal];
  principalId?: string; // ✅ Flattened Principal string for frontend use
  token: [] | [string];
  role: Role;
  roleString?: RoleUnion; // ✅ Human-readable role string
  email: string;
}

export interface Activity {
  activity_type: ActivityType;
  description: string;
  timestamp: bigint;
}

export type ActivityType =
  | { Graduated: null }
  | { UpdatedPitchDeck: null }
  | { Joined: null }
  | { Other: string }
  | { AcceleratorCreated: null }
  | { SentInvite: null }
  | { MissedMilestone: null };

export type MemberStatus = { Active: null } | { Declined: null } | { Pending: null };

export type Role =
  | { ProgramManager: null }
  | { Viewer: null }
  | { SuperAdmin: null }
  | { Admin: null };

// ✅ For role string mapping (e.g., "Admin", "Viewer")
export type RoleUnion = 'ProgramManager' | 'Viewer' | 'SuperAdmin' | 'Admin';

export interface AcceleratorStats {
  total_startups: number;
  invites_sent: number;
  active_startups: number;
  graduated_startups: number;
}
