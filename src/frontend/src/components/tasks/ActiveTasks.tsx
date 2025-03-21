import React from 'react';

const ActiveTasks: React.FC = () => {
  const tasks = [
    {
      name: 'Weekly Newsletter Campaign',
      description: 'Automated email sequence to 2.5k subscribers',
      status: 'Running',
      platform: 'Slack',
      nextRun: '2h',
      icon: '💬'
    },
    {
      name: 'Social Media Updates',
      description: 'Cross-platform content scheduling',
      status: 'Running',
      platform: 'Discord',
      nextRun: '45m',
      icon: '🔄'
    },
    {
      name: 'Data Backup',
      description: 'Daily system backup and verification',
      status: 'Paused',
      platform: 'Calendar',
      nextRun: 'Paused',
      icon: '💾'
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Active Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{task.icon}</span>
                  <h3 className="font-medium text-lg">{task.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{task.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {task.platform}
                  </span>
                  <span className="text-sm text-gray-500">
                    Next run: {task.nextRun}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                task.status === 'Running' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveTasks; 