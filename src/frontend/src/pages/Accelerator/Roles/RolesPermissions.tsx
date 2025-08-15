/*import React, { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Program Manager" | "Viewer";
  status: "Active" | "Pending";
  avatarUrl: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Record<string, boolean>;
}

const permissionsList = [
  "Manage Users",
  "Create Programs",
  "Assign Roles",
  "View Reports",
  "Edit Content",
];

const initialUsers: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    avatarUrl: "https://i.pravatar.cc/150?img=35",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Program Manager",
    status: "Active",
    avatarUrl: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: 3,
    name: "Cathy Lee",
    email: "cathy@example.com",
    role: "Viewer",
    status: "Active",
    avatarUrl: "https://i.pravatar.cc/40?img=3",
  },
  {
    id: 4,
    name: "Pending invitation",
    email: "danbrown@example.com",
    role: "Program Manager",
    status: "Pending",
    avatarUrl: "https://cdn-icons-png.flaticon.com/512/561/561127.png",
  },
];

const initialRoles: Role[] = [
  {
    id: 1,
    name: "Admin",
    permissions: {
      "Manage Users": true,
      "Create Programs": true,
      "Assign Roles": true,
      "View Reports": true,
      "Edit Content": true,
    },
  },
  {
    id: 2,
    name: "Program Manager",
    permissions: {
      "Manage Users": false,
      "Create Programs": true,
      "Assign Roles": false,
      "View Reports": true,
      "Edit Content": true,
    },
  },
  {
    id: 3,
    name: "Viewer",
    permissions: {
      "Manage Users": false,
      "Create Programs": false,
      "Assign Roles": false,
      "View Reports": true,
      "Edit Content": false,
    },
  },
];

const RolesPermissions: React.FC = () => {
  const [users] = useState<User[]>(initialUsers);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProgram, setProgram] = useState("Y Combinator");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (user: User) => {
    alert(`Editing ${user.name}`);
    setDropdownOpen(null);
  };

  const handleRemove = (user: User) => {
    alert(`Removing ${user.name}`);
    setDropdownOpen(null);
  };

  const handleResendInvite = (user: User) => {
    alert(`Resent invite to ${user.email}`);
    setDropdownOpen(null);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {// Page Header }
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Roles & Permissions</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedProgram}
            onChange={(e) => setProgram(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white text-gray-700"
          >
            <option>Y Combinator</option>
            <option>Techstars</option>
          </select>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={() => setInviteModalOpen(true)}
          >
            Invite a Team Member
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-6">Manage team access and control permissions</p>

      {/* Team Members Header /}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Team Members</h2>
        <input
          type="text"
          placeholder="Search team member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Members Table *}
      <table className="w-full bg-white shadow rounded-md overflow-hidden mb-10">
        <thead className="bg-gray-100">
          <tr>
            {["Name", "Email", "Role", "Status", "Actions"].map((col) => (
              <th key={col} className="text-left text-sm font-medium text-gray-600 px-6 py-3">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id} className="border-b last:border-none">
              <td className="px-6 py-4 flex items-center gap-3">
                <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                <span className="text-gray-800">{u.name}</span>
              </td>
              <td className="px-6 py-4 text-gray-600">{u.email}</td>
              <td className="px-6 py-4 text-gray-800 font-medium">{u.role}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 text-sm rounded-full ${
                    u.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : u.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {u.status}
                </span>
              </td>
              <td className="px-6 py-4 relative">
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === u.id ? null : u.id)}
                    className="px-2 py-1 hover:bg-gray-100 rounded-full text-lg font-bold"
                  >
                    ⋯
                  </button>
                  {dropdownOpen === u.id && (
                    <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1 text-sm text-gray-700">
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => handleEdit(u)}
                        >
                          Edit
                        </button>
                        {u.status === "Pending" && (
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => handleResendInvite(u)}
                          >
                            Resend Invite
                          </button>
                        )}
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                          onClick={() => handleRemove(u)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Permissions Matrix /}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Permissions Matrix</h2>
        <p className="text-sm text-gray-600 mb-4">
          Define what each role can do within the platform
        </p>

        <div className="bg-white rounded shadow p-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm text-gray-600">Permission</th>
                {roles.map((r) => (
                  <th key={r.id} className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionsList.map((perm, i) => (
                <tr key={perm} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-4 py-3 text-sm text-gray-700">{perm}</td>
                  {roles.map((r) => (
                    <td key={`${r.id}-${perm}`} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={r.permissions[perm]}
                        onChange={() => {
                          setRoles((prev) =>
                            prev.map((role) =>
                              role.id === r.id
                                ? {
                                    ...role,
                                    permissions: {
                                      ...role.permissions,
                                      [perm]: !role.permissions[perm],
                                    },
                                  }
                                : role
                            )
                          );
                        }}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal *}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Invite a Team Member</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setInviteModalOpen(false);
              }}
            >
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-blue-400"
              />
              <select className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-blue-400">
                {roles.map((r) => (
                  <option key={r.id}>{r.name}</option>
                ))}
              </select>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  type="submit"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;*/

