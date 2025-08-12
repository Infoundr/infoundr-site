import React from 'react';

const DiscordDoc: React.FC = () => {
  const gettingStartedCommands = [
    {
      command: '/help',
      description: 'Get started with basic commands and bot functionality',
      responseImage: '/images/documentation/discord/01-help.png'
    },
    {
      command: '@Infoundr hi there, how can you help me today?',
      description: 'Start a conversation with the AI co-founder',
      responseImage: '/images/documentation/discord/02-help.png'
    }
  ];

  const agents = [
    {
      name: 'Help Agent',
      description: 'Get started with basic commands and bot functionality',
      image: '/images/documentation/discord/01-help.png',
      commands: ['/help', '@Infoundr mention']
    },
    {
      name: 'GitHub Agent',
      description: 'Manage GitHub repositories, issues, and pull requests',
      image: '/images/documentation/discord/github-agent-1.png',
      commands: ['!github create', '!github issues', '!github pr']
    },
    {
      name: 'Project Management Agent',
      description: 'Create and manage projects, tasks, and workflows',
      image: '/images/documentation/discord/project-management-1.png',
      commands: ['!project create', '!project tasks', '!project status']
    },
    {
      name: 'Calendar Agent',
      description: 'Schedule meetings, set reminders, and manage your calendar',
      image: '/images/documentation/discord/calendar-agent-1.png',
      commands: ['!calendar schedule', '!calendar reminder', '!calendar view']
    },
    {
      name: 'Email Agent',
      description: 'Draft emails, manage templates, and automate outreach',
      image: '/images/documentation/discord/email-agent-1.png',
      commands: ['!email draft', '!email template', '!email send']
    }
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

        {/* Getting Started */}
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
            {gettingStartedCommands.map((cmd, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Command {index + 1}:</h4>
                  <div className="bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm text-gray-700 mb-3">
                    {cmd.command}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{cmd.description}</p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Bot Response:</h5>
                  {index === 0 ? (
                    <img 
                      src={cmd.responseImage} 
                      alt={`Response to ${cmd.command}`} 
                      className="w-full rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        The bot will respond as "Infoundr AI Co-founder" with a comprehensive introduction explaining its capabilities. 
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
                              <p className="text-sm font-semibold text-purple-600 mb-1">Infoundr AI Co-founder</p>
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
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Agents */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">AI-Powered Agents</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {agents.map((agent, index) => (
              <div key={agent.name} className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-lg">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{agent.name}</h3>
                    <p className="text-gray-600 mb-4">{agent.description}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <img 
                    src={agent.image} 
                    alt={`${agent.name} example`} 
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Commands:</h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.commands.map((command) => (
                      <span key={command} className="bg-gray-100 px-3 py-1 rounded-full text-sm font-mono text-gray-700">
                        {command}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Usage */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Custom Workflows</h3>
              <p className="text-gray-600 mb-4">Create custom automation workflows by combining multiple agents and commands.</p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm font-mono text-gray-700">!workflow create "Daily Standup"</p>
                <p className="text-sm font-mono text-gray-700">!workflow add github-issues</p>
                <p className="text-sm font-mono text-gray-700">!workflow schedule "0 9 * * 1-5"</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Integration Setup</h3>
              <p className="text-gray-600 mb-4">Connect your existing tools and services for seamless automation.</p>
              <div className="space-y-2">
                <div className="bg-gray-100 px-3 py-2 rounded font-mono text-sm">!connect github</div>
                <div className="text-sm font-mono text-gray-700">!connect calendar</div>
                <div className="bg-gray-100 px-3 py-2 rounded font-mono text-sm">!connect email</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordDoc; 