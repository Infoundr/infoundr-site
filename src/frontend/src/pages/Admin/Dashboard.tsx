import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createActor } from '../../../../declarations/backend';
import { HttpAgent, ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { _SERVICE } from '../../../../declarations/backend/backend.did.d';
import { CANISTER_ID } from '../../config';
import { checkIsAuthenticated, createAuthenticatedActor, loginWithII, loginWithNFID } from '../../services/auth';
import Button from '../../components/common/Button';

const AdminDashboard: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [actor, setActor] = useState<ActorSubclass<_SERVICE> | null>(null);
    
    // Dashboard stats
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalWaitlist: 0,
        totalAdmins: 0,
        totalAccelerators: 0,
        totalSlackUsers: 0,
        totalDiscordUsers: 0,
        totalOpenchatUsers: 0,
        totalApiMessages: 0
    });

    useEffect(() => {
        initializeActor();
    }, []);

    const initializeActor = async () => {
        try {
            // Check if user is already authenticated
            const auth = await checkIsAuthenticated();
            setIsAuthenticated(auth);
            
            if (auth) {
                const authenticatedActor = await createAuthenticatedActor();
                setActor(authenticatedActor);
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
            const isAdminUser = await authenticatedActor.is_admin();
            setIsAdmin(isAdminUser);
            if (isAdminUser) {
                await fetchDashboardStats(authenticatedActor);
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

    const fetchDashboardStats = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            // Fetch all stats in parallel
            const [
                usersResult,
                waitlistResult,
                adminsResult,
                acceleratorsResult,
                slackResult,
                discordResult,
                openchatResult
            ] = await Promise.all([
                authenticatedActor.get_users(),
                authenticatedActor.get_waitlist(),
                authenticatedActor.get_admin_details(),
                authenticatedActor.get_all_accelerators(),
                authenticatedActor.get_registered_slack_users_admin(),
                authenticatedActor.get_registered_discord_users_admin(),
                authenticatedActor.get_registered_openchat_users_admin()
            ]);

            setStats({
                totalUsers: 'Ok' in usersResult ? usersResult.Ok.length : 0,
                totalWaitlist: 'Ok' in waitlistResult ? waitlistResult.Ok.length : 0,
                totalAdmins: adminsResult.length,
                totalAccelerators: 'Ok' in acceleratorsResult ? acceleratorsResult.Ok.length : 0,
                totalSlackUsers: 'Ok' in slackResult ? slackResult.Ok.length : 0,
                totalDiscordUsers: 'Ok' in discordResult ? discordResult.Ok.length : 0,
                totalOpenchatUsers: 'Ok' in openchatResult ? openchatResult.Ok.length : 0,
                totalApiMessages: 0 // We'll need to implement this endpoint
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Show login form
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

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: '👥',
            color: 'bg-blue-500',
            path: '/admin/users'
        },
        {
            title: 'Waitlist Entries',
            value: stats.totalWaitlist,
            icon: '⏳',
            color: 'bg-yellow-500',
            path: '/admin/waitlist'
        },
        {
            title: 'Admin Users',
            value: stats.totalAdmins,
            icon: '🔐',
            color: 'bg-red-500',
            path: '/admin/admins'
        },
        {
            title: 'Accelerators',
            value: stats.totalAccelerators,
            icon: '🚀',
            color: 'bg-green-500',
            path: '/admin/accelerators'
        },
        {
            title: 'Slack Users',
            value: stats.totalSlackUsers,
            icon: '💬',
            color: 'bg-purple-500',
            path: '/admin/platform-users'
        },
        {
            title: 'Discord Users',
            value: stats.totalDiscordUsers,
            icon: '🎮',
            color: 'bg-indigo-500',
            path: '/admin/platform-users'
        },
        {
            title: 'OpenChat Users',
            value: stats.totalOpenchatUsers,
            icon: '📱',
            color: 'bg-pink-500',
            path: '/admin/platform-users'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Admin Dashboard</h2>
                <p className="text-gray-600">Manage your platform, users, and monitor system activity from one central location.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(stat.path)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`${stat.color} rounded-full p-3`}>
                                <span className="text-2xl text-white">{stat.icon}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                        <span className="text-2xl">👥</span>
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Manage Users</p>
                            <p className="text-sm text-gray-600">View and manage registered users</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/admin/waitlist')}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                        <span className="text-2xl">⏳</span>
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Review Waitlist</p>
                            <p className="text-sm text-gray-600">Process waitlist applications</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/admin/platform-users')}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                        <span className="text-2xl">🔗</span>
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Platform Users</p>
                            <p className="text-sm text-gray-600">Manage Slack, Discord, OpenChat users</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/admin/api-messages')}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                        <span className="text-2xl">💬</span>
                        <div className="text-left">
                            <p className="font-medium text-gray-900">API Messages</p>
                            <p className="text-sm text-gray-600">Monitor bot conversations</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/admin/accelerators')}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                        <span className="text-2xl">🚀</span>
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Accelerators</p>
                            <p className="text-sm text-gray-600">Manage accelerator programs</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/admin/admins')}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                        <span className="text-2xl">🔐</span>
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Admin Access</p>
                            <p className="text-sm text-gray-600">Manage admin permissions</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 