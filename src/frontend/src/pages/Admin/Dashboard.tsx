import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../declarations/backend/backend.did.d';

interface AdminContext {
    actor: ActorSubclass<_SERVICE> | null;
    currentPrincipal: string;
}

const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { actor, currentPrincipal } = useOutletContext<AdminContext>();
    
    // Dashboard stats
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalWaitlist: 0,
        totalAdmins: 0,
        totalAccelerators: 0,
        totalSlackUsers: 0,
        totalDiscordUsers: 0,
        totalOpenchatUsers: 0,
        totalApiMessages: 0,
        playgroundStats: {
            totalMessages: 0,
            uniqueUsers: 0
        }
    });

    useEffect(() => {
        if (actor) {
            fetchDashboardStats(actor);
        }
    }, [actor]);

    const fetchDashboardStats = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            console.log("fetching dashboard stats");
            console.log("Current Principal:", currentPrincipal);
            
            // Fetch all stats in parallel
            const [
                usersResult,
                waitlistResult,
                adminsResult,
                acceleratorsResult,
                slackResult,
                discordResult,
                openchatResult,
                playgroundStatsResult
            ] = await Promise.all([
                authenticatedActor.get_users(),
                authenticatedActor.get_waitlist(),
                authenticatedActor.get_admin_details(),
                authenticatedActor.get_all_accelerators(),
                authenticatedActor.get_registered_slack_users_admin(),
                authenticatedActor.get_registered_discord_users_admin(),
                authenticatedActor.get_registered_openchat_users_admin(),
                authenticatedActor.admin_get_playground_stats()
            ]);

            console.log(usersResult);

            setStats({
                totalUsers: 'Ok' in usersResult ? usersResult.Ok.length : 0,
                totalWaitlist: 'Ok' in waitlistResult ? waitlistResult.Ok.length : 0,
                totalAdmins: adminsResult.length,
                totalAccelerators: 'Ok' in acceleratorsResult ? acceleratorsResult.Ok.length : 0,
                totalSlackUsers: 'Ok' in slackResult ? slackResult.Ok.length : 0,
                totalDiscordUsers: 'Ok' in discordResult ? discordResult.Ok.length : 0,
                totalOpenchatUsers: 'Ok' in openchatResult ? openchatResult.Ok.length : 0,
                totalApiMessages: 0, // We'll need to implement this endpoint
                playgroundStats: 'Ok' in playgroundStatsResult ? {
                    totalMessages: playgroundStatsResult.Ok.total_messages,
                    uniqueUsers: playgroundStatsResult.Ok.unique_users
                } : { totalMessages: 0, uniqueUsers: 0 }
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
        },
        {
            title: 'Playground Messages',
            value: stats.playgroundStats.totalMessages,
            icon: '🚀',
            color: 'bg-orange-500',
            path: '/admin/playground'
        },
        {
            title: 'Playground Users',
            value: stats.playgroundStats.uniqueUsers,
            icon: '👥',
            color: 'bg-teal-500',
            path: '/admin/playground'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Admin Dashboard</h2>
                <p className="text-gray-600">Manage your platform, users, and monitor system activity from one central location.</p>
                {currentPrincipal && (
                    <p className="text-sm text-gray-500 mt-2">
                        Logged in as: {currentPrincipal.substring(0, 8)}...{currentPrincipal.substring(currentPrincipal.length - 8)}
                    </p>
                )}
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