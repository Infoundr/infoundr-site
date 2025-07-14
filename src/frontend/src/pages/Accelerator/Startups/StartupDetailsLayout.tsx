import React from 'react';
import { Outlet } from 'react-router-dom';
import AcceleratorSidebar from '../../../components/layout/accelerator/AcceleratorSidebar';
const dummyUser = {
  name: 'Alex Morgan',
  role: 'Program Manager',
  avatarUrl: 'https://i.pravatar.cc/100?img=12',
};

const StartupDetailsLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AcceleratorSidebar user={dummyUser} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StartupDetailsLayout;

