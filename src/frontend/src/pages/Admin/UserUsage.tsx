import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../declarations/backend/backend.did.d';

interface AdminContext {
    actor: ActorSubclass<_SERVICE> | null;
    currentPrincipal: string;
}

interface UsageStats {
    user_id: string;
    tier: { Free: null } | { Pro: null };
    requests_used: number;
    requests_limit: [] | [number];
    day_bucket: bigint;
    reset_time_rfc3339: string;
}

interface UserSubscription {
    user_id: string;
    tier: { Free: null } | { Pro: null };
    is_active: boolean;
    started_at_ns: [] | [bigint];
    renewed_at_ns: [] | [bigint];
    expires_at_ns: [] | [bigint];
}

interface UserActivityReport {
    user_id: string;
    usage_stats: UsageStats;
    subscription: [] | [UserSubscription];
    can_make_more_requests: boolean;
    total_api_messages: number;
    last_activity: bigint;
}

const UserUsage: React.FC = () => {
    const { actor } = useOutletContext<AdminContext>();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'limits' | 'tiers'>('overview');
    
    // Data states
    const [allUsageStats, setAllUsageStats] = useState<UsageStats[]>([]);
    const [allSubscriptions, setAllSubscriptions] = useState<[string, UserSubscription][]>([]);
    const [dailyUsageSummary, setDailyUsageSummary] = useState<[string, number, { Free: null } | { Pro: null }][]>([]);
    const [usersAtLimit, setUsersAtLimit] = useState<[string, number, { Free: null } | { Pro: null }][]>([]);
    const [usageByTier, setUsageByTier] = useState<[{ Free: null } | { Pro: null }, number, number][]>([]);
    const [topUsers, setTopUsers] = useState<[string, number, { Free: null } | { Pro: null }][]>([]);
    const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
    
    // Search and filter states
    const [searchUserId, setSearchUserId] = useState('');
    const [userActivityReport, setUserActivityReport] = useState<UserActivityReport | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        if (actor) {
            fetchAllData();
        }
    }, [actor]);

    const fetchAllData = async () => {
        if (!actor) return;
        
        try {
            setLoading(true);
            
            // Fetch all data in parallel
            const [
                usageStatsResult,
                subscriptionsResult,
                dailyUsageResult,
                usersAtLimitResult,
                usageByTierResult,
                topUsersResult,
                totalUsersCountResult
            ] = await Promise.all([
                actor.admin_get_all_user_usage_stats(),
                actor.admin_get_all_user_subscriptions(),
                actor.admin_get_daily_usage_summary(),
                actor.admin_get_users_at_limit(),
                actor.admin_get_usage_by_tier(),
                actor.admin_get_top_users_by_requests(10),
                actor.admin_get_total_users_count()
            ]);

            if ('Ok' in usageStatsResult) {
                console.log('Usage stats loaded:', usageStatsResult.Ok.length, 'users');
                setAllUsageStats(usageStatsResult.Ok);
            } else {
                console.log('Usage stats error:', usageStatsResult.Err);
            }
            if ('Ok' in subscriptionsResult) setAllSubscriptions(subscriptionsResult.Ok);
            if ('Ok' in dailyUsageResult) setDailyUsageSummary(dailyUsageResult.Ok);
            if ('Ok' in usersAtLimitResult) {
                console.log('Users at limit loaded:', usersAtLimitResult.Ok.length, 'users');
                setUsersAtLimit(usersAtLimitResult.Ok);
            } else {
                console.log('Users at limit error:', usersAtLimitResult.Err);
            }
            if ('Ok' in usageByTierResult) setUsageByTier(usageByTierResult.Ok);
            if ('Ok' in topUsersResult) {
                console.log('Top users loaded:', topUsersResult.Ok.length, 'users');
                setTopUsers(topUsersResult.Ok);
            } else {
                console.log('Top users error:', topUsersResult.Err);
            }
            if ('Ok' in totalUsersCountResult) {
                console.log('Total users count:', totalUsersCountResult.Ok);
                setTotalUsersCount(totalUsersCountResult.Ok);
            } else {
                console.log('Total users count error:', totalUsersCountResult.Err);
            }

        } catch (error) {
            console.error('Error fetching usage data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSearch = async () => {
        if (!actor || !searchUserId.trim()) return;
        
        try {
            setSearchLoading(true);
            const result = await actor.admin_get_user_activity_report(searchUserId.trim());
            if ('Ok' in result) {
                setUserActivityReport(result.Ok);
            } else {
                setUserActivityReport(null);
            }
        } catch (error) {
            console.error('Error fetching user activity report:', error);
            setUserActivityReport(null);
        } finally {
            setSearchLoading(false);
        }
    };

    const formatTier = (tier: { Free: null } | { Pro: null }) => {
        return 'Free' in tier ? 'Free' : 'Pro';
    };

    const formatTimestamp = (timestamp: bigint) => {
        if (timestamp === 0n) return 'Never';
        const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
        return date.toLocaleString();
    };

    const formatResetTime = (rfc3339: string) => {
        try {
            const date = new Date(rfc3339);
            return date.toLocaleString();
        } catch {
            return rfc3339;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">User Usage & Request Tracking</h1>
                <p className="text-gray-600">Monitor user activity, request limits, and subscription usage across the platform.</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Overview', icon: '📊' },
                            { id: 'users', label: 'All Users', icon: '👥' },
                            { id: 'limits', label: 'Users at Limit', icon: '⚠️' },
                            { id: 'tiers', label: 'Usage by Tier', icon: '📈' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                    activeTab === tab.id
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600">Total Users</p>
                                            <p className="text-3xl font-bold text-blue-900">{totalUsersCount}</p>
                                        </div>
                                        <div className="bg-blue-500 rounded-full p-3">
                                            <span className="text-2xl text-white">👥</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600">Pro Users</p>
                                            <p className="text-3xl font-bold text-green-900">
                                                {allSubscriptions.filter(([_, sub]) => 'Pro' in sub.tier).length}
                                            </p>
                                        </div>
                                        <div className="bg-green-500 rounded-full p-3">
                                            <span className="text-2xl text-white">⭐</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-yellow-600">Users at Limit</p>
                                            <p className="text-3xl font-bold text-yellow-900">{usersAtLimit.length}</p>
                                        </div>
                                        <div className="bg-yellow-500 rounded-full p-3">
                                            <span className="text-2xl text-white">⚠️</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600">Total Requests Today</p>
                                            <p className="text-3xl font-bold text-purple-900">
                                                {dailyUsageSummary.reduce((sum, [userId, count, tier]) => sum + count, 0)}
                                            </p>
                                        </div>
                                        <div className="bg-purple-500 rounded-full p-3">
                                            <span className="text-2xl text-white">📊</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Users */}
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Top Users by Requests Today</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {topUsers.slice(0, 10).map(([userId, count, tier], index) => (
                                                <tr key={userId}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {userId.length > 20 ? `${userId.substring(0, 20)}...` : userId}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            'Pro' in tier 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {formatTier(tier)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* User Search */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Search User Activity</h3>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="Enter User ID..."
                                        value={searchUserId}
                                        onChange={(e) => setSearchUserId(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleUserSearch}
                                        disabled={searchLoading || !searchUserId.trim()}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {searchLoading ? 'Searching...' : 'Search'}
                                    </button>
                                </div>

                                {userActivityReport && (
                                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">User Activity Report</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p><span className="font-medium">User ID:</span> {userActivityReport.user_id}</p>
                                                <p><span className="font-medium">Tier:</span> {formatTier(userActivityReport.usage_stats.tier)}</p>
                                                <p><span className="font-medium">Requests Used:</span> {userActivityReport.usage_stats.requests_used}</p>
                                                <p><span className="font-medium">Requests Limit:</span> {
                                                    userActivityReport.usage_stats.requests_limit.length > 0 
                                                        ? userActivityReport.usage_stats.requests_limit[0] 
                                                        : 'Unlimited'
                                                }</p>
                                            </div>
                                            <div>
                                                <p><span className="font-medium">Can Make More Requests:</span> {
                                                    userActivityReport.can_make_more_requests ? 'Yes' : 'No'
                                                }</p>
                                                <p><span className="font-medium">Total API Messages:</span> {userActivityReport.total_api_messages}</p>
                                                <p><span className="font-medium">Last Activity:</span> {formatTimestamp(userActivityReport.last_activity)}</p>
                                                <p><span className="font-medium">Reset Time:</span> {formatResetTime(userActivityReport.usage_stats.reset_time_rfc3339)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* All Users Tab */}
                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">All User Usage Statistics</h3>
                                <button
                                    onClick={fetchAllData}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Refresh
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests Used</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limit</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reset Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allUsageStats.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                    <div className="text-6xl mb-4">📊</div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No usage data found</h3>
                                                    <p className="text-gray-500">No users have made requests today.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            allUsageStats.map((stats) => (
                                                <tr key={stats.user_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {stats.user_id.length > 20 ? `${stats.user_id.substring(0, 20)}...` : stats.user_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            'Pro' in stats.tier 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {formatTier(stats.tier)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stats.requests_used}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {stats.requests_limit.length > 0 ? stats.requests_limit[0] : 'Unlimited'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatResetTime(stats.reset_time_rfc3339)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Users at Limit Tab */}
                    {activeTab === 'limits' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Users Who Have Reached Their Daily Limit</h3>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                    {usersAtLimit.length} users
                                </span>
                            </div>
                            
                            {usersAtLimit.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users at limit!</h3>
                                    <p className="text-gray-500">All users are within their daily request limits.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests Made</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {usersAtLimit.map(([userId, count, tier]) => (
                                                <tr key={userId}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {userId.length > 20 ? `${userId.substring(0, 20)}...` : userId}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            'Pro' in tier 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {formatTier(tier)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                            At Limit
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Usage by Tier Tab */}
                    {activeTab === 'tiers' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Usage Statistics by Tier</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {usageByTier.map(([tier, userCount, totalRequests]) => (
                                    <div key={formatTier(tier)} className="bg-white border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-gray-900">{formatTier(tier)} Tier</h4>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                'Pro' in tier 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {formatTier(tier)}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Total Users:</span>
                                                <span className="font-medium">{userCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Total Requests Today:</span>
                                                <span className="font-medium">{totalRequests}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Average per User:</span>
                                                <span className="font-medium">
                                                    {userCount > 0 ? Math.round(totalRequests / userCount) : 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserUsage;
