import React from 'react';

const ProjectManagementAgent: React.FC = () => {
  return (
    <div id="project-management-agent" className="mb-12">
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
            <span className="text-purple-600 font-bold text-xl">📋</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Project Management with Asana</h3>
            <p className="text-gray-600 text-lg">Create and manage projects, tasks, and workflows directly from Discord</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Example Interactions</h4>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">"create a task for marketing campaign"</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">"create a task for finishing pitch deck by tomorrow"</p>
                <p className="text-gray-500 text-xs mt-1">When you want to have a deadline</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">"create a task for community day poster design that is to be done by Joseph"</p>
                <p className="text-gray-500 text-xs mt-1">When you want to assign the task to someone</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Interaction Flow</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>You provide a statement of what you want to do</li>
              <li>The agent will ask for your Asana token for authentication</li>
              <li>Once authenticated, specify your project details</li>
              <li>The agent will create and manage your tasks</li>
            </ol>
          </div>
        </div>
        
        <div className="mb-6">
          <img 
            src="/images/documentation/discord/project-management-1.png" 
            alt="Project Management Agent Example" 
            className="w-full rounded-lg shadow-md"
          />
        </div>
        
        <div className="mb-6">
          <img 
            src="/images/documentation/discord/project-management-2.png" 
            alt="Project Management Agent Complete Flow" 
            className="w-full rounded-lg shadow-md"
          />
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-green-800 mb-4">Asana Authentication Setup</h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-md font-semibold text-green-700 mb-2">Getting Your Asana Access Token</h5>
              <ol className="list-decimal list-inside space-y-2 text-green-700 text-sm">
                <li>Go to <a href="https://app.asana.com/0/developer-console" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-semibold">Asana Developer Console</a></li>
                <li>Click "Create a Personal Access Token"</li>
                <li>Give your token a descriptive name (e.g., "Infoundr Discord Bot")</li>
                <li>Copy the generated token immediately</li>
                <li>Share the token with the Discord bot when prompted</li>
              </ol>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Security Note:</strong> Keep your Asana token secure and never share it publicly. The bot will only use it to access the projects you specify.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagementAgent; 