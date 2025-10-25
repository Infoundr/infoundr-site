import React, { useState, useEffect } from 'react';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/backend/backend.did.d';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatProps {
    actor: ActorSubclass<_SERVICE> | null;
}

interface ApiMessage {
    id?: string;
    user_id: string;
    bot_name: string;
    message: string;
    response: string;
    timestamp: bigint;
}

const Chat: React.FC<ChatProps> = ({ actor }) => {
    const [activeBot, setActiveBot] = useState<string>('InFoundr AI Co-founder');
    const [userMessages, setUserMessages] = useState<ApiMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const botSegments = [
        { name: 'InFoundr AI Co-founder', icon: '🤖', color: 'purple' },
        { name: 'GitHub Assistant', icon: '⚡', color: 'blue' },
        { name: 'Gmail Agent', icon: '📧', color: 'green' },
        { name: 'Calendar Manager', icon: '📅', color: 'orange' },
        { name: 'Task Automation', icon: '✅', color: 'indigo' }
    ];

    const examples = [
        {
            title: "Create a project plan",
            description: "Generate a comprehensive project roadmap and timeline",
            icon: "📋"
        },
        {
            title: "Review my GitHub issues", 
            description: "Analyze and prioritize issues in your repository",
            icon: "🔍"
        },
        {
            title: "Draft an investor email",
            description: "Create professional emails for fundraising",
            icon: "📧"
        },
        {
            title: "Schedule team meetings",
            description: "Set up recurring meetings and reminders",
            icon: "📅"
        },
        {
            title: "Analyze market competition",
            description: "Research competitors and market positioning",
            icon: "📊"
        },
        {
            title: "Create user stories",
            description: "Generate detailed user stories for development",
            icon: "👥"
        }
    ];

    useEffect(() => {
        if (actor) {
            fetchUserMessages();
        }
    }, [actor]);

    const fetchUserMessages = async () => {
        if (!actor) return;
        
        try {
            setLoading(true);
            // Fetch recent messages for the current user using the new user function
            const result = await actor.get_user_recent_messages(50);
            
            if ('Ok' in result) {
                setUserMessages(result.Ok);
            } else {
                console.error('Error fetching user messages:', result.Err);
                // Fallback to empty array if there's an error
                setUserMessages([]);
            }
        } catch (error) {
            console.error('Error fetching user messages:', error);
            // Fallback to empty array if there's an error
            setUserMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const getBotMessages = (botName: string) => {
        return userMessages.filter(msg => msg.bot_name === botName);
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

    const getBotColor = (color: string) => {
        const colors = {
            purple: 'bg-purple-100 text-purple-800',
            blue: 'bg-blue-100 text-blue-800',
            green: 'bg-green-100 text-green-800',
            orange: 'bg-orange-100 text-orange-800',
            indigo: 'bg-indigo-100 text-indigo-800'
        };
        return colors[color as keyof typeof colors] || colors.purple;
    };

    const currentBotMessages = getBotMessages(activeBot);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Main Chat Interface */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-6xl">
                    {/* Main Input Area */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Ask InFoundr to build, fix bugs, explore"
                                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                    </div>

                    {/* Bot Segments */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your AI Assistants</h3>
                        <div className="flex flex-wrap gap-3">
                            {botSegments.map((bot) => {
                                const botMessages = getBotMessages(bot.name);
                                return (
                                    <button
                                        key={bot.name}
                                        onClick={() => setActiveBot(bot.name)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                                            activeBot === bot.name
                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        <span className="text-lg">{bot.icon}</span>
                                        <span className="font-medium">{bot.name}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBotColor(bot.color)}`}>
                                            {botMessages.length}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Messages for Active Bot */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Recent Messages from {activeBot}
                                    </h3>
                                    <div className="text-sm text-gray-500">
                                        {currentBotMessages.length} messages
                                    </div>
                                </div>
                            </div>
                            
                            <div className="max-h-96 overflow-y-auto">
                                {currentBotMessages.length > 0 ? (
                                    <div className="divide-y divide-gray-200">
                                        {currentBotMessages.map((message, index) => (
                                            <div key={message.id || index} className="p-6 hover:bg-gray-50">
                                                <div className="flex items-start space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                            <span className="text-purple-600 text-sm font-medium">
                                                                {botSegments.find(bot => bot.name === message.bot_name)?.icon || '🤖'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBotColor(
                                                                botSegments.find(bot => bot.name === message.bot_name)?.color || 'purple'
                                                            )}`}>
                                                                {message.bot_name}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDate(message.timestamp)}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 mb-1">Your message:</p>
                                                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                                    {message.message}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 mb-1">Response:</p>
                                                                <div className="text-sm text-gray-700 bg-white border border-gray-200 p-3 rounded-lg">
                                                                    <ReactMarkdown 
                                                                        remarkPlugins={[remarkGfm]}
                                                                        components={{
                                                                            a: ({ href, children, ...props }) => (
                                                                                <a 
                                                                                    href={href} 
                                                                                    target="_blank" 
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-purple-600 hover:text-purple-800 underline"
                                                                                    {...props}
                                                                                >
                                                                                    {children}
                                                                                </a>
                                                                            )
                                                                        }}
                                                                    >
                                                                        {truncateText(message.response, 200)}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="text-gray-500">
                                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <p className="text-lg font-medium text-gray-900 mb-2">No messages yet</p>
                                            <p className="text-gray-600">Start a conversation with {activeBot} to see your messages here.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Suggested Actions */}
                    <div className="text-center mt-8">
                        <p className="text-gray-600 mb-6">Try these examples to get started</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {examples.map((example, index) => (
                                <button 
                                    key={index}
                                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-lg">{example.icon}</span>
                                    <span>{example.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
