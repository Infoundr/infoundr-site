import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTeamInviteByToken,
  accept_invitation,
  decline_invitation,
} from "../../../services/team";
import { loginWithII, loginWithNFID } from "../../../services/auth";
import { linkStartupPrincipal } from "../../../services/startup-invite";
import { Loader2, Gift } from "lucide-react";
import { toast } from "react-toastify";

type InviteData = {
  isValid: boolean;
  acceleratorName?: string; 
  memberName?: string;      
  email?: string;
  role?: string;
};

const TeamInviteAccept: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMethod, setAuthMethod] = useState<'ii' | 'nfid' | null>(null);

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

  // Handle authentication
  const handleAuth = async (method: 'ii' | 'nfid') => {
    setSubmitting(true);
    setAuthMethod(method);

    try {
      const { AuthClient } = await import('@dfinity/auth-client');
      const authClient = await AuthClient.create();

      let actor;
      if (method === 'ii') {
        actor = await loginWithII();
      } else {
        actor = await loginWithNFID();
      }

      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal();

      // Link identity with member account
      if (email && memberName) {
        const linkResult = await linkStartupPrincipal(email, memberName);
        if (linkResult !== true) {
          toast.warning('Authenticated, but failed to link account.');
        } else {
          toast.success('Welcome! Your account has been linked successfully.');
        }
      } else {
        toast.success('Welcome! Authentication successful.');
      }

      // Persist session info
      sessionStorage.setItem('user_principal', principal.toString());
      sessionStorage.setItem('is_authenticated', 'true');
      sessionStorage.setItem('member_name', memberName);

      // Now accept the invitation with authenticated actor
      if (token) {
        const decoded = decodeURIComponent(token);
        await accept_invitation(decoded);
        toast.success('Invitation accepted successfully!');
        navigate('/accelerator/dashboard');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      toast.error('Authentication failed. Please try again.');
      setAuthMethod(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Accept → show authentication options first
  const handleAccept = () => {
    setShowAuth(true);
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

  // Show authentication screen
  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-green-600 font-bold text-xl mb-2">Complete Your Setup 🎉</h1>
            <p className="text-gray-600 text-sm mb-2">
              <strong>{memberName}</strong> You're joining <strong>{acceleratorName}</strong>
            </p>
            <p className="text-gray-600 text-sm">
              Authenticate to complete your registration!
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Why authenticate?</strong> This links your identity to your startup account, 
                so you can log in easily in the future without needing another invite.
              </p>
            </div>

            {/* Internet Identity */}
            <button
              onClick={() => handleAuth('ii')}
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md border-2 transition-colors ${
                submitting && authMethod === 'ii'
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white border-blue-500 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {submitting && authMethod === 'ii' ? 'Authenticating...' : 'Login with Internet Identity'}
            </button>

            {/* NFID (email) */}
            <button
              onClick={() => handleAuth('nfid')}
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md border-2 transition-colors ${
                submitting && authMethod === 'nfid'
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white border-purple-500 text-purple-600 hover:bg-purple-50'
              }`}
            >
              {submitting && authMethod === 'nfid' ? 'Authenticating...' : 'Login with Email'}
            </button>

            <div className="mt-6">
              <button
                onClick={() => setShowAuth(false)}
                className="text-gray-500 text-sm underline hover:text-gray-700"
              >
                Back to invite details
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              By authenticating, you agree to link your identity with your team account for future logins.
            </p>
          </div>
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
            Accept Invite
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


