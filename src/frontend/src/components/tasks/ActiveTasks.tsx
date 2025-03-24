import React from 'react';
import Button from '../common/Button';

const ActiveTasks: React.FC = () => {
  const tasks = [
    {
      name: 'Weekly Newsletter Campaign',
      description: 'Automated email campaign for weekly updates',
      status: 'Running',
      platform: 'Email',
      nextRun: '2h 15m',
      iconSrc: '/icons/mail.png'
    },
    {
      name: 'Social Media Updates',
      description: 'Schedule and post content across platforms',
      status: 'Scheduled',
      platform: 'Social',
      nextRun: '4h 30m',
      iconSrc: '/icons/social.png'
    },
    {
      name: 'Data Backup',
      description: 'Automated backup of critical business data',
      status: 'Paused',
      platform: 'System',
      nextRun: '12h 45m',
      iconSrc: '/icons/backup.png'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#EDE9FE] p-3 rounded-lg">
            <img src="/icons/tasks.png" alt="" className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold">Active Tasks</h2>
        </div>
      </div>
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-[#EDE9FE] p-3 rounded-lg">
                  <img src={task.iconSrc} alt="" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">{task.name}</h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>{task.platform}</span>
                    <span>Next run: {task.nextRun}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  task.status === 'Running' ? 'bg-green-100 text-green-800' :
                  task.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {task.status}
                </span>
                <Button variant="secondary" className="text-sm">
                  Edit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveTasks; 