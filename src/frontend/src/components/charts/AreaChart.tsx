import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface AreaChartProps {
  data: ChartData[];
  className?: string;
}

export function AreaChartComponent({ data, className = "h-48" }: AreaChartProps) {
  // Ensure we have valid data
  if (!data || data.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50 rounded-lg`}>
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-white p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-sm text-blue-600">
                          {payload[0].value} requests
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorValue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
