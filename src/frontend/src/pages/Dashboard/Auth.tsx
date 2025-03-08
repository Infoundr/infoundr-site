import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { loginWithII, loginWithNFID } from '../../services/auth';

const Auth: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (method: 'ii' | 'nfid') => {
        try {
            setIsLoading(true);
            setError(null);
            
            if (method === 'ii') {
                await loginWithII();
            } else {
                await loginWithNFID();
            }
            
            // After successful auth, redirect to dashboard home
            navigate('/dashboard/home');
        } catch (err) {
            setError('Authentication failed. Please try again.');
            console.error('Auth error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                <h2 className="text-3xl font-bold mb-8 text-center">Welcome Back</h2>
                
                {/* Internet Identity */}
                <Button
                    variant="primary"
                    className="w-full mb-4 flex items-center justify-center gap-3 !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                    onClick={() => handleAuth('ii')}
                    disabled={isLoading}
                >
                    <img src="/images/icp-logo.png" alt="Internet Identity" className="w-6 h-6" />
                    Continue with Internet Identity
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
                    Continue with Email
                </Button>

                {error && (
                    <p className="mt-4 text-red-600 text-sm text-center">{error}</p>
                )}
            </div>
        </div>
    );
};

export default Auth; 