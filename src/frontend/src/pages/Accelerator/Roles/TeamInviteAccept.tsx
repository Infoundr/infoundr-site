/*import React, { useState } from "react";
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

export default TeamInviteAccept;*/

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTeamInviteByToken,
  accept_invitation,
  decline_invitation,
} from "../../../services/team";
import { Loader2, Gift } from "lucide-react";

type InviteData = {
  isValid: boolean;
  acceleratorName?: string; // now shown correctly
  memberName?: string;      // new autofilled field
  email?: string;
  role?: string;
};

const TeamInviteAccept: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // autofilled fields from invite
  const [acceleratorName, setAcceleratorName] = useState("");
  const [email, setEmail] = useState("");
  const [memberName, setMemberName] = useState("");

  // fetch invite (and autofill)
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const decoded = token ? decodeURIComponent(token) : "";
        if (!decoded) {
          setError("No invite token provided.");
          return;
        }

        const res: InviteData | string = await getTeamInviteByToken(decoded);

        if (typeof res === "string") {
          setError(res || "Invalid or expired invite.");
          return;
        }

        if (!res.isValid) {
          setError("Invalid or expired invite.");
          return;
        }

        // ✅ Autofill values from backend
        setAcceleratorName(res.acceleratorName ?? "");
        setEmail(res.email ?? "");
        setMemberName(res.memberName ?? "");
      } catch (e) {
        console.error(e);
        setError("Failed to fetch invite.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token]);

  // Accept → call backend, then go to the success/auth screen
  const handleAccept = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const decoded = decodeURIComponent(token);
      await accept_invitation(decoded);

      // Pass what the next screen needs
      navigate("/accelerator/auth/team", {
        state: {
          acceleratorName,
          email,
          memberName,
          token: decoded,
        },
        replace: true,
      });
    } catch (e) {
      console.error("Failed to accept invitation:", e);
      setError("Failed to accept invitation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Decline → call backend, show brief popup, then home
  const handleDecline = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const decoded = decodeURIComponent(token);
      await decline_invitation(decoded);

      // quick inline popup
      const modal = document.createElement("div");
      modal.className =
        "fixed inset-0 z-50 flex items-center justify-center bg-black/30";
      modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-sm text-center">
          <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <span class="text-green-600 text-lg">✓</span>
          </div>
          <p class="text-green-700 font-semibold">Invitation declined successfully</p>
          <p class="text-sm text-gray-500 mt-1">Redirecting to the homepage…</p>
        </div>
      `;
      document.body.appendChild(modal);

      setTimeout(() => {
        document.body.removeChild(modal);
        navigate("/", { replace: true });
      }, 1300);
    } catch (e) {
      console.error("Failed to decline invitation:", e);
      setError("Failed to decline invitation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen px-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 text-center">
          <p className="text-red-600 font-semibold mb-1">Invite error</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 w-full py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-purple-100 rounded-full p-4">
            <Gift className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        {/* Title + subtitle */}
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          You&apos;re Invited!
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1">
          Complete your registration to join the accelerator program
        </p>

        {/* Valid banner */}
        <div className="mt-5 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm text-center">
          <div className="flex items-center justify-center gap-2">
            <span>✔</span>
            <span className="font-medium">Valid Invitation</span>
          </div>
          <p className="text-green-700 mt-1 text-xs">
            Your invite code has been verified
          </p>
        </div>

        {/* Form fields */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Accelerator Name
            </label>
            <input
              type="text"
              value={acceleratorName}
              readOnly
              className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-100 shadow-sm px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Member Name
            </label>
            <input
              type="text"
              value={memberName}
              readOnly
              className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-100 shadow-sm px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-100 shadow-sm px-3 py-2"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleDecline}
            disabled={submitting}
            className="w-1/2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={submitting}
            className="w-1/2 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing…
              </span>
            ) : (
              "Accept Invite"
            )}
          </button>
        </div>

        {/* Terms */}
        <p className="text-[11px] text-gray-400 text-center mt-4">
          By joining, you agree to the accelerator&apos;s terms and conditions.
        </p>
      </div>
    </div>
  );
};

export default TeamInviteAccept;


