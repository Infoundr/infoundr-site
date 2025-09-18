import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { ChatMessage } from '../../types/chat';

interface PlaygroundChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlaygroundChatModal: React.FC<PlaygroundChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with startup advice, business strategy, and more. What would you like to know?',
      timestamp: BigInt(Date.now() * 1_000_000),
      bot_name: 'AI Assistant'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: BigInt(Date.now() * 1_000_000)
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me help you with that. Based on my knowledge, here are some key insights...",
        "I understand your concern. Here's what I recommend based on best practices in the industry...",
        "Excellent point! Let me break this down for you with some actionable advice...",
        "I'd be happy to help you with that. Here are some strategies that have worked well for other startups...",
        "That's a common challenge many startups face. Here's how you can approach this effectively..."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: BigInt(Date.now() * 1_000_000),
        bot_name: 'AI Assistant'
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] min-h-screen"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] mx-4 flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <h2 className="text-xl font-semibold">AI Assistant Playground</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.role === 'assistant' && message.bot_name && (
                  <div className="text-xs font-medium text-purple-600 mb-1">
                    {message.bot_name}
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                }`}>
                  {new Date(Number(message.timestamp) / 1_000_000).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isTyping}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-3"
            >
              {isTyping ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </Button>
          </form>
          
          {/* Playground Notice */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              🚀 This is a playground demo. Responses are simulated for testing purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundChatModal;
