import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createActor } from '../../../declarations/backend';
import { HttpAgent, ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { _SERVICE } from '../../../declarations/backend/backend.did.d';
import { CANISTER_ID } from '../config';
import { User, WaitlistEntry } from '../../../declarations/backend/backend.did';
import { loginWithII, loginWithNFID, checkIsAuthenticated, logout, createAuthenticatedActor } from '../services/auth';
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
    
    // Admin management state
    const [admins, setAdmins] = useState<Array<[any, any]>>([]);
    const [newAdminPrincipal, setNewAdminPrincipal] = useState<string>("");
    const [showAddAdminForm, setShowAddAdminForm] = useState<boolean>(false);
    
    // Accelerator management state
    const [accelerators, setAccelerators] = useState<any[]>([]);
    const [selectedAccelerator, setSelectedAccelerator] = useState<any>(null);
    const [showAcceleratorDetails, setShowAcceleratorDetails] = useState<boolean>(false);

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
            if (isAdminUser) {
                await fetchData(authenticatedActor);
            }
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

    const fetchData = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            // Debug: Get the principal being used
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal().toString();
            console.log("Fetching data with principal:", principal);
            
            const usersResult = await authenticatedActor.get_users();
            console.log("get_users result:", usersResult);
            if ('Ok' in usersResult) {
                setUsers(usersResult.Ok);
            }

            const waitlistResult = await authenticatedActor.get_waitlist();
            console.log("get_waitlist result:", waitlistResult);
            if ('Ok' in waitlistResult) {
                setWaitlist(waitlistResult.Ok);
            }
            
            // Fetch admins
            try {
                const adminsResult = await authenticatedActor.get_admin_details();
                console.log("get_admin_details result:", adminsResult);
                setAdmins(adminsResult);
            } catch (error) {
                console.error('Error fetching admins:', error);
            }
            
            // Fetch accelerators
            try {
                const acceleratorsResult = await authenticatedActor.get_all_accelerators();
                console.log("get_all_accelerators result:", acceleratorsResult);
                if ('Ok' in acceleratorsResult) {
                    setAccelerators(acceleratorsResult.Ok);
                }
            } catch (error) {
                console.error('Error fetching accelerators:', error);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleAddAdmin = async () => {
        if (!actor || !newAdminPrincipal.trim()) return;
        
        try {
            const result = await actor.add_admin(newAdminPrincipal as any);
            if ('Ok' in result) {
                setNewAdminPrincipal("");
                setShowAddAdminForm(false);
                // Refresh admins list
                await fetchData(actor);
            } else {
                alert(`Error adding admin: ${result.Err}`);
            }
        } catch (error) {
            console.error('Error adding admin:', error);
            alert('Error adding admin');
        }
    };

    const handleRemoveAdmin = async (principal: string) => {
        if (!actor) return;
        
        if (!confirm(`Are you sure you want to remove admin ${principal}?`)) return;
        
        try {
            const result = await actor.remove_admin(principal as any);
            if ('Ok' in result) {
                // Refresh admins list
                await fetchData(actor);
            } else {
                alert(`Error removing admin: ${result.Err}`);
            }
        } catch (error) {
            console.error('Error removing admin:', error);
            alert('Error removing admin');
        }
    };

    const handleDeleteAccelerator = async (id: any) => {
        if (!actor) return;

        if (!confirm(`Are you sure you want to delete accelerator with ID ${id}?`)) return;

        try {
            const result = await actor.delete_accelerator(id);
            if ('Ok' in result) {
                // Refresh accelerators list
                await fetchData(actor);
            } else {
                alert(`Error deleting accelerator: ${result.Err}`);
            }
        } catch (error) {
            console.error('Error deleting accelerator:', error);
            alert('Error deleting accelerator');
        }
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

            {/* Admin Management Section */}
            <section className="mt-12">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Admin Management</h2>
                    <Button
                        variant="primary"
                        className="!bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                        onClick={() => setShowAddAdminForm(!showAddAdminForm)}
                    >
                        {showAddAdminForm ? 'Cancel' : 'Add Admin'}
                    </Button>
                </div>

                {showAddAdminForm && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h3 className="text-lg font-semibold mb-4">Add New Admin</h3>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Enter principal ID"
                                value={newAdminPrincipal}
                                onChange={(e) => setNewAdminPrincipal(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <Button
                                variant="primary"
                                className="!bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                                onClick={handleAddAdmin}
                                disabled={!newAdminPrincipal.trim()}
                            >
                                Add Admin
                            </Button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {admins.map((adminData) => (
                                <tr key={adminData[0].toString()}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adminData[0].toString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(Number(adminData[1].created_at) / 1000000).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <Button
                                            variant="secondary"
                                            className="text-red-600 hover:text-red-800"
                                            onClick={() => handleRemoveAdmin(adminData[0].toString())}
                                        >
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Accelerator Management Section */}
            <section className="mt-12">
                <h2 className="text-2xl font-semibold mb-4">Accelerator Management</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Startups</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {accelerators.map((accelerator) => (
                                <tr key={accelerator.id.toString()}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{accelerator.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{accelerator.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{accelerator.website}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{accelerator.total_startups}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={() => {
                                                    setSelectedAccelerator(accelerator);
                                                    setShowAcceleratorDetails(true);
                                                }}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                className="text-red-600 hover:text-red-800"
                                                onClick={() => handleDeleteAccelerator(accelerator.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
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