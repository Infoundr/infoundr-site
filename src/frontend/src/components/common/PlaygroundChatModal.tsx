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
      content: 'Welcome to the InFoundr Playground! 🎉 I\'m your live AI Co-founder, connected to our real platform. I can help you with startup advice, business strategy, and even manage your GitHub, emails, calendar, and project tasks. Try asking me anything about your startup journey!',
      timestamp: BigInt(Date.now() * 1_000_000),
      bot_name: 'InFoundr AI Co-founder'
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

    try {
      // Determine API configuration based on environment
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocal 
        ? 'http://localhost:5005' 
        : (import.meta.env.VITE_INFOUNDR_AI_URL);
      const apiKey = import.meta.env.VITE_INFOUNDR_AI_KEY;
      
      // Call the real InFoundr API
      const response = await fetch(`${apiUrl}/api/infoundr_agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          message: inputMessage,
          user_id: 'playground_user_' + Date.now(), // Generate unique user ID for playground
          channel: 'playground'
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || 'I apologize, but I encountered an issue processing your request. Please try again.',
        timestamp: BigInt(Date.now() * 1_000_000),
        bot_name: data.bot_name || 'InFoundr AI'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('API Error:', error);
      
      // Fallback to demo responses if API fails
      const fallbackResponses = [
        "I'm experiencing some technical difficulties right now, but I'd love to help! In our full platform, I can provide personalized startup advice and integrate with your tools. For now, here are some general insights...",
        "I'm having trouble connecting to our servers at the moment. In the full InFoundr platform, I can analyze your specific situation and provide data-driven recommendations. Here's what I'd typically suggest...",
        "I'm temporarily unable to access our full capabilities, but I'm still here to help! In our complete system, I can manage your GitHub, emails, calendar, and project tasks. For this demo, here are some key strategies..."
      ];
      
      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: BigInt(Date.now() * 1_000_000),
        bot_name: 'InFoundr AI'
      };

      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
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
            <div>
              <h2 className="text-xl font-semibold">🚀 Playground Demo</h2>
              <p className="text-sm text-purple-100">Test our AI Assistant without installation</p>
            </div>
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
              onClick={handleSendMessage}
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium">
                🚀 <strong>Live Playground</strong> - Connected to real InFoundr AI
              </p>
              <p className="text-xs text-green-600 mt-1">
                This is our actual AI Assistant! Try asking about startup advice, GitHub tasks, or scheduling meetings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundChatModal;
