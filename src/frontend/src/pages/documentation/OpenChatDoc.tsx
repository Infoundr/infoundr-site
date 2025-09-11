import React from 'react';
import Card from '../../components/common/Card';

const OpenChatDoc: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-20 px-4">
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-[#FEF9C3] p-3 rounded-lg">
            <img src="/icons/openchat.png" alt="OpenChat" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-purple-800">OpenChat Bot Documentation</h1>
        </div>
        <p className="mb-6 text-lg text-gray-700">Learn how to use the OpenChat bot to enhance your chat experience.</p>
        <ol className="list-decimal list-inside space-y-3 text-gray-800">
          <li>Add the bot to your OpenChat group.</li>
          <li>Use <span className="bg-gray-100 px-2 py-1 rounded text-purple-700 font-mono">/help</span> to see available commands.</li>
          <li>Interact with the bot in the group chat.</li>
          <li>Adjust bot settings in your group as needed.</li>
          <li>For more help, type <span className="bg-gray-100 px-2 py-1 rounded text-purple-700 font-mono">/support</span>.</li>
        </ol>
      </Card>
    </div>
  </div>
);

export default OpenChatDoc; 
