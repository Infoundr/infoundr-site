import React from 'react';
import { BadgeCheck, FileText, ListChecks } from 'lucide-react';

const EngagementStats = () => {
  const stats = [
    {
      title: 'Total Logins',
      value: 27,
      icon: <BadgeCheck className="h-4 w-4 text-muted-foreground" />,
      change: '↑ 12% vs last month',
      changeColor: 'text-green-600',
    },
    {
      title: 'Documents Submitted',
      value: 8,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      change: '↑ 6% vs last month',
      changeColor: 'text-green-600',
    },
    {
      title: 'Tasks Completed',
      value: 14,
      icon: <ListChecks className="h-4 w-4 text-muted-foreground" />,
      change: '↓ 3% vs last month',
      changeColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
        >
          <div className="flex items-center text-sm text-gray-500 mb-1">
            {stat.icon}
            <span className="ml-2">{stat.title}</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
          <p className={`text-xs mt-1 ${stat.changeColor}`}>{stat.change}</p>
        </div>
      ))}
    </div>
  );
};

export default EngagementStats;
