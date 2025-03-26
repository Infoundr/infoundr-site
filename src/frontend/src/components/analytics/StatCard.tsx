import React from 'react';

interface StatCardProps {
  value: string;
  label: string;
  change: string;
  iconSrc: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, change, iconSrc }) => {
  return (
    <div className="bg-[#F9F5FF] rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-[#EDE9FE] p-3 rounded-lg">
          <img src={iconSrc} alt="" className="w-6 h-6" />
        </div>
        <span className="text-[#7C3AED] text-sm font-medium">{change}</span>
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-1">{value}</h3>
        <p className="text-gray-600">{label}</p>
      </div>
    </div>
  );
};

export default StatCard; 