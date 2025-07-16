/*import React from 'react';

const activities = [
  { icon: '➕', color: 'text-green-500', text: 'TechFlow joined the program', time: '2 hours ago' },
  { icon: '📝', color: 'text-blue-500', text: 'DataSync updated their pitch deck', time: '5 hours ago' },
  { icon: '✉️', color: 'text-purple-500', text: 'Sent invite to CloudVenture', time: '1 day ago' },
  { icon: '🎓', color: 'text-yellow-500', text: 'AIStartup graduated successfully', time: '2 days ago' },
  { icon: '❗', color: 'text-red-400', text: 'MobileApp missed milestone', time: '3 days ago' },
];

const RecentActivity: React.FC = () => (
  <div className="bg-white rounded-xl shadow p-6 min-h-[350px]">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
    <ul className="space-y-4">
      {activities.map((activity, idx) => (
        <li key={idx} className="flex items-center gap-3">
          <span className={`text-xl ${activity.color}`}>{activity.icon}</span>
          <div>
            <div className="text-gray-700 font-medium">{activity.text}</div>
            <div className="text-xs text-gray-400">{activity.time}</div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default RecentActivity; */
import React, { useEffect, useState } from 'react';
import { getMyAccelerator } from '../../../services/accelerator';
import type { Activity } from '../../../types/accelerator';

const iconMap: Record<string, { icon: string; color: string }> = {
  Joined: { icon: '➕', color: 'text-green-500' },
  UpdatedPitchDeck: { icon: '📝', color: 'text-blue-500' },
  SentInvite: { icon: '✉️', color: 'text-purple-500' },
  Graduated: { icon: '🎓', color: 'text-yellow-500' },
  MissedMilestone: { icon: '❗', color: 'text-red-400' },
  AcceleratorCreated: { icon: '🚀', color: 'text-indigo-500' },
  Other: { icon: '🔔', color: 'text-gray-500' },
};

const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      const accelerator = await getMyAccelerator();
      if (accelerator?.recent_activity) {
        setActivities(accelerator.recent_activity);
      }
    };
    fetchActivity();
  }, []);

  const getIconDetails = (activityType: Activity['activity_type']) => {
    const key = Object.keys(activityType)[0];
    return iconMap[key] || iconMap['Other'];
  };

  const timeAgo = (timestamp: bigint): string => {
    const ms = Number(timestamp) / 1_000_000;
    const now = Date.now();
    const diff = now - ms;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[350px]">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
      <ul className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500">No recent activity found.</p>
        ) : (
          activities.map((activity, idx) => {
            const typeKey = Object.keys(activity.activity_type)[0];
            const { icon, color } = getIconDetails(activity.activity_type);

            return (
              <li key={idx} className="flex items-center gap-3">
                <span className={`text-xl ${color}`}>{icon}</span>
                <div>
                  <div className="text-gray-700 font-medium">{activity.description}</div>
                  <div className="text-xs text-gray-400">{timeAgo(activity.timestamp)}</div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default RecentActivity;
