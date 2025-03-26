import React from 'react';

const TaskStats: React.FC = () => {
  const stats = [
    {
      label: 'Active Tasks',
      value: '24',
      iconSrc: '/icons/play.png',
      iconBg: 'bg-[#EDE9FE]',
      iconColor: 'text-green-600'
    },
    {
      label: 'Pending',
      value: '12',
      iconSrc: '/icons/clock.png',
      iconBg: 'bg-[#EDE9FE]',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'Completed',
      value: '156',
      iconSrc: '/icons/check.png',
      iconBg: 'bg-[#EDE9FE]',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Success Rate',
      value: '98.2%',
      iconSrc: '/icons/trends.png',
      iconBg: 'bg-[#EDE9FE]',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className={`${stat.iconBg} p-3 rounded-lg`}>
              <img src={stat.iconSrc} alt="" className="w-6 h-6" />
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