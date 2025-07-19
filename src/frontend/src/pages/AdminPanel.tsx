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
    
    // Platform user management state
    const [slackUsers, setSlackUsers] = useState<any[]>([]);
    const [discordUsers, setDiscordUsers] = useState<any[]>([]);
    const [openchatUsers, setOpenchatUsers] = useState<any[]>([]);
    const [selectedUserActivity, setSelectedUserActivity] = useState<any>(null);
    const [showUserActivity, setShowUserActivity] = useState<boolean>(false);
    const [selectedUserIdentifier, setSelectedUserIdentifier] = useState<any>(null);

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
            
            // Fetch platform users
            try {
                const slackResult = await authenticatedActor.get_registered_slack_users_admin();
                console.log("get_registered_slack_users_admin result:", slackResult);
                if ('Ok' in slackResult) {
                    setSlackUsers(slackResult.Ok);
                }
            } catch (error) {
                console.error('Error fetching Slack users:', error);
            }
            
            try {
                const discordResult = await authenticatedActor.get_registered_discord_users_admin();
                console.log("get_registered_discord_users_admin result:", discordResult);
                if ('Ok' in discordResult) {
                    setDiscordUsers(discordResult.Ok);
                }
            } catch (error) {
                console.error('Error fetching Discord users:', error);
            }
            
            try {
                const openchatResult = await authenticatedActor.get_registered_openchat_users_admin();
                console.log("get_registered_openchat_users_admin result:", openchatResult);
                if ('Ok' in openchatResult) {
                    setOpenchatUsers(openchatResult.Ok);
                }
            } catch (error) {
                console.error('Error fetching OpenChat users:', error);
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

    const handleGetUserActivity = async (identifier: any) => {
        if (!actor) return;
        
        try {
            console.log('Getting user activity for identifier:', identifier);
            console.log('Identifier type:', typeof identifier);
            console.log('Identifier keys:', Object.keys(identifier));
            
            const result = await actor.get_user_activity_admin(identifier);
            console.log('User activity result:', result);
            
            if ('Ok' in result) {
                setSelectedUserActivity(result.Ok);
                setSelectedUserIdentifier(identifier);
                setShowUserActivity(true);
            } else {
                alert(`Error getting user activity: ${result.Err}`);
            }
        } catch (error) {
            console.error('Error getting user activity:', error);
            alert('Error getting user activity');
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

            {/* Platform User Management Section */}
            <section className="mt-12">
                <h2 className="text-2xl font-semibold mb-4">Platform User Management</h2>
                
                {/* Slack Users */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Slack Users ({slackUsers.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white shadow-md rounded-lg">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slack ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Principal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {slackUsers.map((user) => (
                                    <tr key={user.slack_id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.slack_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.display_name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.team_id || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.site_principal ? user.site_principal.toString() : 'Not linked'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Button
                                                variant="secondary"
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={() => handleGetUserActivity({ SlackId: user.slack_id })}
                                            >
                                                View Activity
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Discord Users */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Discord Users ({discordUsers.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white shadow-md rounded-lg">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discord ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guild ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Principal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {discordUsers.map((user) => (
                                    <tr key={user.discord_id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.discord_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.guild_id || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.site_principal ? user.site_principal.toString() : 'Not linked'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Button
                                                variant="secondary"
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={() => handleGetUserActivity({ DiscordId: user.discord_id })}
                                            >
                                                View Activity
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* OpenChat Users */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">OpenChat Users ({openchatUsers.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white shadow-md rounded-lg">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OpenChat ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Interaction</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Interaction</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Principal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {openchatUsers.map((user) => (
                                    <tr key={user.openchat_id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.openchat_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(Number(user.first_interaction) / 1000000).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(Number(user.last_interaction) / 1000000).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.site_principal ? user.site_principal.toString() : 'Not linked'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Button
                                                variant="secondary"
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={() => handleGetUserActivity({ OpenChatId: user.openchat_id })}
                                            >
                                                View Activity
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* User Activity Modal */}
            {showUserActivity && selectedUserActivity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">User Activity</h3>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowUserActivity(false);
                                    setSelectedUserActivity(null);
                                    setSelectedUserIdentifier(null);
                                }}
                            >
                                Close
                            </Button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* User Identifier Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">User Identifier:</h4>
                                <p className="text-sm text-gray-600">
                                    {selectedUserIdentifier && typeof selectedUserIdentifier === 'object' && (
                                        (() => {
                                            try {
                                                const keys = Object.keys(selectedUserIdentifier);
                                                if (keys.length > 0) {
                                                    const key = keys[0];
                                                    const value = selectedUserIdentifier[key];
                                                    switch (key) {
                                                        case 'SlackId':
                                                            return `Slack ID: ${value}`;
                                                        case 'DiscordId':
                                                            return `Discord ID: ${value}`;
                                                        case 'OpenChatId':
                                                            return `OpenChat ID: ${value}`;
                                                        case 'Principal':
                                                            return `Principal: ${value}`;
                                                        default:
                                                            return `Unknown: ${key} - ${JSON.stringify(value)}`;
                                                    }
                                                }
                                                return 'Unknown identifier';
                                            } catch (error) {
                                                console.error('Error parsing user identifier:', error);
                                                return 'Error parsing identifier';
                                            }
                                        })()
                                    )}
                                </p>
                            </div>

                            {/* Connection Status */}
                            <div>
                                <h4 className="font-semibold mb-2">Connection Status:</h4>
                                {selectedUserActivity.connection_status ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded">
                                            <span className="font-medium">Asana:</span> 
                                            <span className={`ml-2 ${selectedUserActivity.connection_status.asana_connected ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedUserActivity.connection_status.asana_connected ? 'Connected' : 'Not Connected'}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <span className="font-medium">GitHub:</span> 
                                            <span className={`ml-2 ${selectedUserActivity.connection_status.github_connected ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedUserActivity.connection_status.github_connected ? 'Connected' : 'Not Connected'}
                                            </span>
                                        </div>
                                        {selectedUserActivity.connection_status.selected_repo && (
                                            <div className="mt-2 bg-gray-50 p-3 rounded">
                                                <span className="font-medium">Selected Repository:</span> 
                                                <span className="ml-2 text-gray-600">
                                                    {Array.isArray(selectedUserActivity.connection_status.selected_repo) 
                                                        ? selectedUserActivity.connection_status.selected_repo[0] || 'None'
                                                        : selectedUserActivity.connection_status.selected_repo}
                                                </span>
                                            </div>
                                        )}
                                        {selectedUserActivity.connection_status.asana_workspace && (
                                            <div className="mt-2 bg-gray-50 p-3 rounded">
                                                <span className="font-medium">Asana Workspace:</span> 
                                                <span className="ml-2 text-gray-600">
                                                    {Array.isArray(selectedUserActivity.connection_status.asana_workspace)
                                                        ? selectedUserActivity.connection_status.asana_workspace[0] || 'None'
                                                        : selectedUserActivity.connection_status.asana_workspace}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No connection status available</p>
                                )}
                            </div>

                            {/* Chat History */}
                            <div>
                                <h4 className="font-semibold mb-2">Chat History ({selectedUserActivity.chat_history?.length || 0} messages):</h4>
                                <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-4">
                                    {selectedUserActivity.chat_history && selectedUserActivity.chat_history.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedUserActivity.chat_history.map((message: any, index: number) => (
                                                <div key={index} className="bg-white p-3 rounded border">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-medium text-sm">
                                                            {(() => {
                                                                if (message.role && typeof message.role === 'object') {
                                                                    const roleKeys = Object.keys(message.role);
                                                                    if (roleKeys.length > 0) {
                                                                        return roleKeys[0]; // Return the key (User, Assistant, etc.)
                                                                    }
                                                                }
                                                                return message.role || 'Unknown';
                                                            })()}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {message.timestamp ? new Date(Number(message.timestamp) / 1000000).toLocaleString() : 'No timestamp'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{message.content || 'No content'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center">No chat history available</p>
                                    )}
                                </div>
                            </div>

                            {/* Tasks */}
                            <div>
                                <h4 className="font-semibold mb-2">Tasks ({selectedUserActivity.tasks?.length || 0} tasks):</h4>
                                <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-4">
                                    {selectedUserActivity.tasks && selectedUserActivity.tasks.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedUserActivity.tasks.map((task: any, index: number) => (
                                                <div key={index} className="bg-white p-3 rounded border">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-medium text-sm">{task.title || 'No title'}</span>
                                                        <span className={`text-xs px-2 py-1 rounded ${
                                                            task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                            task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {task.status || 'Unknown'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{task.description || 'No description'}</p>
                                                    <div className="text-xs text-gray-500">
                                                        Created: {task.created_at ? new Date(Number(task.created_at) / 1000000).toLocaleString() : 'Unknown'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center">No tasks available</p>
                                    )}
                                </div>
                            </div>

                            {/* Issues */}
                            <div>
                                <h4 className="font-semibold mb-2">GitHub Issues ({selectedUserActivity.issues?.length || 0} issues):</h4>
                                <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-4">
                                    {selectedUserActivity.issues && selectedUserActivity.issues.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedUserActivity.issues.map((issue: any, index: number) => (
                                                <div key={index} className="bg-white p-3 rounded border">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-medium text-sm">{issue.title || 'No title'}</span>
                                                        <span className={`text-xs px-2 py-1 rounded ${
                                                            issue.state === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {issue.state || 'Unknown'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{issue.body || 'No description'}</p>
                                                    <div className="text-xs text-gray-500">
                                                        Created: {issue.created_at ? new Date(Number(issue.created_at) / 1000000).toLocaleString() : 'Unknown'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center">No GitHub issues available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel; 