import React from 'react';

const SlackGithubAgent: React.FC = () => {
  return (
    <div id="slack-github-agent" className="mb-12">
      <div className="bg-white rounded-3xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
            <span className="text-purple-600 font-bold text-xl">🔧</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">GitHub Repository Management (Slack)</h3>
            <p className="text-gray-600 text-lg">
              Manage GitHub repositories, issues, and pull requests directly from <strong>Slack</strong>
            </p>
          </div>
        </div>

        {/* Example Interactions + Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Side - Example Interactions */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Example Interactions</h4>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">"/github create issue login bug"</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">"/github list open pull requests"</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">"/github show unresolved issues"</p>
              </div>
            </div>
          </div>

          {/* Right Side - Flow */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Interaction Flow</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Type a Slack slash command (e.g., <code>/github</code>)</li>
              <li>The agent will ask for your GitHub token for authentication</li>
              <li>Specify which repository the agent should access</li>
              <li>The agent executes your request and posts results in Slack</li>
            </ol>
          </div>
        </div>

        {/* Example Images */}
        <div className="mb-6">
          <img
            src="/images/documentation/slack/02-github.png"
            alt="Slack GitHub Agent Example"
            className="w-full rounded-lg shadow-md"
          />
        </div>

        {/* Authentication Setup */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-4">GitHub Authentication Setup</h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-md font-semibold text-blue-700 mb-2">Getting Your GitHub Token</h5>
              <ol className="list-decimal list-inside space-y-2 text-blue-700 text-sm">
                <li>
                  Go to{' '}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    GitHub Settings → Developer Settings → Personal Access Tokens
                  </a>
                </li>
                <li>Click "Generate new token (classic)"</li>
                <li>Name it (e.g., "Infoundr Slack Bot")</li>
                <li>
                  Select scopes: <code className="bg-blue-100 px-2 py-1 rounded text-sm">repo</code>,{' '}
                  <code className="bg-blue-100 px-2 py-1 rounded text-sm">workflow</code>
                </li>
                <li>Click "Generate token"</li>
                <li>Copy the token immediately</li>
                <li>Provide it to the Slack bot when prompted</li>
              </ol>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Security Note:</strong> Keep your GitHub token secure and never share it publicly. The bot will
                only use it to access the repositories you specify.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlackGithubAgent;
