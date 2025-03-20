import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithBotToken, isOpenChatUserRegistered, canisterID } from '../../services/auth';
import Button from '../../components/common/Button';
import { HttpAgent } from '@dfinity/agent';
import { createActor } from '../../../../declarations/backend';

const BotLogin: React.FC = () => {
    console.log("BotLogin component rendered");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [registrationData, setRegistrationData] = useState({
        name: '',
        openchatId: ''
    });
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);

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
                setIsLoading(true);
                setError(null);
                
                const validationResult = await loginWithBotToken(token);
                console.log("Validation result:", validationResult);

                if (!validationResult.isValid || !validationResult.openchatId) {
                    setError('Invalid or expired token. Please request a new login link from the bot.');
                    setIsLoading(false);
                    return;
                }

                try {
                    const isRegistered = await isOpenChatUserRegistered(validationResult.openchatId);
                    console.log("Registration check result:", isRegistered);
                    
                    if (!isRegistered) {
                        setRegistrationData(prev => ({
                            ...prev,
                            openchatId: validationResult.openchatId!
                        }));
                        setShowRegistrationForm(true);
                    } else {
                        // Create a session or store necessary data
                        sessionStorage.setItem('openchat_id', validationResult.openchatId);
                        navigate('/dashboard/home', { replace: true });
                    }
                } catch (regError) {
                    console.error("Registration check error:", regError);
                    setError('Error verifying registration status. Please try again.');
                }
            } catch (err) {
                console.error("Validation process error:", err);
                setError('Failed to validate access token. Please try again or request a new link.');
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [searchParams, navigate]);

    const handleRegistration = async () => {
        try {
            if (!registrationData.name.trim()) {
                setError('Please enter your name');
                return;
            }
            
            setIsLoading(true);
            const agent = new HttpAgent({});
            
            if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
                await agent.fetchRootKey();
            }
            
            const actor = createActor(canisterID, { agent });
            
            // Register the user with their OpenChat ID
            await actor.register_openchat_user(
                registrationData.name,
                registrationData.openchatId
            );
            
            // Redirect to dashboard after successful registration
            navigate('/dashboard/home', { replace: true });
        } catch (error) {
            console.error('Registration error:', error);
            setError('Failed to complete registration. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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

    if (showRegistrationForm) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                    <h2 className="text-3xl font-bold mb-2 text-center">Complete Your Profile</h2>
                    <p className="text-gray-500 text-center mb-8">
                        Please provide your name to complete your registration
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={registrationData.name}
                                onChange={(e) => setRegistrationData(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                            />
                        </div>
                        <Button
                            variant="primary"
                            className="w-full !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                            onClick={handleRegistration}
                            disabled={isLoading}
                        >
                            Complete Registration
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