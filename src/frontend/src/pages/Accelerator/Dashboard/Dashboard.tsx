import React from 'react';
import StatCards from './StatCards';
import EngagementChart from './EngagementChart';
import RecentActivity from './RecentActivity';

const Dashboard: React.FC = () => {
    return (
        <div>
            <div>
            <h1 className="text-3xl font-bold text-gray-800">Accelerator Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome to your accelerator program.</p>
        </div>

        <div className="p-6 bg-gray-50 min-h-screen">
            <StatCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="lg:col-span-2">
                    <EngagementChart />
                </div>
                <div>
                    <RecentActivity />
                </div>
            </div>
        </div>

        </div>
        
    );
};

export default Dashboard; 