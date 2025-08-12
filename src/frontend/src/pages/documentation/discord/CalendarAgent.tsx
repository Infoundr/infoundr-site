import React from 'react';

const CalendarAgent: React.FC = () => {
  return (
    <div id="calendar-agent" className="mb-12">
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
            <span className="text-purple-600 font-bold text-xl">📅</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Calendar Management with Google</h3>
            <p className="text-gray-600 text-lg">Schedule meetings, set reminders, and manage your calendar directly from Discord</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Example Interactions</h4>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">"schedule a meeting with the team tomorrow at 2 PM"</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">"set a reminder for investor pitch on Friday"</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">"what meetings do I have this week"</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Interaction Flow</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>You provide a statement about what you want to do</li>
              <li>The agent will ask you to sign in with your Google account</li>
              <li>Complete the Google OAuth authentication process</li>
              <li>The agent will manage your calendar and schedule events</li>
            </ol>
          </div>
        </div>
        
        <div className="mb-6">
          <img 
            src="/images/documentation/discord/calendar-agent-1.png" 
            alt="Calendar Agent Example" 
            className="w-full rounded-lg shadow-md"
          />
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-orange-800 mb-4">Google Calendar Authentication</h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-md font-semibold text-orange-700 mb-2">Signing in with Google</h5>
              <ol className="list-decimal list-inside space-y-2 text-orange-700 text-sm">
                <li>When prompted, click the "Sign in with Google" button</li>
                <li>Choose your Google account from the popup</li>
                <li>Grant permission for the bot to access your Google Calendar</li>
                <li>You'll be redirected back to Discord</li>
                <li>The agent will now have access to manage your calendar</li>
              </ol>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Google OAuth is more secure than tokens. You can revoke access anytime from your Google Account settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarAgent; 