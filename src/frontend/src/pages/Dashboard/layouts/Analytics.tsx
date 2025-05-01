import React from 'react';
import Button from '../../../components/common/Button';
import StatCard from '../../../components/analytics/StatCard';
import PerformanceTrends from '../../../components/analytics/PerformanceTrends';
import AIPredictions from '../../../components/analytics/AIPredictions';
import AvailableReports from '../../../components/analytics/AvailableReports';

const Analytics: React.FC = () => {
  const stats = [
    {
      value: '$245,890',
      label: 'Revenue Growth',
      change: '+12.5%',
      iconSrc: '/icons/trends.png'
    },
    {
      value: '1,890',
      label: 'Active Users',
      change: '+5.2%',
      iconSrc: '/icons/people.png'
    },
    {
      value: '89.2%',
      label: 'Efficiency Rate',
      change: '+8.7%',
      iconSrc: '/icons/piechart.png'
    },
    {
      value: '95.8%',
      label: 'Productivity Score',
      change: '+15.3%',
      iconSrc: '/icons/rocket.png'
    }
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Business Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <select className="px-4 py-2 border rounded-lg bg-white">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <Button variant="primary" className="flex items-center gap-2">
            <span>Export Report</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            value={stat.value}
            label={stat.label}
            change={stat.change}
            iconSrc={stat.iconSrc}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceTrends />
        </div>
        <div>
          <AIPredictions />
        </div>
      </div>

      <div className="mt-8">
        <AvailableReports />
      </div>
    </div>
  );
};

export default Analytics; 