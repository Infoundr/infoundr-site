import React, { useState, useEffect } from 'react';
import { MoreVertical, Copy, X, Check } from "lucide-react";
import { generateStartupInvite } from '../../../services/startup-invite';
import { InviteType, StartupInvite } from '../../../types/startup-invites';
import { getMyAccelerator } from '../../../services/accelerator';
import type { Accelerator } from '../../../types/accelerator';
import { toast } from 'react-toastify';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  invite: StartupInvite;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, invite }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = 'Link' in invite.invite_type ? 
      `https://infoundr.com/accelerator/invite/${invite.invite_code}` : 
      invite.invite_code;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Invite Generated Successfully</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Startup Name</p>
          <p className="font-medium">{invite.startup_name}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {'Link' in invite.invite_type ? 'Invite Link' : 'Invite Code'}
          </p>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-md">
            <p className="font-medium text-sm flex-1 break-all">
              {'Link' in invite.invite_type 
                ? `https://infoundr.com/accelerator/invite/${invite.invite_code}`
                : invite.invite_code
              }
            </p>
            <button
              onClick={handleCopy}
              className="text-purple-600 hover:text-purple-700 p-1"
              title="Copy to clipboard"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Program</p>
          <p className="font-medium">{invite.program_name}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Expiry Date</p>
          <p className="font-medium">
            {new Date(Number(invite.expiry) / 1000000).toLocaleDateString()}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

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

const SendInvites = () => {
  const [startupName, setStartupName] = useState('');
  const [inviteType, setInviteType] = useState<InviteType>({ Link: null });
  const [program, setProgram] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [accelerator, setAccelerator] = useState<Accelerator | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState<StartupInvite | null>(null);

  useEffect(() => {
    const fetchAccelerator = async () => {
      console.log('Fetching accelerator data...');
      const result = await getMyAccelerator();
      if (result) {
        console.log('Accelerator data fetched successfully:', result);
        setAccelerator(result);
      } else {
        console.error('No accelerator data returned');
      }
    };
    fetchAccelerator();
  }, []);

  const handleGenerateInvite = async () => {
    console.log('Starting invite generation process...');
    console.log('Current form values:', {
      startupName,
      program,
      inviteType,
      email,
      expiryDate,
      accelerator
    });

    if (!startupName || !program) {
      console.error('Validation failed: Missing required fields');
      toast.error('Please fill in all required fields');
      return;
    }

    if (!accelerator) {
      console.error('No accelerator data available');
      toast.error('No accelerator found. Please make sure you are logged in as an accelerator.');
      return;
    }

    setLoading(true);
    try {
      // Calculate expiry days from the selected date
      const expiryDays: [] | [bigint] = expiryDate ? 
        [BigInt(Math.floor((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))] : 
        [];
      
      console.log('Calculated expiry days:', expiryDays);

      const input = {
        accelerator_id: accelerator.id.toString(),
        program_name: program,
        invite_type: inviteType,
        startup_name: startupName,
        email: (email ? [email] : []) as [] | [string],
        expiry_days: (expiryDate
          ? [BigInt(Math.floor((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))]
          : []) as [] | [bigint],
      };

      console.log('Sending invite generation request with data:', input);

      const result = await generateStartupInvite(input);
      console.log('Received response from generateStartupInvite:', result);

      if (typeof result === 'string') {
        console.error('Error generating invite:', result);
        toast.error(result);
      } else {
        console.log('Invite generated successfully:', result);
        setGeneratedInvite(result);
        setShowInviteModal(true);
        // Reset form
        setStartupName('');
        setProgram('');
        setExpiryDate('');
        setEmail('');
      }
    } catch (error) {
      console.error('Exception during invite generation:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      toast.error('Failed to generate invite');
    } finally {
      setLoading(false);
      console.log('Invite generation process completed');
    }
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
            <label className="text-sm text-gray-700 mb-1">Email (Optional)</label>
            <input
              type="email"
              placeholder="Enter email address"
              className="border px-4 py-2 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Invite Type</label>
            <div className="flex items-center gap-6 mt-1">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="Link"
                  checked={'Link' in inviteType}
                  onChange={() => setInviteType({ Link: null })}
                  className="mr-2"
                />
                Generate Invite Link
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="Code"
                  checked={'Code' in inviteType}
                  onChange={() => setInviteType({ Code: null })}
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
              {accelerator && (
                <option value={accelerator.name}>{accelerator.name}</option>
              )}
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
          <button 
            onClick={handleGenerateInvite}
            disabled={loading} 
            className={`bg-purple-600 text-white px-6 py-2 rounded-md transition ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Invite'}
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

      {generatedInvite && (
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          invite={generatedInvite}
        />
      )}
    </div>
  );
};

export default SendInvites;
