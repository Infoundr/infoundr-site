import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../declarations/backend/backend.did.d';
import Button from '../../components/common/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AdminContext {
    actor: ActorSubclass<_SERVICE> | null;
    currentPrincipal: string;
}

const AdminApiMessages: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { actor, currentPrincipal } = useOutletContext<AdminContext>();
    
    // API message management state
    const [allApiMessages, setAllApiMessages] = useState<any[]>([]);
    const [apiMessagesByBot, setApiMessagesByBot] = useState<any[]>([]);
    const [recentApiMessages, setRecentApiMessages] = useState<any[]>([]);
    const [selectedBotName, setSelectedBotName] = useState<string>("");
    const [recentMessageLimit, setRecentMessageLimit] = useState<number>(50);
    const [showApiMessages, setShowApiMessages] = useState<boolean>(false);
    const [apiMessageFilter, setApiMessageFilter] = useState<'all' | 'byBot' | 'recent'>('all');
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'timestamp' | 'bot_name' | 'user_id'>('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        if (actor) {
            // Initialize with recent messages by default
            fetchRecentApiMessages(recentMessageLimit);
        }
    }, [actor]);

    const fetchApiMessagesByBot = async (botName: string) => {
        if (!actor) return;
        
        try {
            console.log('Fetching API messages for bot:', botName);
            console.log('Current Principal:', currentPrincipal);
            
            const result = await actor.admin_get_api_messages_by_bot(botName);
            console.log('API messages by bot result:', result);
            
            if ('Ok' in result) {
                setApiMessagesByBot(result.Ok);
                setApiMessageFilter('byBot');
            } else {
                alert(`Error fetching API messages by bot: ${result.Err}`);
            }
        } catch (error) {
            console.error('Error fetching API messages by bot:', error);
            alert('Error fetching API messages by bot');
        }
    };

    const fetchAllApiMessages = async () => {
        if (!actor) return;
        
        try {
            console.log('Fetching all API messages');
            console.log('Current Principal:', currentPrincipal);
            
            const result = await actor.admin_get_all_api_messages();
            console.log('All API messages result:', result);
            
            if ('Ok' in result) {
                setAllApiMessages(result.Ok);
                setApiMessageFilter('all');
            } else {
                alert(`Error fetching all API messages: ${result.Err}`);
            }
        } catch (error) {
            console.error('Error fetching all API messages:', error);
            alert('Error fetching all API messages');
        }
    };

    const fetchRecentApiMessages = async (limit: number) => {
        if (!actor) return;
        
        try {
            console.log('Fetching recent API messages with limit:', limit);
            console.log('Current Principal:', currentPrincipal);
            
            const result = await actor.admin_get_recent_api_messages(limit);
            console.log('Recent API messages result:', result);
            
            if ('Ok' in result) {
                setRecentApiMessages(result.Ok);
                setApiMessageFilter('recent');
            } else {
                alert(`Error fetching recent API messages: ${result.Err}`);
            }
        } catch (error) {
            console.error('Error fetching recent API messages:', error);
            alert('Error fetching recent API messages');
        } finally {
            setLoading(false);
        }
    };

    const handleApiMessageFilter = (filter: 'all' | 'byBot' | 'recent') => {
        setApiMessageFilter(filter);
        
        if (filter === 'all') {
            fetchAllApiMessages();
        } else if (filter === 'byBot' && selectedBotName) {
            fetchApiMessagesByBot(selectedBotName);
        } else if (filter === 'recent') {
            fetchRecentApiMessages(recentMessageLimit);
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

    // Get current messages based on filter
    const getCurrentMessages = () => {
        switch (apiMessageFilter) {
            case 'all': return allApiMessages;
            case 'byBot': return apiMessagesByBot;
            case 'recent': return recentApiMessages;
            default: return recentApiMessages;
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
        switch (apiMessageFilter) {
            case 'all': return allApiMessages.length;
            case 'byBot': return apiMessagesByBot.length;
            case 'recent': return recentApiMessages.length;
            default: return 0;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">API Message Management</h1>
                    <p className="text-gray-600">Monitor and analyze bot conversations and API interactions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {getTotalMessages()} Messages
                    </div>
                </div>
            </div>

            {/* API Message Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <Button
                        variant="primary"
                        className="!bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                        onClick={() => handleApiMessageFilter('all')}
                    >
                        View All API Messages ({allApiMessages.length})
                    </Button>
                    
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Enter bot name (e.g., Benny, Uncle, Dean)"
                            value={selectedBotName}
                            onChange={(e) => setSelectedBotName(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <Button
                            variant="secondary"
                            onClick={() => handleApiMessageFilter('byBot')}
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
                            onClick={() => handleApiMessageFilter('recent')}
                        >
                            Recent Messages
                        </Button>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                            Search Messages
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

            {/* API Messages Display */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                            {apiMessageFilter === 'all' && 'All API Messages'}
                            {apiMessageFilter === 'byBot' && `API Messages from ${selectedBotName}`}
                            {apiMessageFilter === 'recent' && `Recent API Messages (${recentMessageLimit})`}
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
                                                {message.user_id || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {message.bot_name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                                            <div className="max-h-20 overflow-y-auto prose prose-sm max-w-none">
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        a: ({ href, children, ...props }) => (
                                                            <a 
                                                                href={href} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 underline"
                                                                {...props}
                                                            >
                                                                {children}
                                                            </a>
                                                        )
                                                    }}
                                                >
                                                    {truncateText(message.message || 'No message', 150)}
                                                </ReactMarkdown>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                                            <div className="max-h-20 overflow-y-auto prose prose-sm max-w-none">
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        a: ({ href, children, ...props }) => (
                                                            <a 
                                                                href={href} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 underline"
                                                                {...props}
                                                            >
                                                                {children}
                                                            </a>
                                                        )
                                                    }}
                                                >
                                                    {truncateText(message.response || 'No response', 150)}
                                                </ReactMarkdown>
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
                                            {apiMessageFilter === 'all' && 'No API messages found'}
                                            {apiMessageFilter === 'byBot' && `No messages found for bot: ${selectedBotName}`}
                                            {apiMessageFilter === 'recent' && 'No recent messages found'}
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
                        Showing {filteredAndSortedMessages.length} of {getTotalMessages()} messages
                        {searchTerm && ` matching "${searchTerm}"`}
                        {apiMessageFilter === 'byBot' && ` from bot "${selectedBotName}"`}
                        {apiMessageFilter === 'recent' && ` (most recent ${recentMessageLimit})`}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApiMessages; 