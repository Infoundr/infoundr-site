import React from 'react';

const activities = [
  { icon: '➕', color: 'text-green-500', text: 'TechFlow joined the program', time: '2 hours ago' },
  { icon: '📝', color: 'text-blue-500', text: 'DataSync updated their pitch deck', time: '5 hours ago' },
  { icon: '✉️', color: 'text-purple-500', text: 'Sent invite to CloudVenture', time: '1 day ago' },
  { icon: '🎓', color: 'text-yellow-500', text: 'AIStartup graduated successfully', time: '2 days ago' },
  { icon: '❗', color: 'text-red-400', text: 'MobileApp missed milestone', time: '3 days ago' },
];

const RecentActivity: React.FC = () => (
  <div className="bg-white rounded-xl shadow p-6 min-h-[350px]">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
    <ul className="space-y-4">
      {activities.map((activity, idx) => (
        <li key={idx} className="flex items-center gap-3">
          <span className={`text-xl ${activity.color}`}>{activity.icon}</span>
          <div>
            <div className="text-gray-700 font-medium">{activity.text}</div>
            <div className="text-xs text-gray-400">{activity.time}</div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default RecentActivity; 