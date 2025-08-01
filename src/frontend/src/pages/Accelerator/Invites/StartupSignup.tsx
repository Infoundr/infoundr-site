import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { acceptStartupInvite, validateInviteCode } from '../../../services/startup-invite';
import type { StartupInvite } from '../../../types/startup-invites';

const StartupInviteAccept: React.FC = () => {
  const { inviteCode = "" } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    startupName: "",
    founderName: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteValidated, setInviteValidated] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(true);

  // Fetch invite information on mount
  useEffect(() => {
    const fetchInviteInfo = async () => {
      console.log('=== StartupInviteAccept: Component mounted ===');
      console.log('Invite code from URL:', inviteCode);
      
      if (!inviteCode) {
        console.error('No invite code found in URL');
        setError('Invalid invite link.');
        setLoadingInvite(false);
        return;
      }
      
      try {
        console.log('Validating invite code:', inviteCode);
        const validationResult = await validateInviteCode(inviteCode);
        
        if (typeof validationResult === 'string') {
          console.error('Invite validation failed:', validationResult);
          setError(validationResult);
          setLoadingInvite(false);
          return;
        }
        
        if (validationResult.isValid) {
          console.log('Invite code validated successfully');
          setInviteValidated(true);
          
          // Pre-fill startup name if available
          if (validationResult.startupName) {
            setForm(prev => ({
              ...prev,
              startupName: validationResult.startupName || ""
            }));
          }
        } else {
          setError('Invalid or expired invite code.');
        }
        
        setLoadingInvite(false);
      } catch (err) {
        console.error('Error validating invite information:', err);
        setError('Failed to load invite information.');
        setLoadingInvite(false);
      }
    };
    
    fetchInviteInfo();
  }, [inviteCode]);

  if (loadingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== StartupInviteAccept: Form submission started ===');
    console.log('Form data:', form);
    console.log('Invite code:', inviteCode);
    
    setError(null);
    setLoading(true);
    if (!inviteCode) {
      console.error('No invite code available for submission');
      setError('Invalid invite link.');
      setLoading(false);
      return;
    }
    try {
      const input = {
        invite_code: inviteCode,
        startup_name: form.startupName,
        email: form.email,
        founder_name: form.founderName,
      };
      console.log('Calling acceptStartupInvite with input:', input);
      const result = await acceptStartupInvite(input);
      console.log('acceptStartupInvite result:', result);
      console.log('Result type:', typeof result);
      console.log('Result === true:', result === true);
      
      if (result === true) {
        console.log('Invite acceptance successful, redirecting to dashboard');
        // Set a flag to indicate successful startup registration
        sessionStorage.setItem('startup_registration_success', 'true');
        navigate('/dashboard/home');
      } else {
        console.error('Invite acceptance failed:', result);
        const errorMessage = typeof result === 'string' ? result : 'Failed to accept invite.';
        console.error('Setting error message:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Exception during invite acceptance:', err);
      setError('Failed to accept invite.');
    } finally {
      setLoading(false);
      console.log('=== StartupInviteAccept: Form submission completed ===');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h1 className="text-purple-600 font-bold text-xl mb-2">You're Invited!</h1>
          <p className="text-gray-600 text-sm">Complete your registration to join the accelerator program</p>
        </div>
        
        {inviteValidated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <p className="text-green-800 text-sm font-medium">✓ Valid Invitation</p>
            <p className="text-green-600 text-xs mt-1">Your invite code has been verified</p>
          </div>
        )}
        
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <p className="text-xs text-gray-500 mb-1">Invite Code</p>
          <p className="font-mono text-xs text-gray-700 break-all">{inviteCode}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Startup Name</label>
            <input
              type="text"
              name="startupName"
              placeholder="Your startup name"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={form.startupName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Founder Name</label>
            <input
              type="text"
              name="founderName"
              placeholder="Your full name"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={form.founderName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2.5 rounded-md hover:bg-purple-700 transition-colors font-medium"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining Program...
              </span>
            ) : 'Join Accelerator Program'}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 mt-4">
          By joining, you agree to the accelerator's terms and conditions
        </p>
      </div>
    </div>
  );
};

export default StartupInviteAccept;
