import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loginWithII, loginWithNFID } from '../../../services/auth';
import { linkStartupPrincipal } from '../../../services/startup-invite';
import { getTeamInviteByToken } from '../../../services/team'; 
import { toast } from 'react-toastify';

const WelcomeAuth: React.FC = () => {
  const navigate = useNavigate();
  const { inviteCode } = useParams<{ inviteCode: string }>();

  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'ii' | 'nfid' | null>(null);

  // New state for invite details
  const [acceleratorName, setAcceleratorName] = useState<string>('');
  const [memberName, setMemberName] = useState<string>('');
  const [memberEmail, setMemberEmail] = useState<string>('');

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        if (!inviteCode) return;

        const invite = await getTeamInviteByToken(inviteCode);

        if (typeof invite === 'string' || !invite.isValid) {
          toast.error('Invalid or expired invite link');
          navigate('/');
          return;
        }

        setAcceleratorName(invite.acceleratorName ?? 'Accelerator');
        setMemberName(invite.memberName ?? 'Member');
        setMemberEmail(invite.email ?? '');
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch invite details');
        navigate('/');
      }
    };

    fetchInvite();
  }, [inviteCode, navigate]);

  const handleAuth = async (method: 'ii' | 'nfid') => {
    setLoading(true);
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
      if (memberEmail && memberName) {
        const linkResult = await linkStartupPrincipal(memberEmail, memberName);
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

      navigate('/dashboard/home');
    } catch (error) {
      console.error('Authentication failed:', error);
      toast.error('Authentication failed. Please try again.');
      setAuthMethod(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-green-600 font-bold text-xl mb-2">Invitation Accepted 🎉</h1>
          <p className="text-gray-600 text-sm mb-2">
            <strong>{memberName}</strong> You’ve successfully joined <strong>{acceleratorName}</strong>
          </p>
          <p className="text-gray-600 text-sm">
            One last step – authenticate to complete your setup!
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
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md border-2 transition-colors ${
              loading && authMethod === 'ii'
                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white border-blue-500 text-blue-600 hover:bg-blue-50'
            }`}
          >
            {loading && authMethod === 'ii' ? 'Authenticating...' : 'Login with Internet Identity'}
          </button>

          {/* NFID (email) */}
          <button
            onClick={() => handleAuth('nfid')}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md border-2 transition-colors ${
              loading && authMethod === 'nfid'
                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white border-purple-500 text-purple-600 hover:bg-purple-50'
            }`}
          >
            {loading && authMethod === 'nfid' ? 'Authenticating...' : 'Login with Email'}
          </button>

          <div className="mt-6">
            <button
              onClick={() => navigate('/dashboard/home')}
              className="text-gray-500 text-sm underline hover:text-gray-700"
            >
              Skip for now (you can authenticate later)
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
};
  
export default WelcomeAuth;

