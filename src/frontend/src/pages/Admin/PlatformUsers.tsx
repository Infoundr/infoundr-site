import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createActor } from '../../../../declarations/backend';
import { HttpAgent, ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { _SERVICE } from '../../../../declarations/backend/backend.did.d';
import { CANISTER_ID } from '../../config';
import { checkIsAuthenticated, createAuthenticatedActor } from '../../services/auth';
import Button from '../../components/common/Button';

const AdminPlatformUsers: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [actor, setActor] = useState<ActorSubclass<_SERVICE> | null>(null);
    
    // Platform user management state
    const [slackUsers, setSlackUsers] = useState<any[]>([]);
    const [discordUsers, setDiscordUsers] = useState<any[]>([]);
    const [openchatUsers, setOpenchatUsers] = useState<any[]>([]);
    const [selectedUserActivity, setSelectedUserActivity] = useState<any>(null);
    const [showUserActivity, setShowUserActivity] = useState<boolean>(false);
    const [selectedUserIdentifier, setSelectedUserIdentifier] = useState<any>(null);
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [platformFilter, setPlatformFilter] = useState<'all' | 'slack' | 'discord' | 'openchat'>('all');
    const [sortBy, setSortBy] = useState<'id' | 'name' | 'created_at'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        initializeActor();
    }, []);

    const initializeActor = async () => {
        try {
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
                await fetchPlatformUsers(authenticatedActor);
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    };

    const fetchPlatformUsers = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            const [slackResult, discordResult, openchatResult] = await Promise.all([
                authenticatedActor.get_registered_slack_users_admin(),
                authenticatedActor.get_registered_discord_users_admin(),
                authenticatedActor.get_registered_openchat_users_admin()
            ]);

            if ('Ok' in slackResult) setSlackUsers(slackResult.Ok);
            if ('Ok' in discordResult) setDiscordUsers(discordResult.Ok);
            if ('Ok' in openchatResult) setOpenchatUsers(openchatResult.Ok);
        } catch (error) {
            console.error('Error fetching platform users:', error);
        }
    };

    const handleGetUserActivity = async (identifier: any) => {
        if (!actor) return;
        
        try {
            console.log('Getting user activity for identifier:', identifier);
            const result = await actor.get_user_activity_admin(identifier);
            
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Authentication is now handled by AdminLayout
    if (!actor) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    // Get all users based on platform filter
    const getAllUsers = () => {
        let users: any[] = [];
        
        if (platformFilter === 'all' || platformFilter === 'slack') {
            users.push(...slackUsers.map(user => ({ ...user, platform: 'slack' })));
        }
        if (platformFilter === 'all' || platformFilter === 'discord') {
            users.push(...discordUsers.map(user => ({ ...user, platform: 'discord' })));
        }
        if (platformFilter === 'all' || platformFilter === 'openchat') {
            users.push(...openchatUsers.map(user => ({ ...user, platform: 'openchat' })));
        }
        
        return users;
    };

    // Filter and sort users
    const filteredAndSortedUsers = getAllUsers()
        .filter(user => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (user.platform === 'slack' && (user.slack_id?.toLowerCase().includes(searchLower) || user.display_name?.toLowerCase().includes(searchLower))) ||
                (user.platform === 'discord' && (user.discord_id?.toLowerCase().includes(searchLower) || user.username?.toLowerCase().includes(searchLower))) ||
                (user.platform === 'openchat' && user.openchat_id?.toLowerCase().includes(searchLower))
            );
        })
        .sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'id':
                    aValue = a.platform === 'slack' ? a.slack_id : a.platform === 'discord' ? a.discord_id : a.openchat_id;
                    bValue = b.platform === 'slack' ? b.slack_id : b.platform === 'discord' ? b.discord_id : b.openchat_id;
                    break;
                case 'name':
                    aValue = (a.platform === 'slack' ? a.display_name : a.platform === 'discord' ? a.username : '') || '';
                    bValue = (b.platform === 'slack' ? b.display_name : b.platform === 'discord' ? b.username : '') || '';
                    break;
                case 'created_at':
                    aValue = a.platform === 'slack' ? Number(a.created_at || 0) : 
                             a.platform === 'discord' ? Number(a.created_at || 0) : 
                             Number(a.first_interaction || 0);
                    bValue = b.platform === 'slack' ? Number(b.created_at || 0) : 
                             b.platform === 'discord' ? Number(b.created_at || 0) : 
                             Number(b.first_interaction || 0);
                    break;
                default:
                    return 0;
            }
            
            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

    const handleSort = (field: 'id' | 'name' | 'created_at') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const formatDate = (timestamp: bigint) => {
        return new Date(Number(timestamp) / 1000000).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'slack': return '💬';
            case 'discord': return '🎮';
            case 'openchat': return '📱';
            default: return '🔗';
        }
    };

    const getPlatformColor = (platform: string) => {
        switch (platform) {
            case 'slack': return 'bg-purple-100 text-purple-800';
            case 'discord': return 'bg-indigo-100 text-indigo-800';
            case 'openchat': return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTotalUsers = () => {
        return slackUsers.length + discordUsers.length + openchatUsers.length;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Platform User Management</h1>
                    <p className="text-gray-600">Manage users from Slack, Discord, and OpenChat platforms</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {getTotalUsers()} Total Users
                    </div>
                </div>
            </div>

            {/* Platform Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-400">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">💬</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Slack Users</p>
                            <p className="text-2xl font-bold text-gray-900">{slackUsers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-400">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">🎮</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Discord Users</p>
                            <p className="text-2xl font-bold text-gray-900">{discordUsers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-400">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">📱</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">OpenChat Users</p>
                            <p className="text-2xl font-bold text-gray-900">{openchatUsers.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                            Search Users
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="search"
                                placeholder="Search by ID, name, or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value as 'all' | 'slack' | 'discord' | 'openchat')}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Platforms</option>
                            <option value="slack">Slack Only</option>
                            <option value="discord">Discord Only</option>
                            <option value="openchat">OpenChat Only</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => handleSort(e.target.value as 'id' | 'name' | 'created_at')}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="created_at">Sort by Date</option>
                            <option value="id">Sort by ID</option>
                            <option value="name">Sort by Name</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Platform
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>
                                    <div className="flex items-center gap-2">
                                        User ID
                                        {sortBy === 'id' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-2">
                                        Display Name
                                        {sortBy === 'name' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Linked Principal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('created_at')}>
                                    <div className="flex items-center gap-2">
                                        First Interaction
                                        {sortBy === 'created_at' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedUsers.length > 0 ? (
                                filteredAndSortedUsers.map((user, index) => (
                                    <tr key={`${user.platform}-${index}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(user.platform)}`}>
                                                {getPlatformIcon(user.platform)} {user.platform.charAt(0).toUpperCase() + user.platform.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-mono">
                                                {user.platform === 'slack' ? user.slack_id : 
                                                 user.platform === 'discord' ? user.discord_id : 
                                                 user.openchat_id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.platform === 'slack' ? (user.display_name || 'N/A') :
                                                 user.platform === 'discord' ? (user.username || 'N/A') :
                                                 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {user.site_principal ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs">
                                                            {user.site_principal.toString().substring(0, 10)}...
                                                        </span>
                                                        <button
                                                            onClick={() => navigator.clipboard.writeText(user.site_principal.toString())}
                                                            className="text-xs text-purple-600 hover:text-purple-800"
                                                            title="Copy to clipboard"
                                                        >
                                                            Copy
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Not linked</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.platform === 'slack' ? 
                                                (user.created_at ? formatDate(user.created_at) : 'N/A') :
                                             user.platform === 'discord' ? 
                                                (user.created_at ? formatDate(user.created_at) : 'N/A') :
                                                formatDate(user.first_interaction)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Button
                                                variant="secondary"
                                                className="text-blue-600 hover:text-blue-800 text-xs"
                                                onClick={() => {
                                                    const identifier = user.platform === 'slack' ? { SlackId: user.slack_id } :
                                                                   user.platform === 'discord' ? { DiscordId: user.discord_id } :
                                                                   { OpenChatId: user.openchat_id };
                                                    handleGetUserActivity(identifier);
                                                }}
                                            >
                                                View Activity
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            {searchTerm || platformFilter !== 'all' 
                                                ? 'No users found matching your criteria.' 
                                                : 'No platform users found.'}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Results Summary */}
            {filteredAndSortedUsers.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="text-sm text-gray-600 text-center">
                        Showing {filteredAndSortedUsers.length} of {getTotalUsers()} users
                        {searchTerm && ` matching "${searchTerm}"`}
                        {platformFilter !== 'all' && ` from ${platformFilter}`}
                    </div>
                </div>
            )}

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
                                                                        return roleKeys[0];
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

export default AdminPlatformUsers; 