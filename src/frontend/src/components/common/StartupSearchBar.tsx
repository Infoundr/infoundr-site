import React from 'react';
import { StartupCardProps } from './StartupCard'; 
export interface StartupSearchBarProps {
  startups: any[];
  total: number;
}
  
const StartupSearchBar: React.FC<StartupSearchBarProps> = ({ startups, total }) => {
  return (
  <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-4 mt-6">
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <input
        type="text"
        placeholder="Search startups..."
        className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
      />
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-sm">View:</span>
        <button className="p-2 rounded-lg bg-purple-100 text-purple-600"><i className="fas fa-th-large" /></button>
        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><i className="fas fa-list" /></button>
      </div>
      <select className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700">
        <option>All Cohorts</option>
      </select>
      <select className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700">
        <option>All Statuses</option>
      </select>
      <select className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700">
        <option>Performance</option>
      </select>
    </div>
    <div className="text-right text-xs text-gray-400 mt-2">
      Showing {startups.length} of {total} startups
    </div>

  </div>
  );
};

export default StartupSearchBar; 
