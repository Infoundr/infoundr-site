import React from 'react';
import { useParams } from 'react-router-dom';
import StartupHeader from '../../../components/common/Startupdetails/StartupHeader';
import EngagementStats from '../../../components/common/Startupdetails/EngagementStats';
import EngagementChart from '../../../components/common/Startupdetails/EngagementChart';
import RecentActivity from '../../../components/common/Startupdetails/RecentActivity';
import UpcomingTasks from '../../../components/common/Startupdetails/UpcomingTasks';

const StartupDetails: React.FC = () => {
  const { startupId } = useParams<{ startupId: string }>();

  return (
    <div className="p-6 space-y-6">
      {/* Startup Header */}
      <StartupHeader name={startupId || 'Unnamed Startup'} />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-6 text-sm font-medium text-gray-500">
          <button className="text-gray-900 border-b-2 border-gray-900 py-2">Overview</button>
          <button className="hover:text-gray-900 py-2">Activity Logs</button>
          <button className="hover:text-gray-900 py-2">Resources Shared</button>
          <button className="hover:text-gray-900 py-2">Notes</button>
        </div>
      </div>

      {/* Engagement Section */}
      <div className="space-y-6">
        <EngagementStats />
        <EngagementChart />
      </div>

      {/* Activity and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <UpcomingTasks />
      </div>
    </div>
  );
};

export default StartupDetails;


