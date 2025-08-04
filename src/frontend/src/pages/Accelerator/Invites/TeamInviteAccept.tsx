import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TeamInviteAccept: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<any>(null);

  console.log('TeamInviteAccept component rendered with token:', token);

  useEffect(() => {
    const fetchInviteData = async () => {
      try {
        setLoading(true);
        console.log('Fetching invite data for token:', token);
        
        // Decode the token if it's URL encoded
        const decodedToken = token ? decodeURIComponent(token) : '';
        console.log('Decoded token:', decodedToken);
        
        // TODO: Call backend service to validate and get invite data
        // const invite = await validateTeamInvite(decodedToken);
        // setInviteData(invite);
        
        // For now, just simulate loading and show a mock response
        setTimeout(() => {
          setLoading(false);
          setInviteData({
            invitedBy: 'Admin User',
            role: 'Team Member',
            acceleratorName: 'InFoundr Accelerator',
            email: 'invited@example.com'
          });
        }, 1000);
      } catch (err) {
        console.error('Error fetching invite data:', err);
        setError('Failed to load invite');
        setLoading(false);
      }
    };

    if (token) {
      fetchInviteData();
    } else {
      setError('No invite token provided');
      setLoading(false);
    }
  }, [token]);

  const handleAcceptInvite = async () => {
    // TODO: Implement invite acceptance logic
    console.log('Accepting invite with token:', token);
  };

  const handleDeclineInvite = () => {
    // TODO: Implement invite decline logic
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Invalid Invite</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Team Invitation</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invited By
            </label>
            <p className="text-gray-900">{inviteData?.invitedBy || 'Unknown'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <p className="text-gray-900">{inviteData?.role || 'Team Member'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accelerator
            </label>
            <p className="text-gray-900">{inviteData?.acceleratorName || 'Unknown'}</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAcceptInvite}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Accept Invitation
          </button>
          
          <button
            onClick={handleDeclineInvite}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamInviteAccept; 