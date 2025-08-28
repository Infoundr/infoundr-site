import React from 'react';

const SlackDoc: React.FC = () => {
  const gettingStartedCommands = [
    {
      command: '/help',
      description: 'Get started with basic commands and bot functionality',
      responseImage: '/images/documentation/slack/01-getting-started.png'
    }
  ];

  const agents = [
    {
      name: 'GitHub Agent',
      description: 'Manage repositories, issues, and pull requests directly from Slack',
      image: '/images/documentation/slack/02-github.png',
      commands: ['create issue', 'list pull requests', 'show open issues']
    },
    {
      name: 'Project Management Agent',
      description: 'Create and manage projects, tasks, and workflows',
      image: '/images/documentation/slack/03-asana.png',
      commands: ['project create', 'project tasks', 'project status']
    },
    {
      name: 'Calendar Agent',
      description: 'Schedule meetings, set reminders, and manage your calendar',
      image: '/images/documentation/slack/04-calendar.png',
      commands: ['calendar schedule', 'calendar reminder', 'calendar view']
    },
    {
      name: 'Email Agent',
      description: 'Draft emails, manage templates, and automate outreach',
      image: '/images/documentation/slack/04-calendar.png',
      commands: ['email draft', 'email template', 'email send'],
      note: 'You will first be prompted to sign in with your Google account. If you already did this for the Calendar Agent, you won’t be prompted again.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
              <img src="/icons/slack_logo.png" alt="Slack" className="w-16 h-16 object-contain" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">Slack Bot Documentation</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to use our Slack bot to automate tasks, manage projects, and get AI-powered assistance directly in your workspace.
          </p>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Install the Bot</h3>
              <p className="text-gray-600 mb-4">Add our Slack bot to your workspace using the button below.</p>
              <a
                href="https://slack.infoundr.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition-colors"
              >
                Add to Slack
              </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Essential Command</h3>
              <p className="text-gray-600 mb-4">Start with this essential command to get familiar with the bot.</p>
            </div>
          </div>

          {/* Command Example with Screenshot */}
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
                  <img
                    src={cmd.responseImage}
                    alt={`Response to ${cmd.command}`}
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI-Powered Agents */}
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
                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.commands.map((command) => (
                      <span
                        key={command}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm font-mono text-gray-700"
                      >
                        {command}
                      </span>
                    ))}
                  </div>
                  {agent.note && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>Note:</strong> {agent.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlackDoc;

