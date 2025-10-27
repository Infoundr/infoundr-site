import React, { useState, useEffect } from 'react';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/backend/backend.did.d';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AuthClient } from '@dfinity/auth-client';

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
    const [activeBot, setActiveBot] = useState<string | null>(null);
    const [userMessages, setUserMessages] = useState<ApiMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMainInterface, setShowMainInterface] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentResponse, setCurrentResponse] = useState<string | null>(null);

    // Helper function to get current principal
    const getCurrentPrincipal = async () => {
        try {
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();
            return identity.getPrincipal();
        } catch (error) {
            console.error('Error getting principal:', error);
            return null;
        }
    };

    const botSegments = [
        { name: 'InFoundr AI Co-founder', icon: '', color: 'purple' },
        { name: 'GitHub Assistant', icon: '', color: 'blue' },
        { name: 'Gmail Agent', icon: '', color: 'green' },
        { name: 'Calendar Agent', icon: '', color: 'orange' },
        { name: 'Task Automation', icon: '', color: 'indigo' }
    ];

    const examples = [
        {
            title: "Create a project plan",
            description: "Generate a comprehensive project roadmap and timeline",
            icon: ""
        },
        {
            title: "Review my GitHub issues", 
            description: "Analyze and prioritize issues in your repository",
            icon: ""
        },
        {
            title: "Draft an investor email",
            description: "Create professional emails for fundraising",
            icon: ""
        },
        {
            title: "Schedule team meetings",
            description: "Set up recurring meetings and reminders",
            icon: ""
        },
        {
            title: "Analyze market competition",
            description: "Research competitors and market positioning",
            icon: ""
        },
        {
            title: "Create user stories",
            description: "Generate detailed user stories for development",
            icon: ""
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
            // Fetch recent messages for the current user using the actor's principal
            const result = await actor.get_user_recent_messages(50);
            
            console.log('Frontend - Raw result from get_user_recent_messages:', result);
            
            if ('Ok' in result) {
                console.log('Frontend - Successfully fetched messages:', result.Ok);
                console.log('Frontend - Number of messages received:', result.Ok.length);
                console.log('Frontend - Messages details:', result.Ok.map(msg => ({
                    id: msg.id,
                    bot_name: msg.bot_name,
                    message: msg.message.substring(0, 50) + '...',
                    timestamp: msg.timestamp.toString()
                })));
                
                // Log unique bot names found in messages
                const uniqueBotNames = [...new Set(result.Ok.map(msg => msg.bot_name))];
                console.log('Frontend - Unique bot names in messages:', uniqueBotNames);
                console.log('Frontend - Expected bot names in segments:', botSegments.map(bot => bot.name));
                
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
        const filteredMessages = userMessages.filter(msg => msg.bot_name === botName);
        console.log(`Frontend - getBotMessages for "${botName}":`, {
            totalUserMessages: userMessages.length,
            filteredMessages: filteredMessages.length,
            messages: filteredMessages.map(msg => ({
                id: msg.id,
                bot_name: msg.bot_name,
                message: msg.message.substring(0, 50) + '...',
                timestamp: msg.timestamp.toString()
            }))
        });
        return filteredMessages;
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

    const currentBotMessages = activeBot ? getBotMessages(activeBot) : [];

    const handleExampleClick = (example: any) => {
        setSearchTerm(example.title);
        // Hide conversation history and scroll back to top
        setActiveBot(null);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    const handleChatInputClick = () => {
        // Clear current response and hide conversation history
        setCurrentResponse(null);
        setActiveBot(null);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    const handleShowPreviousMessages = () => {
        // Show the hidden sections by clearing the states that hide them
        setCurrentResponse(null);
        setIsTyping(false);
        setIsLoading(false);
        
        // Scroll to conversation history section
        setTimeout(() => {
            const conversationSection = document.getElementById('conversation-history');
            if (conversationSection) {
                conversationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleBotClick = (botName: string) => {
        console.log(`Frontend - handleBotClick for "${botName}"`);
        console.log('Frontend - Current userMessages:', userMessages.length);
        console.log('Frontend - Messages for this bot:', getBotMessages(botName).length);
        
        setActiveBot(botName);
        // Scroll to conversation history section
        setTimeout(() => {
            const conversationSection = document.getElementById('conversation-history');
            if (conversationSection) {
                conversationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleSendMessage = async (message: string) => {
        if (!actor || !message.trim()) return;

        try {
            setIsTyping(false);
            setIsLoading(true);
            setCurrentResponse(null);

            // Get the current principal
            const principal = await getCurrentPrincipal();
            if (!principal) {
                console.error('Could not get principal');
                setIsLoading(false);
                return;
            }

            // Call the API to get AI response
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiUrl = isLocal 
                ? 'http://localhost:5005' 
                : (import.meta.env.VITE_INFOUNDR_API_URL);
            const apiKey = import.meta.env.VITE_INFOUNDR_API_KEY;
            
            const response = await fetch(`${apiUrl}/api/infoundr_agent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                body: JSON.stringify({
                    message: message,
                    user_id: principal.toString(), // Use the authenticated user's principal ID
                    channel: 'mainsite'
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Log the response for testing
            console.log('API Response:', data);
            console.log('User Principal:', principal.toString());
            console.log('Message sent:', message);
            
            // Store the response for display
            setCurrentResponse(data.text || 'No response received');
            
            // Store the message using the backend's store_api_message function
            // await storeMessageInBackend(message, data.text || 'No response received', data.bot_name || 'InFoundr AI', principal);
            
            // Refresh messages
            await fetchUserMessages();
            
        } catch (error) {
            console.error('Error sending message:', error);
            setCurrentResponse('Sorry, I encountered an error processing your request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // const storeMessageInBackend = async (message: string, response: string, botName: string, principal: any) => {
    //     if (!actor) return;

    //     try {
    //         // Store the message using the backend's store_api_message function with Principal identifier
    //         const result = await actor.store_api_message(
    //             { Principal: principal }, // Use Principal identifier
    //             message,
    //             response,
    //             botName,
    //             [] // metadata as empty array
    //         );

    //         if ('Ok' in result) {
    //             console.log('Message stored successfully:', result.Ok);
    //         } else {
    //             console.error('Failed to store message:', result.Err);
    //         }
    //     } catch (error) {
    //         console.error('Error storing message:', error);
    //     }
    // };


    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Main Chat Interface */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-6xl">
                    {/* Main Input Area */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1 flex items-center space-x-3">
                                <input
                                    type="text"
                                    placeholder="Ask InFoundr to build, fix bugs, explore"
                                    className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setIsTyping(e.target.value.length > 0);
                                    }}
                                    onClick={handleChatInputClick}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(searchTerm);
                                            setSearchTerm('');
                                            setIsTyping(false);
                                        }
                                    }}
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => {
                                        if (searchTerm.trim()) {
                                            handleSendMessage(searchTerm);
                                            setSearchTerm('');
                                            setIsTyping(false);
                                        }
                                    }}
                                    disabled={isLoading || !searchTerm.trim()}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            <span>Send</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            {/* <div className="flex items-center space-x-2">
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
                            </div> */}
                        </div>
                    </div>

                    {/* Suggested Actions */}
                    <div className={`text-center mb-8 transition-all duration-500 ease-in-out ${
                        isTyping || isLoading || currentResponse 
                            ? 'opacity-0 transform translate-y-4 pointer-events-none h-0 overflow-hidden' 
                            : 'opacity-100 transform translate-y-0'
                    }`}>
                        <p className="text-gray-600 mb-6">Try these examples to get started</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {examples.map((example, index) => (
                                <button 
                                    key={index}
                                    onClick={() => handleExampleClick(example)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-lg">{example.icon}</span>
                                    <span>{example.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bot Segments */}
                    <div id="conversation-history" className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 transition-all duration-500 ease-in-out ${
                        isTyping || isLoading || currentResponse 
                            ? 'opacity-0 transform translate-y-4 pointer-events-none h-0 overflow-hidden' 
                            : 'opacity-100 transform translate-y-0'
                    }`}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Your Conversation History</h3>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {botSegments.map((bot) => {
                                const botMessages = getBotMessages(bot.name);
                                console.log(`Frontend - Rendering bot segment "${bot.name}" with ${botMessages.length} messages`);
                                return (
                                    <button
                                        key={bot.name}
                                        onClick={() => handleBotClick(bot.name)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
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

                    {/* Loading Component */}
                    {isLoading && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex items-center justify-center space-x-3">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-gray-600 font-medium">InFoundr AI is thinking...</span>
                            </div>
                        </div>
                    )}

                    {/* Current Response Display */}
                    {currentResponse && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 text-sm font-medium">🤖</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            InFoundr AI
                                        </span>
                                    </div>
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h1: ({ children, ...props }) => (
                                                    <h1 className="text-xl font-bold text-gray-900 mb-3" {...props}>
                                                        {children}
                                                    </h1>
                                                ),
                                                h2: ({ children, ...props }) => (
                                                    <h2 className="text-lg font-semibold text-gray-900 mb-2 mt-4" {...props}>
                                                        {children}
                                                    </h2>
                                                ),
                                                h3: ({ children, ...props }) => (
                                                    <h3 className="text-base font-semibold text-gray-900 mb-2 mt-3" {...props}>
                                                        {children}
                                                    </h3>
                                                ),
                                                p: ({ children, ...props }) => (
                                                    <p className="text-gray-700 mb-3 leading-relaxed" {...props}>
                                                        {children}
                                                    </p>
                                                ),
                                                ul: ({ children, ...props }) => (
                                                    <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1" {...props}>
                                                        {children}
                                                    </ul>
                                                ),
                                                ol: ({ children, ...props }) => (
                                                    <ol className="list-decimal list-inside text-gray-700 mb-3 space-y-1" {...props}>
                                                        {children}
                                                    </ol>
                                                ),
                                                li: ({ children, ...props }) => (
                                                    <li className="text-gray-700" {...props}>
                                                        {children}
                                                    </li>
                                                ),
                                                code: ({ children, ...props }) => (
                                                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                                        {children}
                                                    </code>
                                                ),
                                                pre: ({ children, ...props }) => (
                                                    <pre className="bg-gray-100 text-gray-800 p-3 rounded-lg overflow-x-auto mb-3" {...props}>
                                                        {children}
                                                    </pre>
                                                ),
                                                blockquote: ({ children, ...props }) => (
                                                    <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 mb-3" {...props}>
                                                        {children}
                                                    </blockquote>
                                                ),
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
                                                ),
                                                strong: ({ children, ...props }) => (
                                                    <strong className="font-semibold text-gray-900" {...props}>
                                                        {children}
                                                    </strong>
                                                ),
                                                em: ({ children, ...props }) => (
                                                    <em className="italic text-gray-700" {...props}>
                                                        {children}
                                                    </em>
                                                )
                                            }}
                                        >
                                            {currentResponse}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Check Previous Messages Link - Independent */}
                    {currentResponse && (
                        <div className="text-center mb-8">
                            <button
                                onClick={handleShowPreviousMessages}
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="font-medium">Check previous messages</span>
                            </button>
                        </div>
                    )}

                    {/* Recent Messages - Show with smooth transitions */}
                    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-500 ease-in-out ${
                        activeBot && currentBotMessages.length > 0 
                            ? 'opacity-100 transform translate-y-0' 
                            : 'opacity-0 transform translate-y-4 pointer-events-none h-0 overflow-hidden'
                    }`}>
                        {activeBot && currentBotMessages.length > 0 && (
                            <>
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-800 text-center">
                                            Recent Messages from {activeBot}
                                        </h3>
                                        <div className="text-sm text-gray-500">
                                            {currentBotMessages.length} messages
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="max-h-96 overflow-y-auto">
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
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;