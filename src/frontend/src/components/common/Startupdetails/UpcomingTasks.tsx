import React from 'react';
import { Video, Briefcase, Mic, BarChart } from 'lucide-react';

const tasks = [
  {
    icon: <Video className="h-4 w-4 text-indigo-500" />,
    title: 'Submit MVP Demo Video',
    detail: 'Record a 3-minute demo of your product’s core functionality',
    assignee: 'Sara Chen',
    badge: 'Due Tomorrow',
    badgeColor: 'bg-red-100 text-red-600',
    due: 'Jul 16, 2023',
  },
  {
    icon: <Briefcase className="h-4 w-4 text-amber-500" />,
    title: 'Investor Pitch Rehearsal',
    detail: 'Practice the investor pitch with program mentors',
    assignee: 'Michael Wu',
    badge: '3 Days Left',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    due: 'Jul 19, 2023',
  },
  {
    icon: <Mic className="h-4 w-4 text-purple-500" />,
    title: 'Demo Day Milestone',
    detail: 'Final presentation to investors and industry partners',
    assignee: 'Edith Tanui',
    badge: '2 Weeks Left',
    badgeColor: 'bg-purple-100 text-purple-700',
    due: 'Jul 31, 2023',
  },
  {
    icon: <BarChart className="h-4 w-4 text-gray-600" />,
    title: 'Financial Model Update',
    detail: 'Revise projections based on mentor feedback',
    assignee: '',
    badge: 'Next Week',
    badgeColor: 'bg-gray-100 text-gray-600',
    due: '',
  },
];

const UpcomingTasks = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-base font-semibold text-gray-900">Upcoming Tasks & Milestones</h3>
      <button className="text-sm text-indigo-600 hover:underline">View All</button>
    </div>
    <ul className="space-y-4">
      {tasks.map((task, idx) => (
        <li key={idx} className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="mt-1">{task.icon}</div>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-800">{task.title}</p>
              <p className="text-sm text-gray-500">{task.detail}</p>
              {task.assignee && <p className="text-sm text-gray-400">👤 {task.assignee}</p>}
            </div>
          </div>
          <div className="text-right text-sm mt-1 whitespace-nowrap">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${task.badgeColor}`}>
              {task.badge}
            </span>
            {task.due && (
              <p className="text-xs text-gray-400 mt-1">{task.due}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default UpcomingTasks;
