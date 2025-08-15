import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const DiscordLayout: React.FC = () => {
  const location = useLocation();
  
  const agents = [
    { name: 'GitHub Agent', path: '/documentation/discord/github', id: 'github' },
    { name: 'Project Management', path: '/documentation/discord/project-management', id: 'project-management' },
    { name: 'Calendar Agent', path: '/documentation/discord/calendar', id: 'calendar' },
    { name: 'Email Agent', path: '/documentation/discord/email', id: 'email' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
              <img src="/icons/discord-logo.png" alt="Discord" className="w-16 h-16 object-contain" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">Discord Bot Documentation</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to use our Discord bot to automate tasks, manage projects, and get AI-powered assistance directly in your server.
          </p>
        </div>

        {/* Getting Started Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Invite the Bot</h3>
              <p className="text-gray-600 mb-4">Add our Discord bot to your server using the invite link below.</p>
              <a 
                href="https://discord.infoundr.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors"
              >
                Invite to Discord
              </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Essential Commands</h3>
              <p className="text-gray-600 mb-4">Start with these essential commands to get familiar with the bot.</p>
            </div>
          </div>
          
          {/* Command Examples with Screenshots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Command 1:</h4>
                <div className="bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm text-gray-700 mb-3">
                  /help
                </div>
                <p className="text-gray-600 text-sm mb-4">Get started with basic commands and bot functionality</p>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Bot Response:</h5>
                <img 
                  src="/images/documentation/discord/01-help.png" 
                  alt="Response to /help" 
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Command 2:</h4>
                <div className="bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm text-gray-700 mb-3">
                  @Infoundr hi there, how can you help me today?
                </div>
                <p className="text-gray-600 text-sm mb-4">Start a conversation with the AI co-founder</p>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Bot Response:</h5>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    The bot will respond as "Infoundr" with a comprehensive introduction explaining its capabilities. 
                    It will mention that it can assist with startup-related topics like fundraising, team building, market research, 
                    operational tasks (contract review, financial reporting, investor updates), and business decision simulation. 
                    The response will be conversational and end by asking what challenges you're facing and how it can help.
                  </p>
                  
                  <div className="mt-4">
                    <h6 className="text-sm font-semibold text-gray-700 mb-3">Example Response:</h6>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">🤖</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm max-w-sm">
                          <p className="text-sm font-semibold text-purple-600 mb-1">Infoundr</p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Hi! I'm thrilled to be your AI co-founder. I can assist you with a wide range of startup-related topics. 
                            Whether you need guidance on fundraising, team building, or market research, I'm here to provide personalized 
                            advice and support. I can also help you with operational tasks such as contract review, financial reporting, 
                            and investor updates. Plus, I can simulate business decisions to help you make informed choices. 
                            What's on your mind today? What challenges are you facing, and how can I help you overcome them?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Navigation */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">AI-Powered Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <Link 
                key={agent.id}
                to={agent.path}
                className={`p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg ${
                  location.pathname === agent.path 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                    location.pathname === agent.path 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className="text-2xl font-bold">
                      {agent.id === 'github' ? '🔧' : 
                       agent.id === 'project-management' ? '📋' : 
                       agent.id === 'calendar' ? '📅' : '📧'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Individual Agent Content */}
        <Outlet />
      </div>
    </div>
  );
};

export default DiscordLayout; 