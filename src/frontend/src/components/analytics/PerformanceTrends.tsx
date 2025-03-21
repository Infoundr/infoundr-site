import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const PerformanceTrends: React.FC = () => {
  // Mock data for the chart
  const data = [
    { month: 'Jan', revenue: 65000, users: 1200, efficiency: 82 },
    { month: 'Feb', revenue: 72000, users: 1350, efficiency: 85 },
    { month: 'Mar', revenue: 85000, users: 1450, efficiency: 87 },
    { month: 'Apr', revenue: 95000, users: 1600, efficiency: 88 },
    { month: 'May', revenue: 102000, users: 1750, efficiency: 90 },
    { month: 'Jun', revenue: 115000, users: 1890, efficiency: 89 },
  ];

  const [activeMetric, setActiveMetric] = useState('revenue');

  const metrics = [
    { key: 'revenue', name: 'Revenue', color: '#7C3AED' },
    { key: 'users', name: 'Users', color: '#60A5FA' },
    { key: 'efficiency', name: 'Efficiency', color: '#34D399' },
  ];

  const formatYAxis = (value: number): string => {
    if (activeMetric === 'revenue') {
      return `$${value / 1000}k`;
    } else if (activeMetric === 'efficiency') {
      return `${value}%`;
    }
    return value.toString();
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Performance Trends</h2>
        <div className="flex items-center gap-4">
          <select 
            className="px-4 py-2 border rounded-lg bg-white"
            value={activeMetric}
            onChange={(e) => setActiveMetric(e.target.value)}
          >
            {metrics.map((metric) => (
              <option key={metric.key} value={metric.key}>
                {metric.name}
              </option>
            ))}
          </select>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month" 
              stroke="#6B7280"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis 
              stroke="#6B7280"
              tick={{ fill: '#6B7280' }}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
              formatter={(value: number) => {
                if (activeMetric === 'revenue') {
                  return [`$${value.toLocaleString()}`, 'Revenue'];
                } else if (activeMetric === 'efficiency') {
                  return [`${value}%`, 'Efficiency'];
                }
                return [value.toLocaleString(), 'Users'];
              }}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={metrics.find(m => m.key === activeMetric)?.color}
              fill={metrics.find(m => m.key === activeMetric)?.color + '40'}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceTrends; 