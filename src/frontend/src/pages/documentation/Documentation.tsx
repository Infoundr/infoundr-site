import React from 'react';
import { Link } from 'react-router-dom';

const docs = [
  {
    name: 'Slack Bot',
    url: '/documentation/slack',
    icon: '/icons/slack_logo.png',
    description: 'Automate tasks, get instant advice, and streamline your workspace with our Slack bot.'
  },
  {
    name: 'Discord Bot',
    url: '/documentation/discord',
    icon: '/icons/discord-logo.png',
    description: 'Collaborate, get AI support, and build your community with our Discord bot.'
  },
  {
    name: 'OpenChat Bot',
    url: '/documentation/openchat',
    icon: '/icons/openchat.png',
    description: 'Chat with AI advisors, manage tasks, and track progress in OpenChat.'
  }
];

const Documentation: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-24 px-4 flex flex-col items-center">
    <div className="max-w-3xl w-full text-center mb-16">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">Documentation</h1>
      <p className="text-lg sm:text-xl text-gray-600 mb-8">Guides and resources for integrating and using our Slack, Discord, and OpenChat bots.</p>
    </div>
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
      {docs.map((doc) => (
        <Link to={doc.url} key={doc.name} className="group">
          <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center transition-all duration-200 hover:shadow-2xl hover:-translate-y-2 cursor-pointer border border-transparent group-hover:border-purple-400">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-purple-100 to-purple-200">
              <img src={doc.icon} alt={doc.name} className="w-14 h-14 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-700">{doc.name}</h2>
            <p className="text-gray-600 text-base mb-6">{doc.description}</p>
            <span className="inline-block px-6 py-2 rounded-full bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-colors">View Documentation</span>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default Documentation; 