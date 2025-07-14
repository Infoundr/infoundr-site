import React from 'react';
import { CheckCircle, Rocket, Users, MessageCircle, FileText } from 'lucide-react';

const activities = [
  {
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    description: 'Submitted Financial Projections',
    uploader: 'Uploaded by Sara Chen',
    time: '2h ago',
  },
  {
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    description: 'Completed Product Roadmap task',
    uploader: 'Marked as complete by Malcolm Wu',
    time: '5h ago',
  },
  {
    icon: <Users className="h-4 w-4 text-blue-500" />,
    description: 'Attended Mentor Session',
    uploader: 'With Alex Johnson (Product Strategy)',
    time: 'Yesterday',
  },
  {
    icon: <MessageCircle className="h-4 w-4 text-yellow-500" />,
    description: 'Left Feedback on Pitch Deck',
    uploader: 'In progress deck by Emily Davis',
    time: '2 days ago',
  },
  {
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    description: 'Submitted Market Analysis',
    uploader: 'Uploaded by Sara Chen',
    time: '3 days ago',
  },
];

const RecentActivity = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
      <button className="text-sm text-indigo-600 hover:underline">View All</button>
    </div>
    <ul className="space-y-4">
      {activities.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <div className="mt-1">{item.icon}</div>
          <div className="flex-1">
            <p className="text-sm text-gray-800 font-medium">{item.description}</p>
            <p className="text-sm text-gray-500">{item.uploader}</p>
          </div>
          <div className="text-xs text-gray-400 whitespace-nowrap mt-1">{item.time}</div>
        </li>
      ))}
    </ul>
  </div>
);

export default RecentActivity;
