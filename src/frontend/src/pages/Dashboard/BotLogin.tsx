import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithBotToken, isOpenChatUserRegistered, loginWithII, loginWithNFID } from '../../services/auth';
import Button from '../../components/common/Button';
import { HttpAgent } from '@dfinity/agent';
import { createActor } from '../../../../declarations/backend';
import { AuthClient } from '@dfinity/auth-client';

const BotLogin: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAuthOptions, setShowAuthOptions] = useState(false);
    const [registrationData, setRegistrationData] = useState({
        name: '',
        openchatId: ''
    });

    const handleAuthMethod = async (method: 'ii' | 'nfid') => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Get the stored OpenChat ID from session
            const openchatId = sessionStorage.getItem('openchat_id');
            if (!openchatId) {
                setError('Session expired. Please request a new login link.');
                return;
            }

            // Authenticate with chosen method
            const actor = method === 'ii' ? await loginWithII() : await loginWithNFID();
            
            // Get the principal from the authenticated identity
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal();
            
            // Link the authenticated identity with OpenChat ID
            await actor.link_accounts(principal, openchatId);
            
            // Redirect to dashboard
            navigate('/dashboard/home', { replace: true });
        } catch (error) {
            console.error('Authentication error:', error);
            setError('Failed to authenticate. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = searchParams.get('token');
        console.log("Token from URL:", token);
        
        if (!token) {
            setError('No token provided');
            setIsLoading(false);
            return;
        }

        const validateToken = async () => {
            try {
                const validationResult = await loginWithBotToken(token);
                
                if (!validationResult.isValid || !validationResult.openchatId) {
                    setError('Invalid or expired token. Please request a new login link from the bot.');
                    setIsLoading(false);
                    return;
                }

                // Token is valid, show authentication options
                setShowAuthOptions(true);
            } catch (err) {
                console.error("Validation error:", err);
                setError('Failed to validate token. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [searchParams, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                    <h2 className="text-2xl font-bold mb-4 text-center">
                        Authenticating...
                    </h2>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                    </div>
                </div>
            </div>
        );
    }

    if (showAuthOptions) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                    <h2 className="text-3xl font-bold mb-2 text-center">Choose Login Method</h2>
                    <p className="text-gray-500 text-center mb-8">
                        Select how you'd like to access your dashboard
                    </p>

                    <div className="space-y-4">
                        <Button
                            variant="primary"
                            className="w-full flex items-center justify-center gap-3 !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                            onClick={() => handleAuthMethod('ii')}
                            disabled={isLoading}
                        >
                            <img src="/images/icp-logo.png" alt="Internet Identity" className="w-6 h-6" />
                            Continue with Internet Identity
                        </Button>

                        <Button
                            variant="primary"
                            className="w-full flex items-center justify-center gap-3 !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                            onClick={() => handleAuthMethod('nfid')}
                            disabled={isLoading}
                        >
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            Continue with NFID
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
                        Authentication Error
                    </h2>
                    <p className="text-gray-600 text-center">{error}</p>
                </div>
            </div>
        );
    }

    return null;
};

export default BotLogin; 