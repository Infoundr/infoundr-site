import React, { useState } from 'react';

const EngagementChart: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Weekly' | 'Monthly' | 'Quarterly'>('Weekly');

  const tabClasses = (tab: string) =>
    `px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
      activeTab === tab
        ? 'bg-gray-900 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-900">Engagement Overview</h3>
        <div className="flex gap-2">
          {['Weekly', 'Monthly', 'Quarterly'].map((tab) => (
            <button
              key={tab}
              className={tabClasses(tab)}
              onClick={() => setActiveTab(tab as typeof activeTab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 border border-dashed rounded-xl flex items-center justify-center text-sm text-gray-400">
        {/* Replace this with actual chart later */}
        Chart for {activeTab} Data (Placeholder)
      </div>
    </div>
  );
};

export default EngagementChart;

