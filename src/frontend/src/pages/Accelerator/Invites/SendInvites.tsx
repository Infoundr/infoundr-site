import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Invite {
  id: number;
  startupName: string;
  program: string;
  inviteCode: string;
  status: "Pending" | "Used" | "Expired";
  expiryDate: string;
}

const mockInvites: Invite[] = [
  {
    id: 1,
    startupName: "Quantum AI",
    program: "Tech Startup 2023",
    inviteCode: "https://accelerator.com/invite/qai-test",
    status: "Pending",
    expiryDate: "2023-06-30",
  },
  {
    id: 2,
    startupName: "BlockChain Solutions",
    program: "Fintech Accelerator",
    inviteCode: "BCS-FIN-2023-XYZ",
    status: "Used",
    expiryDate: "2023-05-15",
  },
  {
    id: 3,
    startupName: "MediTech Innovations",
    program: "Health Innovation Program",
    inviteCode: "https://accelerator.com/invite/medi-tech",
    status: "Expired",
    expiryDate: "2023-04-10",
  },
  {
    id: 4,
    startupName: "EcoSmart Energy",
    program: "Climate Tech Initiative",
    inviteCode: "ECO-CLIMATE-2023-ABC",
    status: "Pending",
    expiryDate: "2023-07-22",
  },
  {
    id: 5,
    startupName: "DataViz Analytics",
    program: "Tech startup 2023",
    inviteCode: "https://accelerator.com/invite/data-tech",
    status: "Pending",
    expiryDate: "2023-06-28",
  }
];

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Used: "bg-green-100 text-green-800",
  Expired: "bg-red-100 text-red-800",
};

  const SendInvites: React.FC = () => {
  const [startupName, setStartupName] = useState("");
  const [program, setProgram] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [inviteType, setInviteType] = useState("link");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const navigate = useNavigate(); // ✅ React Router Hook

  const handleGenerateInvite = () => {
    // Optionally validate form here
    navigate("/signup"); // ✅ Redirect to Startup Signup page
  };

  const filteredInvites = mockInvites.filter((invite) => {
    const matchesSearch = invite.startupName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || invite.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-2 text-gray-800">Send Invites</h1>
      <p className="text-gray-600 mb-6">
        Generate and manage invites for startups to join your accelerator programs
      </p>

      {/* Generate Invite Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-10">
        <h2 className="text-lg font-medium mb-4">Generate New Invite</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Startup Name</label>
            <input
              type="text"
              placeholder="Enter startup name"
              className="border px-4 py-2 rounded-md"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Invite Type</label>
            <div className="flex items-center gap-6 mt-1">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="link"
                  checked={inviteType === "link"}
                  onChange={() => setInviteType("link")}
                  className="mr-2"
                />
                Generate Invite Link
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="code"
                  checked={inviteType === "code"}
                  onChange={() => setInviteType("code")}
                  className="mr-2"
                />
                Generate Invite Code
              </label>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Program or Accelerator</label>
            <select
              className="border px-4 py-2 rounded-md"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
            >
              <option value="">Select a program</option>
              <option>Tech Startup 2023</option>
              <option>Fintech Accelerator</option>
              <option>Climate Tech Initiative</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Expiry Date</label>
            <input
              type="date"
              className="border px-4 py-2 rounded-md"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handleGenerateInvite} 
          className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
          >
            Generate Invite
          </button>

        </div>
      </div>

      {/* Invites Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-medium mb-4">Recent Invites</h2>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <input
            type="text"
            placeholder="Search invites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-md w-full md:w-1/2"
          />
          <select
            className="border px-4 py-2 rounded-md md:w-1/4"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Used">Used</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="py-2 px-4">Startup Name</th>
                <th className="py-2 px-4">Program</th>
                <th className="py-2 px-4">Invite Code/Link</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Expiry Date</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvites.map((invite) => (
                <tr key={invite.id} className="border-b">
                  <td className="py-2 px-4">{invite.startupName}</td>
                  <td className="py-2 px-4">{invite.program}</td>
                  <td className="py-2 px-4 text-purple-700 truncate max-w-[200px]">
                    {invite.inviteCode}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[invite.status]}`}
                    >
                      {invite.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">{invite.expiryDate}</td>
                  <td className="py-2 px-4 relative">
                    <div className="relative inline-block text-left">
                      <MoreVertical
                        className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
                        onClick={() =>
                          setOpenMenu((prev) => (prev === invite.id ? null : invite.id))
                        }
                      />
                      {openMenu === invite.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                            Copy
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                            View Info
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Centered Pagination */}
        <div className="mt-6 flex flex-col items-center text-sm">
          <div className="flex items-center gap-2 mb-2">
            <button className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-100">←</button>
            <button className="px-3 py-1 rounded border bg-purple-100 text-purple-700">1</button>
            <button className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-100">2</button>
            <button className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-100">3</button>
            <button className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-100">→</button>
          </div>
          <span className="text-gray-500">Showing 1–5 of 12 results</span>
        </div>
      </div>
    </div>
  );
};

export default SendInvites;
