import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { loginWithII, loginWithNFID, registerUser, isRegistered, checkIsAuthenticated } from '../../services/auth';

const Auth: React.FC = () => {
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
            
            console.log(`Starting ${method} authentication`);
            let authenticatedActor;
            if (method === 'ii') {
                authenticatedActor = await loginWithII();
            } else {
                authenticatedActor = await loginWithNFID();
            }
            
            if (!authenticatedActor) {
                throw new Error("Authentication failed");
            }

            // Update the global backend reference
            // @ts-ignore
            window.backend = authenticatedActor;

            // Check if user needs to register
            console.log("Checking if user is registered");
            const registered = await isRegistered();
            console.log("Registered:", registered);

            if (!registered) {
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
            
            console.log("User is registered, navigating to dashboard");
            const isAuth = await checkIsAuthenticated();
            console.log("Authentication verification:", isAuth);
            if (!isAuth) {
                console.log("Authentication verification failed");
                throw new Error("Authentication verification failed");
            }
            setIsLoading(false);
            navigate('/dashboard/home', { replace: true });
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
            console.log("Registration successful, navigating to dashboard");
            setIsLoading(false);
            navigate('/dashboard/home', { replace: true });
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
                        ? 'Login to access your dashboard' 
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

export default Auth; 