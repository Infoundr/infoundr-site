import type {
  RemoveTeamMember,
  Role, RoleUnion,
  TeamMember,
  TeamMemberInviteWithId,
  UpdateTeamMemberRole,
} from '../types/team';
import { createAuthenticatedActor } from './auth';

export const listTeamMembers = async (
): Promise<TeamMember[] | null> => {
  try {
    const actor = await createAuthenticatedActor();
    const result = await actor.list_team_members();

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

export async function accept_invitation(token: string) {
  if (!token) throw new Error("No invitation token provided");

  try {
    const actor = await createAuthenticatedActor();
    const result = await actor.accept_invitation(token);

    if ("Err" in result) {
      throw new Error(result.Err);
    }

    return true; // success
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw error; // allow UI to handle it
  }
}

export async function decline_invitation(token: string) {
  if (!token) throw new Error("No invitation token provided");

  try {
    const actor = await createAuthenticatedActor();
    const result = await actor.decline_invitation(token);

    if ("Err" in result) {
      throw new Error(result.Err);
    }

    return true; // success
  } catch (error) {
    console.error("Error declining invitation:", error);
    throw error; // keep consistent with accept_invitation
  }
}
/*export async function updateTeamMemberStatus(
  token: string,
  status: MemberStatus
) {
  try {
    const actor = await createAuthenticatedActor();

    return await actor.update_team_member_status({
      token,
      new_status: status
    });
  } catch (error) {
    console.error("Error updating member status:", error);
    throw error;
  }
}*/





