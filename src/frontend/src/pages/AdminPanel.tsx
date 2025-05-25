import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createActor } from '../../../declarations/backend';
import { HttpAgent, ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { _SERVICE } from '../../../declarations/backend/backend.did.d';
import { CANISTER_ID } from '../config';
import { User, WaitlistEntry } from '../../../declarations/backend/backend.did';
import { loginWithII, loginWithNFID, checkIsAuthenticated, logout } from '../services/auth';
import Button from '../components/common/Button';

const AdminPanel: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>([]);
    const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [currentPrincipal, setCurrentPrincipal] = useState<string>("");
    const [actor, setActor] = useState<ActorSubclass<_SERVICE> | null>(null);

    const createAuthenticatedActor = async () => {
        try {
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();
            const agent = new HttpAgent({ identity });
            
            if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
                await agent.fetchRootKey();
            }
            
            return createActor(CANISTER_ID, { agent });
        } catch (error) {
            console.error('Error creating authenticated actor:', error);
            throw error;
        }
    };

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
            const authenticatedActor = await createAuthenticatedActor();
            setActor(authenticatedActor);
            checkAdminStatus(authenticatedActor);
        } catch (error) {
            console.error('Error initializing actor:', error);
        }
    };

    const checkAdminStatus = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            console.log("Checking admin status with principal:", currentPrincipal);
            const isAdminUser = await authenticatedActor.is_admin();
            console.log('isAdminUser', isAdminUser);    
            setIsAdmin(isAdminUser);
            if (isAdminUser) {
                await fetchData(authenticatedActor);
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    };

    const handleLogin = async (method: 'ii' | 'nfid') => {
        try {
            if (method === 'ii') {
                await loginWithII();
                const authClient = await AuthClient.create();
                const identity = authClient.getIdentity();
                const principal = identity.getPrincipal().toString();
                setCurrentPrincipal(principal);
                console.log("Current Principal:", principal);
            } else {
                await loginWithNFID();
            }
            await checkAuthStatus();
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const fetchData = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            const usersResult = await authenticatedActor.get_users();
            if ('Ok' in usersResult) {
                setUsers(usersResult.Ok);
            }

            const waitlistResult = await authenticatedActor.get_waitlist();
            if ('Ok' in waitlistResult) {
                setWaitlist(waitlistResult.Ok);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const checkAuthStatus = async () => {
        const auth = await checkIsAuthenticated();
        setIsAuthenticated(auth);
        if (auth) {
            if (actor) {
                checkAdminStatus(actor);
            } else {
                const newActor = await createAuthenticatedActor();
                setActor(newActor);
                checkAdminStatus(newActor);
            }
        }
        setLoading(false);
    };

    // if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    if (!isAuthenticated) {
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <Button
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={async () => {
                        await logout();
                        setIsAuthenticated(false);
                        setIsAdmin(false);
                        setActor(null);
                        navigate('/admin');
                    }}
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
            
            {/* Users Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Registered Users</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.principal.toString()}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.principal.toString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(Number(user.created_at) / 1000000).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Waitlist Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Waitlist Entries</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {waitlist.map((entry) => (
                                <tr key={entry.email}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {Object.keys(entry.status)[0]}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(Number(entry.created_at) / 1000000).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminPanel; 