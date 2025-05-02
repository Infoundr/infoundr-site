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
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">AI Assistant Chat History</h2>
            <div className="space-y-4">
                {messages.map((message, index) => (
                    <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-gray-500">
                                {new Date(Number(message.timestamp) / 1_000_000).toLocaleString()}
                            </span>
                            {message.bot_name && (
                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                    {message.bot_name}
                                </span>
                            )}
                        </div>
                        {message.question_asked && (
                            <div className="bg-gray-50 p-3 rounded mb-2">
                                <p className="text-gray-700">Q: {message.question_asked}</p>
                            </div>
                        )}
                        <p className="text-gray-900">{message.content}</p>
                    </div>
                ))}
                {messages.length === 0 && (
                    <p className="text-gray-500 text-center">No chat history found</p>
                )}
            </div>
        </div>
    );
};

export default ChatHistory; 