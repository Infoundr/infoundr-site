import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../declarations/backend/backend.did.d';
import Button from '../../components/common/Button';

interface AdminContext {
    actor: ActorSubclass<_SERVICE> | null;
    currentPrincipal: string;
}

const AdminPlatformUsers: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { actor, currentPrincipal } = useOutletContext<AdminContext>();
    
    // Platform user management state
    const [slackUsers, setSlackUsers] = useState<any[]>([]);
    const [discordUsers, setDiscordUsers] = useState<any[]>([]);
    const [openchatUsers, setOpenchatUsers] = useState<any[]>([]);
    const [selectedUserActivity, setSelectedUserActivity] = useState<any>(null);
    const [showUserActivity, setShowUserActivity] = useState<boolean>(false);
    const [selectedUserIdentifier, setSelectedUserIdentifier] = useState<any>(null);
    const [userApiMessages, setUserApiMessages] = useState<any[]>([]);
    const [loadingUserMessages, setLoadingUserMessages] = useState<boolean>(false);
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [platformFilter, setPlatformFilter] = useState<'all' | 'slack' | 'discord' | 'openchat'>('all');
    const [sortBy, setSortBy] = useState<'id' | 'name' | 'created_at'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        if (actor) {
            fetchPlatformUsers(actor);
        }
    }, [actor]);

    const fetchPlatformUsers = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            console.log('Fetching platform users with actor:', authenticatedActor);
            console.log('Current Principal:', currentPrincipal);
            
            const [slackResult, discordResult, openchatResult] = await Promise.all([
                authenticatedActor.get_registered_slack_users_admin(),
                authenticatedActor.get_registered_discord_users_admin(),
                authenticatedActor.get_registered_openchat_users_admin()
            ]);

            console.log('Slack result:', slackResult);
            console.log('Discord result:', discordResult);
            console.log('OpenChat result:', openchatResult);

            if ('Ok' in slackResult) setSlackUsers(slackResult.Ok);
            if ('Ok' in discordResult) setDiscordUsers(discordResult.Ok);
            if ('Ok' in openchatResult) setOpenchatUsers(openchatResult.Ok);
        } catch (error) {
            console.error('Error fetching platform users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetUserActivity = async (identifier: any) => {
        if (!actor) return;
        
        try {
            console.log('Getting user activity for identifier:', identifier);
            setLoadingUserMessages(true);
            
            // First get the user activity (for any additional data)
            const activityResult = await actor.get_user_activity_admin(identifier);
            
            if ('Ok' in activityResult) {
                setSelectedUserActivity(activityResult.Ok);
                setSelectedUserIdentifier(identifier);
                
                // Now fetch the actual API messages for this user
                await fetchUserApiMessages(identifier);
                
                setShowUserActivity(true);
            } else {
                alert(`Error getting user activity: ${activityResult.Err}`);
            }
        } catch (error) {
            console.error('Error getting user activity:', error);
            alert('Error getting user activity');
        } finally {
            setLoadingUserMessages(false);
        }
    };

    const fetchUserApiMessages = async (identifier: any) => {
        if (!actor) return;
        
        try {
            console.log('Fetching API messages for user identifier:', identifier);
            
            // Get all recent API messages and filter by user ID
            const result = await actor.admin_get_recent_api_messages(1000); // Get more messages to find user's messages
            
            if ('Ok' in result) {
                // Extract the user ID from the identifier
                let userId: string = '';
                if (identifier.SlackId) {
                    userId = identifier.SlackId;
                } else if (identifier.DiscordId) {
                    userId = identifier.DiscordId;
                } else if (identifier.OpenChatId) {
                    userId = identifier.OpenChatId;
                }
                
                console.log('Looking for messages from user ID:', userId);
                
                // Filter messages by this user ID
                const userMessages = result.Ok.filter((message: any) => 
                    message.user_id === userId
                );
                
                console.log('Found user messages:', userMessages);
                setUserApiMessages(userMessages);
            } else {
                console.error('Error fetching API messages:', result.Err);
                setUserApiMessages([]);
            }
        } catch (error) {
            console.error('Error fetching user API messages:', error);
            setUserApiMessages([]);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'online':
                return 'bg-green-100 text-green-800';
            case 'inactive':
            case 'offline':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTotalUsers = () => {
        return slackUsers.length + discordUsers.length + openchatUsers.length;
    };

    const handleSort = (field: 'id' | 'name' | 'created_at') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const sortUsers = (users: any[]) => {
        return [...users].sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'id':
                    aValue = a.slack_id || a.discord_id || a.openchat_id || '';
                    bValue = b.slack_id || b.discord_id || b.openchat_id || '';
                    break;
                case 'name':
                    aValue = a.display_name || a.username || '';
                    bValue = b.display_name || b.username || '';
                    break;
                case 'created_at':
                    aValue = a.first_interaction || a.created_at || 0;
                    bValue = b.first_interaction || b.created_at || 0;
                    break;
                default:
                    return 0;
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    const filterUsers = (users: any[]) => {
        if (!searchTerm) return users;
        
        return users.filter(user => {
            const searchLower = searchTerm.toLowerCase();
            const id = (user.slack_id || user.discord_id || user.openchat_id || '').toLowerCase();
            const name = (user.display_name || user.username || '').toLowerCase();
            
            return id.includes(searchLower) || name.includes(searchLower);
        });
    };

    const getFilteredUsers = () => {
        let users: any[] = [];
        
        if (platformFilter === 'all') {
            users = [...slackUsers, ...discordUsers, ...openchatUsers];
        } else if (platformFilter === 'slack') {
            users = slackUsers;
        } else if (platformFilter === 'discord') {
            users = discordUsers;
        } else if (platformFilter === 'openchat') {
            users = openchatUsers;
        }
        
        const filtered = filterUsers(users);
        return sortUsers(filtered);
    };

    const filteredAndSortedUsers = getFilteredUsers();

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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>
                                    <div className="flex items-center gap-2">
                                        Platform ID
                                        {sortBy === 'id' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-2">
                                        Display Name
                                        {sortBy === 'name' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Platform
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Team/Server
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
                                filteredAndSortedUsers.map((user) => {
                                    const platform = user.slack_id ? 'slack' : user.discord_id ? 'discord' : 'openchat';
                                    const identifier = user.slack_id ? { SlackId: user.slack_id } :
                                                   user.discord_id ? { DiscordId: user.discord_id } :
                                                   { OpenChatId: user.openchat_id };
                                    
                                    return (
                                        <tr key={user.slack_id || user.discord_id || user.openchat_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 font-mono">
                                                    {user.slack_id || user.discord_id || user.openchat_id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {user.display_name || user.username || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    platform === 'slack' ? 'bg-purple-100 text-purple-800' :
                                                    platform === 'discord' ? 'bg-indigo-100 text-indigo-800' :
                                                    'bg-pink-100 text-pink-800'
                                                }`}>
                                                    {platform === 'slack' ? '💬 Slack' :
                                                     platform === 'discord' ? '🎮 Discord' :
                                                     '📱 OpenChat'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.team_id || user.guild_id || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.site_principal ? (
                                                    <span className="font-mono text-xs">
                                                        {user.site_principal.toString().substring(0, 8)}...{user.site_principal.toString().substring(user.site_principal.toString().length - 8)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">Not linked</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.first_interaction ? new Date(Number(user.first_interaction) / 1000000).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Button
                                                    variant="secondary"
                                                    className="text-blue-600 hover:text-blue-800"
                                                    onClick={() => handleGetUserActivity(identifier)}
                                                >
                                                    View Activity
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
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
                                    setUserApiMessages([]); // Clear messages when closing
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

                            {/* API Messages - User's Bot Interaction History */}
                            <div>
                                <h4 className="font-semibold mb-2">Recent API Messages ({userApiMessages.length || 0} messages):</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {loadingUserMessages ? (
                                        <div className="flex justify-center items-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        </div>
                                    ) : userApiMessages.length > 0 ? (
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {userApiMessages.map((message: any, index: number) => (
                                                <div key={message.id || index} className="bg-white rounded-lg border border-gray-200 p-4">
                                                    {/* Message Header */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                {message.bot_name || 'Unknown Bot'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {message.timestamp ? new Date(Number(message.timestamp) / 1000000).toLocaleString() : 'No timestamp'}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">#{index + 1}</span>
                                                    </div>
                                                    
                                                    {/* User Message */}
                                                    <div className="mb-3">
                                                        <div className="text-xs font-medium text-gray-600 mb-1">User Message:</div>
                                                        <div className="bg-gray-50 rounded p-3 text-sm text-gray-800">
                                                            {message.message || 'No message content'}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Bot Response */}
                                                    <div className="mb-3">
                                                        <div className="text-xs font-medium text-gray-600 mb-1">Bot Response:</div>
                                                        <div className="bg-blue-50 rounded p-3 text-sm text-gray-800">
                                                            {message.response || 'No response content'}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Metadata */}
                                                    {message.metadata && message.metadata.length > 0 && (
                                                        <div>
                                                            <div className="text-xs font-medium text-gray-600 mb-1">Metadata:</div>
                                                            <div className="bg-gray-100 rounded p-2 text-xs text-gray-600 font-mono">
                                                                {JSON.stringify(message.metadata, null, 2)}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Message ID */}
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <div className="text-xs text-gray-400">
                                                            Message ID: {message.id || 'No ID'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="text-gray-400 mb-2">
                                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500">No API messages found for this user.</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {loadingUserMessages ? 'Loading messages...' : 'This user hasn\'t interacted with any bots yet.'}
                                            </p>
                                        </div>
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