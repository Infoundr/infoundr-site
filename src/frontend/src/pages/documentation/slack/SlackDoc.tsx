import React from 'react';
import { Link } from 'react-router-dom';

const SlackDoc: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-24 px-4 flex flex-col items-center">
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-6">
          <img src="/icons/slack_logo.png" alt="Slack" className="w-16 h-16 object-contain" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">Slack Integration</h1>
        <div className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
          Coming Soon
        </div>
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          We're working hard to bring your AI co-founder to Slack! 
          The integration will provide the same powerful automation capabilities 
          you can already experience on Discord.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Coming to Slack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">GitHub Automation</h3>
            <p className="text-gray-600">Manage repositories, create issues, and track pull requests</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Management</h3>
            <p className="text-gray-600">Create tasks, manage workflows, and track progress</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Calendar Management</h3>
            <p className="text-gray-600">Schedule meetings, set reminders, and manage appointments</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Email Automation</h3>
            <p className="text-gray-600">Draft emails, create templates, and automate outreach</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Try It Now on Discord</h3>
        <p className="text-blue-700 mb-4">
          While we're building the Slack integration, you can experience all these features right now on Discord!
        </p>
        <Link 
          to="/documentation/discord"
          className="inline-block px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors"
        >
          Try on Discord
        </Link>
      </div>

      <div className="mt-8">
        <Link 
          to="/documentation"
          className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
        >
          ← Back to Documentation
        </Link>
      </div>
    </div>
  </div>
);

export default SlackDoc; 