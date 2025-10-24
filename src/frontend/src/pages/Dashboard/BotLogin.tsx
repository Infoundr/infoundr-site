import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithII, loginWithNFID } from '../../services/auth';
import Button from '../../components/common/Button';
import { createActor } from '../../../../declarations/backend';
import { AuthClient } from '@dfinity/auth-client';

const WorkspaceLinking: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAuthOptions, setShowAuthOptions] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [platform, setPlatform] = useState<string | null>(null);

    const handleAuthAndLink = async (method: 'ii' | 'nfid') => {
        console.log('handleAuthAndLink called', method);
        try {
            setIsLoading(true);
            setError(null);

            console.log('About to call loginWithII or loginWithNFID');
            // Authenticate with chosen method
            const actor = method === 'ii' ? await loginWithII() : await loginWithNFID();
            const authClient = await AuthClient.create();
            const isAuthenticated = await authClient.isAuthenticated();
            console.log('AuthClient isAuthenticated after login:', isAuthenticated);
            if (!isAuthenticated) {
                setError('Authentication failed: AuthClient is not authenticated after II/NFID login.');
                setIsLoading(false);
                return;
            }
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal();

            // Link the authenticated identity with the platform using the token
            if (!token) {
                setError('No token found. Please request a new linking link.');
                setIsLoading(false);
                return;
            }
            const result = await actor.link_token_to_principal(token, principal);
            console.log('result from token linking', result);
            if (result && 'Ok' in result) {
                // Success: set session as authenticated and redirect
                sessionStorage.setItem('is_authenticated', 'true');
                sessionStorage.setItem('user_principal', principal.toText());
                sessionStorage.setItem('workspace_linking_success', 'true');
                sessionStorage.setItem('linked_platform', platform || 'unknown');
                window.location.replace('/dashboard/home');
            } else if (result && 'Err' in result) {
                setError(result.Err || 'Failed to link workspace. Please try again.');
            } else {
                setError('Failed to link workspace. Please try again.');
            }
        } catch (error) {
            console.error('Authentication/linking error:', error);
            setError('Failed to authenticate or link workspace. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const urlToken = searchParams.get('token');
        const urlPlatform = searchParams.get('platform');
        
        // Properly decode the token to handle base64 + characters
        const decodedToken = urlToken ? decodeURIComponent(urlToken) : null;
        
        setToken(decodedToken);
        setPlatform(urlPlatform);
        
        if (!decodedToken) {
            setError('No token provided');
            setIsLoading(false);
            return;
        }

        if (!urlPlatform) {
            setError('No platform specified');
            setIsLoading(false);
            return;
        }

        // For workspace linking, we don't need to validate the token upfront
        // The backend will validate it when we try to link
        console.log("Workspace linking initiated for platform:", urlPlatform);
        setShowAuthOptions(true);
        setIsLoading(false);
    }, [searchParams, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                    <h2 className="text-2xl font-bold mb-4 text-center">
                        Linking Workspace...
                    </h2>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                    </div>
                </div>
            </div>
        );
    }

    if (showAuthOptions) {
        console.log('showAuthOptions:', showAuthOptions);
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                    <h2 className="text-3xl font-bold mb-2 text-center">Link Your Workspace</h2>
                    <p className="text-gray-500 text-center mb-8">
                        Connect your {platform} workspace to your InFoundr account
                    </p>

                    <div className="space-y-4">
                        <Button
                            variant="primary"
                            className="w-full flex items-center justify-center gap-3 !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                            onClick={() => handleAuthAndLink('ii')}
                            disabled={isLoading}
                        >
                            <img src="/images/icp-logo.png" alt="Internet Identity" className="w-6 h-6" />
                            Continue with Internet Identity
                        </Button>

                        <Button
                            variant="primary"
                            className="w-full flex items-center justify-center gap-3 !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                            onClick={() => handleAuthAndLink('nfid')}
                            disabled={isLoading}
                        >
                             <img
                            src="/images/google.png" alt="Google Logo"
                            className="w-6 h-6"
                            />  
                            Continue with Google
                        </Button>
                    </div>

                    {error && (
                        <p className="mt-4 text-red-600 text-sm text-center">{error}</p>
                    )}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                    <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
                        Workspace Linking Error
                    </h2>
                    <p className="text-gray-600 text-center">{error}</p>
                </div>
            </div>
        );
    }

    return null;
};

export default WorkspaceLinking; 