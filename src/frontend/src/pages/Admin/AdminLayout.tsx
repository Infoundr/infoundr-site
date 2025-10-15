import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import { logout, checkIsAuthenticated, createAuthenticatedActor, loginWithII, loginWithNFID } from '../../services/auth';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../declarations/backend/backend.did.d';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../../../../declarations/backend';
import { HttpAgent } from '@dfinity/agent';
import { CANISTER_ID } from '../../config';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [actor, setActor] = useState<ActorSubclass<_SERVICE> | null>(null);
    const [currentPrincipal, setCurrentPrincipal] = useState<string>("");

    useEffect(() => {
        initializeActor();
        // TEST: Call get_admins and log the result
        (async () => {
            try {
                const agent = new HttpAgent({});
                if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
                    await agent.fetchRootKey();
                }
                const actor = createActor(CANISTER_ID, { agent });
                const admins = await actor.get_admins();
                console.log('TEST get_admins result:', admins);
            } catch (err) {
                console.error('TEST get_admins error:', err);
            }
        })();
    }, []);

    const initializeActor = async () => {
        try {
            // Check if user is already authenticated
            const auth = await checkIsAuthenticated();
            setIsAuthenticated(auth);
            
            if (auth) {
                const authenticatedActor = await createAuthenticatedActor();
                setActor(authenticatedActor);
                
                // Get the current principal
                const authClient = await AuthClient.create();
                const identity = authClient.getIdentity();
                const principal = identity.getPrincipal().toString();
                setCurrentPrincipal(principal);
                
                await checkAdminStatus(authenticatedActor);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error initializing actor:', error);
            setLoading(false);
        }
    };

    const checkAdminStatus = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            // Get the current principal from the actor's identity
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal().toString();
            
            console.log("Checking admin status with principal:", principal);
            const isAdminUser = await authenticatedActor.is_admin();
            console.log('isAdminUser', isAdminUser);    
            setIsAdmin(isAdminUser);
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    };

    const handleLogin = async (method: 'ii' | 'nfid') => {
        try {
            let authenticatedActor: ActorSubclass<_SERVICE>;
            
            if (method === 'ii') {
                authenticatedActor = await loginWithII();
            } else {
                authenticatedActor = await loginWithNFID();
            }
            
            // Get the principal from the authenticated actor
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal().toString();
            setCurrentPrincipal(principal);
            console.log("Current Principal:", principal);
            
            // Set the actor and check admin status
            setActor(authenticatedActor);
            await checkAdminStatus(authenticatedActor);
            
            // Set authenticated state
            setIsAuthenticated(true);
            setLoading(false);
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        setIsAuthenticated(false);
        setIsAdmin(false);
        setActor(null);
        setCurrentPrincipal("");
        navigate('/admin');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/users', label: 'Registered Users', icon: '👥' },
        { path: '/admin/waitlist', label: 'Waitlist Entries', icon: '⏳' },
        { path: '/admin/user-usage', label: 'User Usage & Requests', icon: '📈' },
        { path: '/admin/payments', label: 'Payment Management', icon: '💳' },
        { path: '/admin/admins', label: 'Admin Management', icon: '🔐' },
        { path: '/admin/accelerators', label: 'Accelerator Management', icon: '👥' },
        { path: '/admin/platform-users', label: 'Platform Users', icon: '🔗' },
        { path: '/admin/api-messages', label: 'API Messages', icon: '💬' },
        { path: '/admin/playground', label: 'Playground Monitoring', icon: '📊' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Show only the authentication component
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
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
                    <h2 className="text-3xl font-bold mb-8 text-center">Admin Authentication</h2>
                    
                    {/* Internet Identity */}
                    <Button
                        variant="primary"
                        className="w-full mb-4 flex items-center justify-center gap-3 !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                        onClick={() => handleLogin('ii')}
                    >
                        <img src="/images/icp-logo.png" alt="Internet Identity" className="w-6 h-6" />
                        Login with Internet Identity
                    </Button>

                    {/* NFID */}
                    <Button
                        variant="primary"
                        className="w-full flex items-center justify-center gap-3 !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                        onClick={() => handleLogin('nfid')}
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
                        Login with NFID
                    </Button>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
                    <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
                    <p className="text-gray-600 mb-6">You do not have admin privileges.</p>
                    <Button
                        variant="primary"
                        className="!bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                        onClick={() => navigate('/')}
                    >
                        Return to Home
                    </Button>
                </div>
            </div>
        );
    }

    // Only show the full admin layout after authentication and admin verification
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                            {currentPrincipal && (
                                <span className="ml-4 text-sm text-gray-500">
                                    Principal: {currentPrincipal.substring(0, 8)}...{currentPrincipal.substring(currentPrincipal.length - 8)}
                                </span>
                            )}
                        </div>
                        <Button
                            variant="secondary"
                            className="flex items-center gap-2"
                            onClick={handleLogout}
                        >
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
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                                />
                            </svg>
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-64 flex-shrink-0">
                        <nav className="bg-white rounded-lg shadow-sm p-4">
                            <ul className="space-y-2">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <li key={item.path}>
                                            <button
                                                onClick={() => navigate(item.path)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                                    isActive
                                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                            >
                                                <span className="text-lg">{item.icon}</span>
                                                <span className="font-medium">{item.label}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <Outlet context={{ actor, currentPrincipal }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout; 