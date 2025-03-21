import React from 'react';

const PerformanceTrends: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Performance Trends</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center h-[300px] bg-[#F9F5FF] rounded-lg">
        <div className="text-[#7C3AED] text-6xl opacity-20">📊</div>
      </div>
    </div>
  );
};

export default PerformanceTrends; 