import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { loginWithII, loginWithNFID, registerUser, isRegistered, checkIsAuthenticated } from '../../services/auth';
import { ActorSubclass } from "@dfinity/agent";
import type { _SERVICE } from "../../../../declarations/backend/backend.did.d.ts";
import { Principal } from '@dfinity/principal';
import { User, OpenChatUser, OpenChatUserResponse } from '../../types/user';
import { AuthClient } from '@dfinity/auth-client';
import { MOCK_USER } from '../../config';
import { useMockData } from '../../mocks/mockData';

const Login: React.FC = () => {
    console.log("useMockData", useMockData);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLogin, setIsLogin] = useState(true);
    const [registrationData, setRegistrationData] = useState({
        name: ''
    });
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);

    const handleAuth = async (method: 'ii' | 'nfid') => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Use mock authentication in development mode
            if (useMockData) {
                console.log("Using mock authentication");
                sessionStorage.setItem('user_principal', MOCK_USER.principal);
                sessionStorage.setItem('openchat_id', MOCK_USER.openchat_id);
                setIsLoading(false);
                navigate('/accelerator/dashboard', { replace: true });
                return;
            }
            
            console.log(`Starting ${method} authentication`);
            let actor: ActorSubclass<_SERVICE>;
            if (method === 'ii') {
                actor = await loginWithII();
            } else {
                actor = await loginWithNFID();
            }
            
            if (!actor) {
                throw new Error("Authentication failed");
            }

            // Get the authenticated identity's principal directly
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();
            const userPrincipal = identity.getPrincipal();
            console.log("User Principal:", userPrincipal.toString());

            // Check both regular registration and OpenChat registration
            console.log("Checking user registration status");
            try {
                const [isRegularUser, openchatUser] = await Promise.all([
                    actor.is_registered(),
                    actor.get_openchat_user_by_principal(userPrincipal)
                ]);
                
                console.log("Registration check results:", { isRegularUser, openchatUser });

                if (!isRegularUser && (!openchatUser || openchatUser.length === 0)) {
                    if (isLogin) {
                        setError('Account not found. Please create an account first.');
                        setIsLoading(false);
                        return;
                    } else {
                        console.log("User is not registered, showing registration form");
                        setShowRegistrationForm(true);
                        return;
                    }
                }
                
                console.log("User is registered, navigating to accelerator dashboard");
                const isAuth = await actor.check_auth();
                console.log("Authentication verification:", isAuth);
                
                if (!isAuth) {
                    console.log("Authentication verification failed");
                    throw new Error("Authentication verification failed");
                }
                
                // If user has an OpenChat account, store the ID
                if (openchatUser && openchatUser.length > 0 && openchatUser[0]?.openchat_id) {
                    sessionStorage.setItem('openchat_id', openchatUser[0].openchat_id);
                }
                
                // Store user principal for future use
                sessionStorage.setItem('user_principal', userPrincipal.toString());
                
                setIsLoading(false);
                navigate('/accelerator/dashboard', { replace: true });
            } catch (err) {
                console.error("Registration check error:", err);
                throw new Error("Failed to verify registration status");
            }
        } catch (err) {
            setError('Authentication failed. Please try again.');
            console.error('Auth error:', err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRegistration = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            console.log("Starting registration with name:", registrationData.name);
            await registerUser(registrationData.name);
            console.log("Registration successful, navigating to accelerator dashboard");
            setIsLoading(false);
            navigate('/accelerator/dashboard', { replace: true });
            return;
        } catch (err) {
            console.log("Registration failed:", err);
            setError('Registration failed. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                {/* Home Button */}
                <div className="flex justify-end mb-4">
                    <Button
                        variant="secondary"
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => navigate('/')}
                    >
                        <div className="flex items-center gap-2">
                            <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                                />
                            </svg>
                            Home
                        </div>
                    </Button>
                </div>

                {/* Toggle Buttons */}
                <div className="flex rounded-lg bg-gray-100 p-1 mb-8">
                    <button
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                            isLogin 
                                ? 'bg-white shadow-sm text-[#4C1D95]' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                            !isLogin 
                                ? 'bg-white shadow-sm text-[#4C1D95]' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setIsLogin(false)}
                    >
                        Create Account
                    </button>
                </div>

                <h2 className="text-3xl font-bold mb-2 text-center">
                    {isLogin ? 'Welcome Back' : 'Get Started'}
                </h2>
                <p className="text-gray-500 text-center mb-8">
                    {isLogin 
                        ? 'Login to access your accelerator dashboard' 
                        : 'Create an account to start using Infoundr'
                    }
                </p>
                
                {/* Internet Identity */}
                <Button
                    variant="primary"
                    className="w-full mb-4 flex items-center justify-center gap-3 !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                    onClick={() => handleAuth('ii')}
                    disabled={isLoading}
                >
                    <img src="/images/icp-logo.png" alt="Internet Identity" className="w-6 h-6" />
                    {isLogin ? 'Login with Internet Identity' : 'Sign up with Internet Identity'}
                </Button>

                {/* NFID */}
                <Button
                    variant="primary"
                    className="w-full flex items-center justify-center gap-3 !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                    onClick={() => handleAuth('nfid')}
                    disabled={isLoading}
                >
                    <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                    {isLogin ? 'Login with email' : 'Sign up with email'}
                </Button>

                {error && (
                    <p className="mt-4 text-red-600 text-sm text-center">{error}</p>
                )}

                <p className="mt-8 text-center text-sm text-gray-500">
                    {isLogin ? (
                        <>
                            Don't have an account?{' '}
                            <button 
                                onClick={() => setIsLogin(false)}
                                className="text-[#8B5CF6] hover:text-[#7C3AED] font-medium"
                            >
                                Create one
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button 
                                onClick={() => setIsLogin(true)}
                                className="text-[#8B5CF6] hover:text-[#7C3AED] font-medium"
                            >
                                Login
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default Login; 