import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyAccelerator } from '../../../services/accelerator';
import {
  inviteTeamMember,
  listTeamMembers,
  updateTeamMemberRole,
  removeTeamMember
} from '../../../services/team';
import type { TeamMember, Role, RoleUnion } from '../../../types/team';
import type { TeamMemberInviteWithId, UpdateTeamMemberRole, RemoveTeamMember } from '../../../types/team';
import { emailService } from '../../../services/email';
import { toast } from 'react-toastify';


const RolesPermissions: React.FC = () => {
  const navigate = useNavigate();
  const [acceleratorName, setAcceleratorName] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<RoleUnion>('Viewer');

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<RoleUnion>('Viewer');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteName, setInviteName] = useState('');

  const roleOptions: RoleUnion[] = ['Viewer', 'ProgramManager', 'Admin', 'SuperAdmin'];

  const roleToVariant = (r: RoleUnion): Role => ({ [r]: null } as Role);

  const canEdit = ['SuperAdmin', 'Admin'].includes(currentUserRole);

  // Fetch accelerator and team data
  useEffect(() => {
    const init = async () => {
      const acc = await getMyAccelerator();
      if (!acc) return;

      setAcceleratorName(acc.name ?? '');

      const me = acc.team_members.find(
        m => m.principalId && acc.id && m.principalId === acc.id.toText?.()
      );
      setCurrentUserRole(me?.roleString || 'Viewer');

      const members = await listTeamMembers();
      if (members) setTeamMembers(members);
    };
    init();
  }, []);

  const filtered = teamMembers.filter(m =>
    (m.name ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
    m.email.toLowerCase().includes(searchText.toLowerCase()) ||
    (m.principalId ?? '').toLowerCase().includes(searchText.toLowerCase())
  );

  const openInvite = () => {
    setInviteEmail('');
    setInviteRole('Viewer');
    setInviteName('');
    setInviteToken(null);
    setInviteError(null);
    setCopied(false);
    setInviteModalOpen(true);
  };

  const handleInvite = async () => {
    setInviteLoading(true);
    setInviteToken(null);
    setInviteError(null);

    const payload: TeamMemberInviteWithId = {
      email: inviteEmail,
      role: roleToVariant(inviteRole),
      name: inviteName
    };

    const result = await inviteTeamMember(payload);
    setInviteLoading(false);

    if (result) {
      // ✅ Correct route for team invites
      const inviteUrl = `${window.location.origin}/accelerator/team-invite/${encodeURIComponent(result)}`;
      setInviteToken(inviteUrl);

      const updated = await listTeamMembers();
      if (updated) setTeamMembers(updated);
      
      // Send email invitation
      try {
        const inviteLink = `${window.location.origin}/accelerator/roles/invite/${result}`;
        
        // Create a team invite email template data
        const emailData = {
          email: inviteEmail,
          startupName: inviteName || 'Team Member',
          programName: acceleratorName,
          inviteCode: result,
          inviteLink: inviteLink,
          expiryDate: '7 days from now'
        };

        await emailService.sendTeamInvite(emailData);
        toast.success('Team member invited and email sent successfully!');
      } catch (emailError) {
        console.error('Error sending team invite email:', emailError);
        toast.warning('Team member invited but failed to send email. You can share the invite link manually.');
      }
    } else {
      setInviteError('Failed to send invite');
    }
  };

  const handleRoleUpdate = async (email: string, newRole: RoleUnion) => {
    const payload: UpdateTeamMemberRole = {
      email,
      new_role: roleToVariant(newRole)
    };
    const ok = await updateTeamMemberRole(payload);
    if (ok) {
      const updated = await listTeamMembers();
      if (updated) setTeamMembers(updated);
    } else {
      alert('Failed to update role');
    }
  };

  const handleRemove = async (email: string) => {
    const payload: RemoveTeamMember = { email };
    const ok = await removeTeamMember(payload);
    if (ok) {
      const updated = await listTeamMembers();
      if (updated) setTeamMembers(updated);
    } else {
      alert('Failed to remove member');
    }
  };

  const handleResendInvite = async (member: TeamMember) => {
    if (!('Pending' in member.status)) {
      toast.error('Can only resend invites to pending members');
      return;
    }

    try {
      // Find the invite token for this member
      const inviteLink = `${window.location.origin}/accelerator/roles/invite/${member.token}`;
      
      const emailData = {
        email: member.email,
        startupName: member.name || 'Team Member',
        programName: acceleratorName,
        inviteCode: member.token || '',
        inviteLink: inviteLink,
        expiryDate: '7 days from now'
      };

              await emailService.sendTeamInvite(emailData);
        toast.success('Invite email resent successfully!');
    } catch (emailError) {
      console.error('Error resending invite email:', emailError);
      toast.error('Failed to resend invite email');
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Roles & Permissions</h1>
          <p className="text-gray-600">Manage team access and control permissions</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-2 bg-white border rounded-md">
            {acceleratorName || '—'}
          </span>
          <button
            onClick={openInvite}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Invite a Team Member
          </button>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white shadow-md rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Team Members</h2>
          <input
            type="text"
            placeholder="Search team member..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="border p-2 rounded w-64"
          />
        </div>

        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              {canEdit && <th className="px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(member => (
              <tr key={member.email} className="border-b">
                <td className="px-4 py-3 flex items-center gap-2">
                  <img
                    className="w-8 h-8 rounded-full"
                    src={
                      member.token && member.token.length
                        ? `https://avatars.dicebear.com/api/initials/${encodeURIComponent(member.name || member.email)}.svg`
                        : 'https://via.placeholder.com/32'
                    }
                    alt="avatar"
                  />
                  <div>
                    <span>{member.name ?? member.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{member.email}</td>
                <td className="px-4 py-3">
                  {member.roleString ??
                    (typeof member.role === 'object'
                      ? Object.keys(member.role)[0]
                      : 'Viewer')}
                </td>
                <td className="px-4 py-3">
                  {'Active' in member.status ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                  )}
                </td>
                {canEdit && (
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() =>
                        handleRoleUpdate(member.email, (member.roleString ?? 'Viewer') as RoleUnion)
                      }
                      className="text-blue-600 underline"
                    >
                      Edit
                    </button>
                    {'Pending' in member.status && (
                      <button
                        onClick={() => handleResendInvite(member)}
                        className="text-green-600 underline"
                      >
                        Resend Invite
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(member.email)}
                      className="text-red-600 underline"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 5 : 4} className="px-4 py-6 text-center text-gray-500">
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg max-w-md p-6 space-y-4">
            {!inviteToken ? (
              <>
                <h3 className="text-xl font-semibold">Invite a Team Member</h3>
                <input
                  type="email"
                  placeholder="Email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as RoleUnion)}
                  className="border p-2 rounded w-full"
                >
                  {roleOptions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {inviteError && <p className="text-red-600">{inviteError}</p>}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={inviteLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {inviteLoading ? 'Inviting...' : 'Send Invite'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold">Invite Sent!</h3>
                <p className="break-all text-blue-600 underline">
                  <a href={inviteToken} target="_blank" rel="noopener noreferrer">
                    {inviteToken}
                  </a>
                </p>
                {copied && <p className="text-green-600 text-sm mt-1">Copied!</p>}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteToken || '');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3 py-1 mt-2 bg-green-600 text-white rounded"
                  >
                    Copy Token
                  </button>
                  <button
                    onClick={() => {
                      window.open(inviteToken || '', '_blank', 'noopener');
                    }}
                    className="px-3 py-1 mt-2 border rounded"
                  >
                    Open Link
                  </button>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      setInviteModalOpen(false);
                      setInviteToken(null);
                      setInviteEmail('');
                      setInviteName('');
                      setInviteRole('Viewer');
                      setCopied(false);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;
