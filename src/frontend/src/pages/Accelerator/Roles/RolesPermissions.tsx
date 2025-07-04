import React, { useState } from "react";

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
      {/* Page Header */}
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

      {/* Team Members Header */}
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

      {/* Members Table */}
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

      {/* Permissions Matrix */}
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

      {/* Invite Modal */}
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

export default RolesPermissions;
