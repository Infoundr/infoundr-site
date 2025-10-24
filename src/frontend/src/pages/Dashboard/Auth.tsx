import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import { loginWithII, loginWithNFID, registerUser, isRegistered, checkIsAuthenticated } from '../../services/auth';
import { ActorSubclass } from "@dfinity/agent";
import type { _SERVICE } from "../../../../declarations/backend/backend.did.d.ts";
import { Principal } from '@dfinity/principal';
import { User, OpenChatUser, OpenChatUserResponse } from '../../types/user';
import { AuthClient } from '@dfinity/auth-client';
import { MOCK_USER } from '../../config';
import { useMockData } from '../../mocks/mockData';

const Auth: React.FC = () => {
    console.log("useMockData", useMockData);
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLogin, setIsLogin] = useState(true);
    const [registrationData, setRegistrationData] = useState({
        name: ''
    });
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    
    // Check if already authenticated and has payment intent on mount
    React.useEffect(() => {
        const checkAuthAndRedirect = async () => {
            // Check both sessionStorage and URL parameter
            let currentPaymentIntent = sessionStorage.getItem('payment_intent');
            const urlIntent = new URLSearchParams(location.search).get('intent');
            
            // If URL has intent=payment but sessionStorage doesn't, set it
            if (urlIntent === 'payment' && !currentPaymentIntent) {
                console.log('🔧 Setting payment intent from URL parameter');
                sessionStorage.setItem('payment_intent', 'pro_upgrade');
                sessionStorage.setItem('payment_intent_timestamp', Date.now().toString());
                currentPaymentIntent = 'pro_upgrade';
            }
            
            const isAuth = await checkIsAuthenticated();
            
            console.log('Auth page mounted - Auth status:', isAuth, 'Payment intent:', currentPaymentIntent, 'URL intent:', urlIntent);
            
            if (isAuth && currentPaymentIntent === 'pro_upgrade') {
                console.log('User is already authenticated with payment intent, redirecting to checkout...');
                sessionStorage.removeItem('payment_intent');
                sessionStorage.removeItem('payment_intent_timestamp');
                navigate('/payment/checkout', { replace: true });
            }
        };
        
        checkAuthAndRedirect();
    }, [navigate, location.search]);
    
    // Check for payment intent for UI display
    const paymentIntent = sessionStorage.getItem('payment_intent');
    const urlIntent = new URLSearchParams(location.search).get('intent');
    const isPaymentFlow = paymentIntent === 'pro_upgrade' || urlIntent === 'payment';

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
                
                // Check for payment intent first
                const paymentIntent = sessionStorage.getItem('payment_intent');
                if (paymentIntent === 'pro_upgrade') {
                    console.log('Payment intent detected (mock), redirecting to payment checkout...');
                    sessionStorage.removeItem('payment_intent');
                    sessionStorage.removeItem('payment_intent_timestamp');
                    navigate('/payment/checkout', { replace: true });
                    return;
                }
                
                // Check for redirect from location state
                const state = location.state as { from?: { pathname: string }, redirectTo?: string };
                const redirectPath = state?.redirectTo || '/dashboard/home';
                navigate(redirectPath, { replace: true });
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
                
                console.log("User is registered, navigating to dashboard");
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
                
                // Check for payment intent first
                const paymentIntent = sessionStorage.getItem('payment_intent');
                console.log('🔍 Checking payment intent after auth:', paymentIntent);
                
                if (paymentIntent === 'pro_upgrade') {
                    console.log('✅ Payment intent detected, redirecting to payment checkout...');
                    // Clear the payment intent
                    sessionStorage.removeItem('payment_intent');
                    sessionStorage.removeItem('payment_intent_timestamp');
                    console.log('🚀 Navigating to /payment/checkout');
                    navigate('/payment/checkout', { replace: true });
                    return;
                }
                
                // Check if there's a redirect URL from location state
                const state = location.state as { from?: { pathname: string }, redirectTo?: string };
                const redirectPath = state?.redirectTo || '/dashboard/home';
                
                console.log('ℹ️ No payment intent, redirecting to:', redirectPath);
                navigate(redirectPath, { replace: true });
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
            console.log("Registration successful");
            
            // ✅ CRITICAL FIX: Store user principal in sessionStorage after registration
            // This is needed for ProtectedRoute to recognize the user as authenticated
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();
            const userPrincipal = identity.getPrincipal();
            sessionStorage.setItem('user_principal', userPrincipal.toString());
            console.log("Stored user principal:", userPrincipal.toString());
            
            setIsLoading(false);
            
            // Check for payment intent first
            const paymentIntent = sessionStorage.getItem('payment_intent');
            if (paymentIntent === 'pro_upgrade') {
                console.log('💳 Payment intent detected after registration, redirecting to payment checkout...');
                sessionStorage.removeItem('payment_intent');
                sessionStorage.removeItem('payment_intent_timestamp');
                console.log('🚀 Navigating to /payment/checkout with stored principal');
                navigate('/payment/checkout', { replace: true });
                return;
            }
            
            // Check for redirect from location state
            const state = location.state as { from?: { pathname: string }, redirectTo?: string };
            const redirectPath = state?.redirectTo || '/dashboard/home';
            navigate(redirectPath, { replace: true });
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
                        <p className="mt- 4 text-red-600 text-sm text-center">{error}</p>
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
                    {isPaymentFlow 
                        ? 'Upgrade to Pro' 
                        : (isLogin ? 'Welcome Back' : 'Get Started')
                    }
                </h2>
                <p className="text-gray-500 text-center mb-8">
                    {isPaymentFlow
                        ? (isLogin 
                            ? 'Login to complete your Pro subscription' 
                            : 'Create an account to subscribe to Pro')
                        : (isLogin 
                            ? 'Login to access your dashboard' 
                            : 'Create an account to start using Infoundr')
                    }
                </p>
                
                {isPaymentFlow && (
                    <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm text-purple-800 font-medium">Upgrading to Pro</p>
                                <p className="text-xs text-purple-600 mt-1">
                                    You'll be redirected to complete your payment after authentication.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Internet Identity */}
                <Button
                    variant="primary"
                    className="w-full mb-4 flex items-center justify-center gap-3 !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                    onClick={() => handleAuth('ii')}
                    disabled={isLoading}
                >
                    <img src="/images/icp-logo.png" alt="Internet Identity" className="w-6 h-6" />
                    {isLogin ? 'Internet Identity' : 'Internet Identity'}
                </Button>

                {/* NFID */}
                <Button
                    variant="primary"
                    className="w-full flex items-center justify-center gap-3 !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                    onClick={() => handleAuth('nfid')}
                    disabled={isLoading}
                >
                    <div className="flex items-center gap-2">
                    <img src="/images/google.png" alt="Google" className="w-5 h-5" />
                    <span className="font-medium text-white text-sm">
                    Google
                    </span>
                    </div>
                    <span className="text-xs text-white opacity-80">(Secured by NFID)</span>
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