import React from 'react';

interface StartupCardProps {
  name: string;
  description: string;
  status: 'Active' | 'Graduated' | 'Invited';
  joined: string;
  cohort: string;
  engagement: number | null;
  avatarUrl: string;
  members: string[];
}

const statusColors = {
  Active: 'bg-green-100 text-green-700',
  Graduated: 'bg-blue-100 text-blue-700',
  Invited: 'bg-pink-100 text-pink-700',
};

const StartupCard: React.FC<StartupCardProps> = ({
  name,
  description,
  status,
  joined,
  cohort,
  engagement,
  avatarUrl,
  members,
}) => (
  <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 min-w-[280px]">
    <div className="flex items-center gap-3 mb-2">
      <div className="bg-purple-100 rounded-lg p-3">
        <img src={avatarUrl} alt={name} className="w-8 h-8 object-contain" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-800">{name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[status]}`}>{status}</span>
        </div>
        <div className="text-gray-500 text-sm">{description}</div>
      </div>
    </div>
    <div className="flex items-center text-xs text-gray-500 gap-2 mb-1">
      <span>📅 {status === 'Invited' ? 'Invited' : 'Joined'}: {joined}</span>
      <span className="ml-auto">{cohort}</span>
    </div>
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1">
        <span>Engagement Score</span>
        <span className={engagement !== null ? 'text-purple-600' : 'text-gray-400'}>{engagement !== null ? `${engagement}%` : 'N/A'}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-2 bg-purple-500 rounded-full"
          style={{ width: engagement !== null ? `${engagement}%` : '0%' }}
        />
      </div>
    </div>
    <div className="flex items-center mt-3 gap-2">
      {members.map((m, i) => (
        <img
          key={i}
          src={m}
          alt="member"
          className="w-6 h-6 rounded-full border-2 border-white -ml-2 first:ml-0"
        />
      ))}
      <a href="#" className="ml-auto text-sm text-purple-600 font-semibold hover:underline">View Profile</a>
    </div>
  </div>
);

export default StartupCard; 