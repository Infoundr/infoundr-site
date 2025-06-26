import React from 'react';

const StartupPagination: React.FC = () => (
  <div className="flex justify-center items-center gap-2 mt-8">
    <button className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100">&lt;</button>
    <button className="px-3 py-1 rounded-lg bg-purple-600 text-white font-semibold">1</button>
    <button className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100">2</button>
    <button className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100">3</button>
    <span className="px-2 text-gray-400">...</span>
    <button className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100">6</button>
    <button className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100">&gt;</button>
  </div>
);

export default StartupPagination; 