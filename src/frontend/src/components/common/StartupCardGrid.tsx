import React from 'react';
import StartupCard from './StartupCard';

const mockStartups = [
  {
    name: 'TechLaunch',
    description: 'AI-driven quantum computing solutions',
    status: 'Active',
    joined: 'May 12, 2023',
    cohort: 'Spring 2023',
    engagement: 92,
    avatarUrl: '/icons/company.png',
    members: ['/icons/avatar1.png', '/icons/avatar2.png', '/icons/avatar3.png'],
  },
  {
    name: 'EcoTech',
    description: 'Sustainable technology solutions',
    status: 'Active',
    joined: 'April 3, 2023',
    cohort: 'Spring 2023',
    engagement: 78,
    avatarUrl: '/icons/company.png',
    members: ['/icons/avatar2.png', '/icons/avatar3.png'],
  },
  {
    name: 'FinEdge',
    description: 'Next-gen financial technology',
    status: 'Graduated',
    joined: 'Oct 15, 2022',
    cohort: 'Fall 2022',
    engagement: 95,
    avatarUrl: '/icons/company.png',
    members: ['/icons/avatar1.png', '/icons/avatar2.png'],
  },
  {
    name: 'MediSync',
    description: 'Healthcare data solutions',
    status: 'Invited',
    joined: 'June 1, 2023',
    cohort: 'Summer 2023',
    engagement: null,
    avatarUrl: '/icons/company.png',
    members: ['/icons/avatar4.png'],
  },
  {
    name: 'VRLearn',
    description: 'VR educational platform',
    status: 'Active',
    joined: 'Feb 8, 2023',
    cohort: 'Spring 2023',
    engagement: 86,
    avatarUrl: '/icons/company.png',
    members: ['/icons/avatar2.png', '/icons/avatar3.png'],
  },
  {
    name: 'CloudScale',
    description: 'Cloud infrastructure automation',
    status: 'Graduated',
    joined: 'Sept 5, 2022',
    cohort: 'Fall 2022',
    engagement: 89,
    avatarUrl: '/icons/company.png',
    members: ['/icons/avatar1.png', '/icons/avatar2.png', '/icons/avatar3.png'],
  },
];

const StartupCardGrid: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    {mockStartups.map((startup, idx) => (
      <StartupCard key={idx} {...startup} />
    ))}
  </div>
);

export default StartupCardGrid; 