import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../declarations/backend/backend.did.d';
import Button from '../../components/common/Button';

interface AdminContext {
    actor: ActorSubclass<_SERVICE> | null;
    currentPrincipal: string;
}

interface PlaygroundStats {
    total_messages: number;
    unique_users: number;
    bot_usage: Array<[string, number]>;
}

const AdminPlaygroundMonitoring: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { actor, currentPrincipal } = useOutletContext<AdminContext>();
    
    // Playground monitoring state
    const [playgroundStats, setPlaygroundStats] = useState<PlaygroundStats | null>(null);
    const [playgroundUsers, setPlaygroundUsers] = useState<string[]>([]);
    const [playgroundMessages, setPlaygroundMessages] = useState<any[]>([]);
    const [playgroundMessagesByBot, setPlaygroundMessagesByBot] = useState<any[]>([]);
    const [recentPlaygroundMessages, setRecentPlaygroundMessages] = useState<any[]>([]);
    const [selectedBotName, setSelectedBotName] = useState<string>("");
    const [recentMessageLimit, setRecentMessageLimit] = useState<number>(50);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [playgroundMessageFilter, setPlaygroundMessageFilter] = useState<'all' | 'byBot' | 'recent' | 'byUser'>('recent');
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'timestamp' | 'bot_name' | 'user_id'>('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        if (actor) {
            fetchPlaygroundData();
        }
    }, [actor]);

    const fetchPlaygroundData = async () => {
        if (!actor) return;
        
        try {
            setLoading(true);
            console.log('Fetching playground data');
            console.log('Current Principal:', currentPrincipal);
            
            // Fetch all playground data in parallel
            const [
                statsResult,
                usersResult,
                messagesResult,
                recentMessagesResult
            ] = await Promise.all([
                actor.admin_get_playground_stats(),
                actor.admin_get_playground_users(),
                actor.admin_get_playground_messages(),
                actor.admin_get_recent_playground_messages(50)
            ]);

            // Process stats
            if ('Ok' in statsResult) {
                setPlaygroundStats(statsResult.Ok);
            } else {
                console.error('Error fetching playground stats:', statsResult.Err);
            }

            // Process users
            if ('Ok' in usersResult) {
                setPlaygroundUsers(usersResult.Ok);
            } else {
                console.error('Error fetching playground users:', usersResult.Err);
            }

            // Process messages
            if ('Ok' in messagesResult) {
                setPlaygroundMessages(messagesResult.Ok);
            } else {
                console.error('Error fetching playground messages:', messagesResult.Err);
            }

            // Process recent messages
            if ('Ok' in recentMessagesResult) {
                setRecentPlaygroundMessages(recentMessagesResult.Ok);
                setPlaygroundMessageFilter('recent');
            } else {
                console.error('Error fetching recent playground messages:', recentMessagesResult.Err);
            }

        } catch (error) {
            console.error('Error fetching playground data:', error);
            alert('Error fetching playground data');
        } finally {
            setLoading(false);
        }
    };

    const fetchPlaygroundMessagesByBot = async (botName: string) => {
        if (!actor) return;
        
        try {
            console.log('Fetching playground messages for bot:', botName);
            
            const result = await actor.admin_get_playground_messages_by_bot(botName);
            console.log('Playground messages by bot result:', result);
            
            if ('Ok' in result) {
                setPlaygroundMessagesByBot(result.Ok);
                setPlaygroundMessageFilter('byBot');
            } else {
                alert(`Error fetching playground messages by bot: ${result.Err}`);
            }
        } catch (error) {
            console.error('Error fetching playground messages by bot:', error);
            alert('Error fetching playground messages by bot');
        }
    };

    const fetchPlaygroundUserActivity = async (userId: string) => {
        if (!actor) return;
        
        try {
            console.log('Fetching playground user activity for:', userId);
            
            const result = await actor.admin_get_playground_user_activity(userId);
            console.log('Playground user activity result:', result);
            
            if ('Ok' in result) {
                // Convert user activity to messages format for display
                const messages = result.Ok.chat_history.map((chat: any) => ({
                    id: chat.id || `chat_${Date.now()}`,
                    user_id: userId,
                    bot_name: 'Playground Chat',
                    message: chat.message || 'No message',
                    response: chat.response || 'No response',
                    timestamp: chat.timestamp || BigInt(Date.now() * 1000000)
                }));
                setRecentPlaygroundMessages(messages);
                setPlaygroundMessageFilter('byUser');
            } else {
                alert(`Error fetching playground user activity: ${result.Err}`);
            }
        } catch (error) {
            console.error('Error fetching playground user activity:', error);
            alert('Error fetching playground user activity');
        }
    };

    const handlePlaygroundMessageFilter = (filter: 'all' | 'byBot' | 'recent' | 'byUser') => {
        setPlaygroundMessageFilter(filter);
        
        if (filter === 'all') {
            // Already have all messages loaded
        } else if (filter === 'byBot' && selectedBotName) {
            fetchPlaygroundMessagesByBot(selectedBotName);
        } else if (filter === 'recent') {
            // Already have recent messages loaded
        } else if (filter === 'byUser' && selectedUserId) {
            fetchPlaygroundUserActivity(selectedUserId);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!actor) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    // Get current messages based on filter
    const getCurrentMessages = () => {
        switch (playgroundMessageFilter) {
            case 'all': return playgroundMessages;
            case 'byBot': return playgroundMessagesByBot;
            case 'recent': return recentPlaygroundMessages;
            case 'byUser': return recentPlaygroundMessages; // User activity is loaded into recent messages
            default: return recentPlaygroundMessages;
        }
    };

    // Filter and sort messages
    const filteredAndSortedMessages = getCurrentMessages()
        .filter(message => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (message.user_id && message.user_id.toLowerCase().includes(searchLower)) ||
                (message.bot_name && message.bot_name.toLowerCase().includes(searchLower)) ||
                (message.message && message.message.toLowerCase().includes(searchLower)) ||
                (message.response && message.response.toLowerCase().includes(searchLower))
            );
        })
        .sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'timestamp':
                    aValue = Number(a.timestamp || 0);
                    bValue = Number(b.timestamp || 0);
                    break;
                case 'bot_name':
                    aValue = (a.bot_name || '').toLowerCase();
                    bValue = (b.bot_name || '').toLowerCase();
                    break;
                case 'user_id':
                    aValue = (a.user_id || '').toLowerCase();
                    bValue = (b.user_id || '').toLowerCase();
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

    const handleSort = (field: 'timestamp' | 'bot_name' | 'user_id') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const formatDate = (timestamp: bigint) => {
        return new Date(Number(timestamp) / 1000000).toLocaleString('en-US', {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const truncateText = (text: string, maxLength: number = 100) => {
        if (!text) return 'No content';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getTotalMessages = () => {
        switch (playgroundMessageFilter) {
            case 'all': return playgroundMessages.length;
            case 'byBot': return playgroundMessagesByBot.length;
            case 'recent': return recentPlaygroundMessages.length;
            case 'byUser': return recentPlaygroundMessages.length;
            default: return 0;
        }
    };

    const isPlaygroundUser = (userId: string) => {
        return userId.startsWith('playground_user_');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">🚀 Playground Monitoring</h1>
                    <p className="text-gray-600">Monitor playground user activities, conversations, and engagement metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {getTotalMessages()} Messages
                    </div>
                    <Button
                        variant="secondary"
                        onClick={fetchPlaygroundData}
                        className="!bg-purple-600 !text-white hover:!bg-purple-700"
                    >
                        🔄 Refresh Data
                    </Button>
                </div>
            </div>

            {/* Playground Statistics */}
            {playgroundStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                                <p className="text-3xl font-bold text-purple-600">{playgroundStats.total_messages}</p>
                            </div>
                            <div className="bg-purple-100 rounded-full p-3">
                                <span className="text-2xl text-purple-600">💬</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                                <p className="text-3xl font-bold text-blue-600">{playgroundStats.unique_users}</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <span className="text-2xl text-blue-600">👥</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Bot Usage</p>
                                <p className="text-3xl font-bold text-green-600">{playgroundStats.bot_usage.length}</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <span className="text-2xl text-green-600">🤖</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bot Usage Breakdown */}
            {playgroundStats && playgroundStats.bot_usage.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 Bot Usage Statistics</h3>
                    <div className="space-y-3">
                        {playgroundStats.bot_usage.map(([botName, usageCount], index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">{botName}</span>
                                <span className="text-sm text-gray-500">{usageCount} messages</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Playground Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <Button
                        variant="primary"
                        className="!bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                        onClick={() => handlePlaygroundMessageFilter('all')}
                    >
                        View All Playground Messages ({playgroundMessages.length})
                    </Button>
                    
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Enter bot name"
                            value={selectedBotName}
                            onChange={(e) => setSelectedBotName(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <Button
                            variant="secondary"
                            onClick={() => handlePlaygroundMessageFilter('byBot')}
                            disabled={!selectedBotName.trim()}
                        >
                            Filter by Bot
                        </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Limit"
                            value={recentMessageLimit}
                            onChange={(e) => setRecentMessageLimit(Number(e.target.value))}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            min="1"
                            max="1000"
                        />
                        <Button
                            variant="secondary"
                            onClick={() => handlePlaygroundMessageFilter('recent')}
                        >
                            Recent Messages
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Select User</option>
                            {playgroundUsers.map((userId) => (
                                <option key={userId} value={userId}>
                                    {userId}
                                </option>
                            ))}
                        </select>
                        <Button
                            variant="secondary"
                            onClick={() => handlePlaygroundMessageFilter('byUser')}
                            disabled={!selectedUserId}
                        >
                            User Activity
                        </Button>
                    </div>
                </div>
            </div>

            {/* Playground Users List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Playground Users ({playgroundUsers.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {playgroundUsers.map((userId, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-mono text-sm text-gray-700">
                                {userId}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Playground User
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                            Search Playground Messages
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="search"
                                placeholder="Search by user ID, bot name, message, or response..."
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
                            value={sortBy}
                            onChange={(e) => handleSort(e.target.value as 'timestamp' | 'bot_name' | 'user_id')}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="timestamp">Sort by Time</option>
                            <option value="bot_name">Sort by Bot</option>
                            <option value="user_id">Sort by User</option>
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

            {/* Playground Messages Display */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                            {playgroundMessageFilter === 'all' && 'All Playground Messages'}
                            {playgroundMessageFilter === 'byBot' && `Playground Messages from ${selectedBotName}`}
                            {playgroundMessageFilter === 'recent' && `Recent Playground Messages (${recentMessageLimit})`}
                            {playgroundMessageFilter === 'byUser' && `User Activity: ${selectedUserId}`}
                        </h3>
                        <div className="text-sm text-gray-500">
                            {filteredAndSortedMessages.length} of {getTotalMessages()} messages
                            {searchTerm && ` matching "${searchTerm}"`}
                        </div>
                    </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('user_id')}>
                                    <div className="flex items-center gap-2">
                                        User ID
                                        {sortBy === 'user_id' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => handleSort('bot_name')}>
                                    <div className="flex items-center gap-2">
                                        Bot
                                        {sortBy === 'bot_name' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Response
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('timestamp')}>
                                    <div className="flex items-center gap-2">
                                        Timestamp
                                        {sortBy === 'timestamp' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedMessages.length > 0 ? (
                                filteredAndSortedMessages.map((message: any, index: number) => (
                                    <tr key={message.id || index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="font-mono text-xs">
                                                {isPlaygroundUser(message.user_id) ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        🚀 {message.user_id}
                                                    </span>
                                                ) : (
                                                    message.user_id || 'Unknown'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {message.bot_name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                                            <div className="max-h-20 overflow-y-auto">
                                                {truncateText(message.message || 'No message', 150)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                                            <div className="max-h-20 overflow-y-auto">
                                                {truncateText(message.response || 'No response', 150)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {message.timestamp ? formatDate(message.timestamp) : 'Unknown'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            {playgroundMessageFilter === 'all' && 'No playground messages found'}
                                            {playgroundMessageFilter === 'byBot' && `No messages found for bot: ${selectedBotName}`}
                                            {playgroundMessageFilter === 'recent' && 'No recent playground messages found'}
                                            {playgroundMessageFilter === 'byUser' && `No activity found for user: ${selectedUserId}`}
                                            {searchTerm && ` matching "${searchTerm}"`}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Results Summary */}
            {filteredAndSortedMessages.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="text-sm text-gray-600 text-center">
                        Showing {filteredAndSortedMessages.length} of {getTotalMessages()} playground messages
                        {searchTerm && ` matching "${searchTerm}"`}
                        {playgroundMessageFilter === 'byBot' && ` from bot "${selectedBotName}"`}
                        {playgroundMessageFilter === 'recent' && ` (most recent ${recentMessageLimit})`}
                        {playgroundMessageFilter === 'byUser' && ` for user "${selectedUserId}"`}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPlaygroundMonitoring;
