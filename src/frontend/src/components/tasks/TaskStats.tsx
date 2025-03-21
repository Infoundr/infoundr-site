import React from 'react';

const TaskStats: React.FC = () => {
  const stats = [
    {
      label: 'Active Tasks',
      value: '24',
      icon: '▶️',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'Pending',
      value: '12',
      icon: '⏳',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'Completed',
      value: '156',
      icon: '✓',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Success Rate',
      value: '98.2%',
      icon: '📈',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className={`${stat.iconBg} p-2 rounded-lg ${stat.iconColor}`}>
              <span className="text-xl">{stat.icon}</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        </div>
      ))}
    </>
  );
};

export default TaskStats; 