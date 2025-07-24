import React from 'react';
import Card from '../../components/common/Card';

const SlackDoc: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-20 px-4">
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-[#EDE9FE] p-3 rounded-lg">
            <img src="/icons/slack_logo.png" alt="Slack" className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-purple-800">Slack Bot Documentation</h1>
        </div>
        <p className="mb-6 text-lg text-gray-700">Learn how to use the Slack bot to enhance your workspace experience.</p>
        <ol className="list-decimal list-inside space-y-3 text-gray-800">
          <li>Invite the bot to your Slack workspace.</li>
          <li>Use <span className="bg-gray-100 px-2 py-1 rounded text-purple-700 font-mono">/bot-help</span> to see available commands.</li>
          <li>Interact with the bot in any channel or direct message.</li>
          <li>Configure bot settings as needed in your Slack app settings.</li>
          <li>For more help, type <span className="bg-gray-100 px-2 py-1 rounded text-purple-700 font-mono">/bot-support</span>.</li>
        </ol>
      </Card>
    </div>
  </div>
);

export default SlackDoc; 