import React from 'react';
import TaskStats from '../components/tasks/TaskStats';
import AIRecommendations from '../components/tasks/AIRecommendations';
import ActiveTasks from '../components/tasks/ActiveTasks';
import QuickTemplates from '../components/tasks/QuickTemplates';
import Button from '../components/common/Button';

const Tasks: React.FC = () => {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Task Automation Hub</h1>
          <span className="bg-[#7C3AED] text-white text-xs px-2 py-1 rounded-full">Beta</span>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="primary"
            className="flex items-center gap-2"
          >
            <span>+ New Task</span>
          </Button>
          {/* <button className="p-2 rounded-full bg-gray-100">
            <img 
              src="https://github.com/identicons/jasonlong.png"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          </button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <TaskStats />
      </div>

      <div className="mb-8">
        <AIRecommendations />
      </div>

      <div className="mb-8">
        <ActiveTasks />
      </div>

      <div>
        <QuickTemplates />
      </div>
    </div>
  );
};

export default Tasks; 