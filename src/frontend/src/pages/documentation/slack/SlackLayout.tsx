
import { Link, Outlet, useLocation } from 'react-router-dom';

const SlackLayout = () => {
  const location = useLocation();

  const agents = [
    { name: 'GitHub Agent', path: '/documentation/slack/github', id: 'github' },
    { name: 'Project Management', path: '/documentation/slack/project-management', id: 'project-management' },
    { name: 'Calendar Agent', path: '/documentation/slack/calendar', id: 'calendar' },
    { name: 'Email Agent', path: '/documentation/slack/email', id: 'email' }
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
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Slack Bot Documentation
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to use our Slack bot to automate tasks, manage projects, and get AI-powered assistance directly in your workspace.
          </p>
        </div>

        {/* Getting Started Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Install the App</h3>
              <p className="text-gray-600 mb-4">
                Add our Slack bot to your workspace using the install link below.
              </p>
              <a
                href="https://slack.infoundr.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition-colors"
              >
                Add to Slack
              </a>
            </div>
          </div>
        </div>

        {/* Command Examples with Screenshots */}
        <div className="flex justify-center mb-12">
          <div className="flex justify-center mb-12">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Command 1:</h4>
                <div className="bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm text-gray-700 mb-3">
                  @Infoundr hi there, how can you help me today?
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Start a conversation with the AI co-founder
                </p>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Bot Response:</h5>
                <img
                  src="/images/documentation/slack/01-getting-started.png"
                  alt="Slack Getting Started Example"
                  className="w-full rounded-lg shadow-md"
                />
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
                  <div
                    className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                      location.pathname === agent.path
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span className="text-2xl font-bold">
                      {agent.id === 'github'
                        ? '🔧'
                        : agent.id === 'project-management'
                        ? '📋'
                        : agent.id === 'calendar'
                        ? '📅'
                        : '📧'}
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

export default SlackLayout;