/*import React, { useEffect, useState } from 'react';
import { getMyAccelerator } from '../../../services/accelerator';
import {
  inviteTeamMember,
  listTeamMembers,
  updateTeamMemberRole,
  removeTeamMember
} from '../../../services/team';
import type { TeamMember, Role, RoleUnion } from '../../../types/team';
import type {
  TeamMemberInviteWithId,
  UpdateTeamMemberRole,
  RemoveTeamMember
} from '../../../types/team';

const RolesPermissions: React.FC = () => {
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header *}
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

      {/* Team Members Table *}
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

      {/* Invite Modal *}
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

export default RolesPermissions;*/
import React, { useEffect, useState } from 'react';
import { getMyAccelerator } from '../../../services/accelerator';
import {
  inviteTeamMember,
  listTeamMembers,
  updateTeamMemberRole,
  removeTeamMember
} from '../../../services/team';
import type { TeamMember, Role, RoleUnion } from '../../../types/team';
import type {
  TeamMemberInviteWithId,
  UpdateTeamMemberRole,
  RemoveTeamMember
} from '../../../types/team';

const RolesPermissions: React.FC = () => {
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
  const [inviteName, setInviteName] = useState('');
  const [copied, setCopied] = useState(false);

  const roleOptions: RoleUnion[] = ['Viewer', 'ProgramManager', 'Admin', 'SuperAdmin'];
  const roleToVariant = (r: RoleUnion): Role => ({ [r]: null } as Role);
  const canEdit = ['SuperAdmin', 'Admin'].includes(currentUserRole);

  // Fetch accelerator + team members
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
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setInviteError('Please enter a valid email address');
      return;
    }

    setInviteLoading(true);
    setInviteToken(null);
    setInviteError(null);

    const payload: TeamMemberInviteWithId = {
      email: inviteEmail.trim(),
      role: roleToVariant(inviteRole),
      name: inviteName.trim()
    };

    const result = await inviteTeamMember(payload);
    setInviteLoading(false);

    if (result) {
      const inviteUrl = `${window.location.origin}/accelerator/team-invite/${encodeURIComponent(result)}`;
      setInviteToken(inviteUrl);

      const updated = await listTeamMembers();
      if (updated) setTeamMembers(updated);
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
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
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
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg space-y-4">
            {!inviteToken ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900">Invite a Team Member</h3>

                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="Enter team member's email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                />

                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                />

                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as RoleUnion)}
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                >
                  {roleOptions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                {inviteError && <p className="text-red-600">{inviteError}</p>}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={inviteLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {inviteLoading ? 'Inviting...' : 'Send Invite'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900">
                  Invite Generated Successfully!
                </h3>

                <div>
                  <p className="text-sm text-gray-500">Startup Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {inviteName || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Invite Link</p>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg p-2">
                    <span className="break-all text-gray-700 text-sm flex-1">
                      {inviteToken}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inviteToken || '');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-2 text-purple-600 hover:text-purple-800"
                    >
                      📋
                    </button>
                  </div>
                  {copied && <p className="text-green-600 text-xs mt-1">Copied!</p>}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Program</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {acceleratorName || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')}
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setInviteModalOpen(false);
                      setInviteToken(null);
                      setInviteEmail('');
                      setInviteName('');
                      setInviteRole('Viewer');
                      setCopied(false);
                    }}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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

