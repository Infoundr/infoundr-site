import React, { useEffect, useState } from 'react';
// import { ChatMessage } from '@/types/chat';     
import { getCurrentUser } from '../../../services/auth';
import { _SERVICE } from "../../../../../declarations/backend/backend.did";
import { mockChatHistory, useMockData as mockDataBoolean } from '../../../mocks/mockData';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface Props {
    actor: _SERVICE;
    useMockData?: boolean;
}

const ChatHistory: React.FC<Props> = ({ actor, useMockData = mockDataBoolean }) => {
    console.log("Starting ChatHistory");
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (useMockData) {
                    console.log("Using mock data directly");
                    // Use mock data directly
                    setMessages(mockChatHistory as any);
                    setLoading(false);
                    return;
                }

                const user = await getCurrentUser();
                if (user && user[0]) {
                    const chatHistory = await actor.get_chat_history({
                        Principal: user[0].principal
                    });
                    setMessages(chatHistory);
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [actor, useMockData]);

    console.log("Current messages state:", messages);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        AI Assistant Chat History
                    </span>
                </h2>
                <div className="bg-purple-50 rounded-full px-4 py-2 text-sm text-purple-700 font-medium">
                    {messages.length} Conversations
                </div>
            </div>
            
            <div className="space-y-6">
                {messages.map((message, index) => (
                    <div 
                        key={index} 
                        className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow duration-200 bg-gradient-to-r from-white to-gray-50"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                <span className="text-sm text-gray-600 font-medium">
                                    {new Date(Number(message.timestamp) / 1_000_000).toLocaleString()}
                                </span>
                            </div>
                            {message.bot_name && (
                                <span className="bg-purple-100 text-purple-800 text-sm font-medium px-4 py-1.5 rounded-full">
                                    {message.bot_name}
                                </span>
                            )}
                        </div>
                        {message.question_asked && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-purple-400">
                                <p className="text-gray-700 font-medium">
                                    <span className="text-purple-600">Q: </span>
                                    {message.question_asked}
                                </p>
                            </div>
                        )}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-gray-800 leading-relaxed">{message.content}</p>
                        </div>
                    </div>
                ))}
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">💬</div>
                        <p className="text-gray-500 text-lg">No chat history found yet</p>
                        <p className="text-gray-400 text-sm mt-2">Start a conversation with our AI Assistant</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatHistory; 