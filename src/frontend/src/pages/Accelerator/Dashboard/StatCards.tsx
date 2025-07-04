import React from 'react';

const stats = [
  {
    label: 'Total Startups',
    value: 127,
    change: '+12%',
    subtext: 'from last month',
    icon: '/icons/company.png',
    bg: 'bg-purple-100',
  },
  {
    label: 'Invites Sent',
    value: 89,
    change: '+8%',
    subtext: 'from last week',
    icon: '/icons/mail.png',
    bg: 'bg-blue-100',
  },
  {
    label: 'Active Startups',
    value: 64,
    change: '+5%',
    subtext: 'from last month',
    icon: '/icons/statistics.png',
    bg: 'bg-green-100',
  },
  {
    label: 'Graduated',
    value: 23,
    change: '+3',
    subtext: 'this quarter',
    icon: '/icons/graduate.png',
    bg: 'bg-yellow-100',
  },
];

const StatCards: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
    {stats.map((stat) => (
      <div key={stat.label} className="bg-white rounded-xl shadow p-6 flex items-center gap-4 flex-row-reverse">
        <div className={`${stat.bg} rounded-lg p-3 flex items-center justify-center`} style={{ minWidth: 48, minHeight: 48 }}>
          <img src={stat.icon} alt={stat.label} className="w-8 h-8 object-contain" />
        </div>
        <div>
          <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
          <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
          <div className="text-green-500 text-xs font-semibold mt-1">{stat.change} <span className="text-gray-400 font-normal">{stat.subtext}</span></div>
        </div>
      </div>
    ))}
  </div>
);

export default StatCards; 