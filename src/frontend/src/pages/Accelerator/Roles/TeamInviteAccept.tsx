import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { accept_invitation, decline_invitation } from "../../../services/team";

const TeamInviteAccept: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Placeholder — Replace with real invite details from backend if available
  const invitedBy = "Unknown";
  const role = "Team Member";
  const accelerator = "Unknown";

  const handleAccept = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await accept_invitation(token);
      navigate("/accelerator/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await decline_invitation(token);
      navigate("/accelerator/login");
    } catch (err: any) {
      setError(err.message || "Failed to decline invitation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-6">Team Invitation</h2>

        <div className="space-y-4 mb-6 text-left">
          <div>
            <p className="font-medium text-gray-700">Invited By</p>
            <p className="text-gray-500">{invitedBy}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Role</p>
            <p className="text-gray-500">{role}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Accelerator</p>
            <p className="text-gray-500">{accelerator}</p>
          </div>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {loading ? "Accepting..." : "Accept Invitation"}
        </button>
        <button
          onClick={handleDecline}
          disabled={loading}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Declining..." : "Decline"}
        </button>
      </div>
    </div>
  );
};

export default TeamInviteAccept;
