import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Engagement',
      data: [30, 45, 40, 60, 70, 65, 80],
      borderColor: '#7C3AED',
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#7C3AED',
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#F3F4F6',
      },
      ticks: {
        color: '#9CA3AF',
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#9CA3AF',
      },
    },
  },
};

const EngagementChart: React.FC = () => (
  <div className="bg-white rounded-xl shadow p-6 h-90 flex flex-col">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">Startup Engagement Over Time</h2>
    <div className="flex-1 flex items-center justify-center">
      <Line data={data} options={options} />
    </div>
  </div>
);

export default EngagementChart; 