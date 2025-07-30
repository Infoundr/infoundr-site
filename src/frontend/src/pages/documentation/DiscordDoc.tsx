import React from 'react';
import Card from '../../components/common/Card';

const DiscordDoc: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-20 px-4">
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-[#DBEAFE] p-3 rounded-lg">
            <img src="/icons/discord-logo.png" alt="Discord" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-purple-800">Discord Bot Documentation</h1>
        </div>
        <p className="mb-6 text-lg text-gray-700">Learn how to use the Discord bot to enhance your server experience.</p>
        <ol className="list-decimal list-inside space-y-3 text-gray-800">
          <li>Invite the bot to your Discord server.</li>
          <li>Use <span className="bg-gray-100 px-2 py-1 rounded text-purple-700 font-mono">!bot help</span> to see available commands.</li>
          <li>Interact with the bot in any channel or direct message.</li>
          <li>Configure bot permissions as needed in your server settings.</li>
          <li>For more help, type <span className="bg-gray-100 px-2 py-1 rounded text-purple-700 font-mono">!bot support</span>.</li>
        </ol>
      </Card>
    </div>
  </div>
);

export default DiscordDoc; 