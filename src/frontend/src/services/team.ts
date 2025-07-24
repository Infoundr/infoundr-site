// src/services/team.ts
import { createAuthenticatedActor } from './auth';
import type {
  TeamMember,
  TeamMemberInviteWithId,
  UpdateTeamMemberRole,
  RemoveTeamMember,
} from '../types/team';
import type { Role, RoleUnion } from '../types/team';


export const listTeamMembers = async (
  acceleratorId: string
): Promise<TeamMember[] | null> => {
  try {
    const actor = await createAuthenticatedActor();
    const result = await actor.list_team_members(acceleratorId);

    if ('Err' in result) {
      console.error('Error listing team members:', result.Err);
      return null;
    }

    const teamMembers: TeamMember[] = result.Ok.map((member: any) => {
      const principal = member.principal || [];
      const principalId = principal.length ? principal[0].toText() : 'N/A';

      return {
        email: member.email,
        name: member.name,
        role: member.role, 
        roleString: roleToString(member.role), 
        status: member.status,
        principal,
        principalId,
        token: member.token,
        avatarUrl: '', 
      };
    });

    return teamMembers;
  } catch (err) {
    console.error('Error in listTeamMembers:', err);
    return null;
  }
};



export const inviteTeamMember = async (
  payload: TeamMemberInviteWithId
): Promise<string | null> => {
  try {
    const actor = await createAuthenticatedActor();
    const result = await actor.invite_team_member(payload);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  } catch (err) {
    console.error('Error inviting team member:', err);
    return null;
  }
};

export const updateTeamMemberRole = async (
  payload: UpdateTeamMemberRole
): Promise<boolean> => {
  try {
    const actor = await createAuthenticatedActor();
    const result = await actor.update_team_member_role(payload);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return true;
  } catch (err) {
    console.error('Error updating team member role:', err);
    return false;
  }
};

export const removeTeamMember = async (
  payload: RemoveTeamMember
): Promise<boolean> => {
  try {
    const actor = await createAuthenticatedActor();
    const result = await actor.remove_team_member(payload);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return true;
  } catch (err) {
    console.error('Error removing team member:', err);
    return false;
  }
};

const roleToString = (role: Role): RoleUnion => {
  if ('Admin' in role) return 'Admin';
  if ('ProgramManager' in role) return 'ProgramManager';
  if ('Viewer' in role) return 'Viewer';
  if ('SuperAdmin' in role) return 'SuperAdmin';
  throw new Error('Unknown role');
};

const roleToVariant = (role: RoleUnion): Role => {
  switch (role) {
    case 'Admin':
      return { Admin: null };
    case 'ProgramManager':
      return { ProgramManager: null };
    case 'Viewer':
      return { Viewer: null };
    case 'SuperAdmin':
      return { SuperAdmin: null };
    default:
      throw new Error(`Invalid role: ${role}`);
  }
};

