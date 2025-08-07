import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithII, loginWithNFID } from '../../../services/auth';
import { linkStartupPrincipal } from '../../../services/startup-invite';
import { toast } from 'react-toastify';

const StartupAuth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'ii' | 'nfid' | null>(null);

  // Get startup name and founder name from URL params (set during invite acceptance)
  const startupName = searchParams.get('startup') || 'Your Startup';
  const founderName = searchParams.get('founder') || '';
  const startupEmail = searchParams.get('email') || '';

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        // You might want to add a check here to see if the user is already linked
        // For now, we'll proceed with the authentication flow
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    
    checkAuth();
  }, []);

  const handleAuth = async (method: 'ii' | 'nfid') => {
    setLoading(true);
    setAuthMethod(method);
    
    try {
      // Import AuthClient to get the principal
      const { AuthClient } = await import('@dfinity/auth-client');
      const authClient = await AuthClient.create();
      
      let actor;
      if (method === 'ii') {
        actor = await loginWithII();
      } else {
        actor = await loginWithNFID();
      }

      // Get the user's principal ID from the auth client
      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal();
      
      // Link the principal with the startup account
      if (startupEmail && founderName) {
        const linkResult = await linkStartupPrincipal(startupEmail, founderName);
        if (linkResult !== true) {
          console.warn('Failed to link startup principal:', linkResult);
          toast.warning('Authentication successful, but failed to link account. You may need to authenticate again later.');
        } else {
          toast.success('Account linked successfully! You can now access your dashboard.');
        }
      } else {
        toast.success('Authentication successful! You can now access your dashboard.');
      }
      
      // Store authentication info
      sessionStorage.setItem('user_principal', principal.toString());
      sessionStorage.setItem('is_authenticated', 'true');
      sessionStorage.setItem('startup_name', startupName);
      
      // Redirect to dashboard
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
          <h1 className="text-green-600 font-bold text-xl mb-2">Welcome to InFoundr!</h1>
          <p className="text-gray-600 text-sm mb-2">
            <strong>{startupName}</strong> has been successfully registered.
          </p>
          <p className="text-gray-600 text-sm">
            One last step - authenticate to log in next time!
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Why authenticate?</strong> This links your identity to your startup account, 
              so you can easily access your dashboard in the future without going through the invite process again.
            </p>
          </div>

          <button
            onClick={() => handleAuth('ii')}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md border-2 transition-colors ${
              loading && authMethod === 'ii'
                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white border-blue-500 text-blue-600 hover:bg-blue-50'
            }`}
          >
            {loading && authMethod === 'ii' ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
            {loading && authMethod === 'ii' ? 'Authenticating...' : 'Login with Internet Identity'}
          </button>

          <button
            onClick={() => handleAuth('nfid')}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md border-2 transition-colors ${
              loading && authMethod === 'nfid'
                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white border-purple-500 text-purple-600 hover:bg-purple-50'
            }`}
          >
            {loading && authMethod === 'nfid' ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            )}
            {loading && authMethod === 'nfid' ? 'Authenticating...' : 'Login with email'}
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
            By authenticating, you agree to link your identity with your startup account for future logins.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartupAuth; 