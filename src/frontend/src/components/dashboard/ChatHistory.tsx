import React, { useEffect, useState } from 'react';
// import { ChatMessage } from '@/types/chat';     
import { getCurrentUser } from '../../services/auth';
import { _SERVICE } from "../../../../declarations/backend/backend.did";

interface Props {
    actor: _SERVICE;
}

const ChatHistory: React.FC<Props> = ({ actor }) => {
    console.log("Starting ChatHistory");
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                console.log("Fetching messages");
                const user = await getCurrentUser();
                console.log("User", user);
                if (user && user[0]) {
                    // Use get_chat_history with UserIdentifier.Principal
                    const chatHistory = await actor.get_chat_history({
                        Principal: user[0].principal
                    });
                    console.log("Chat history:", chatHistory);
                    setMessages(chatHistory);
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [actor]);

    if (loading) return <div>Loading chat history...</div>;

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