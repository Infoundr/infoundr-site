import React from 'react';
import { Outlet } from 'react-router-dom';
import AcceleratorSidebar from '../../components/layout/accelerator/AcceleratorSidebar';

// You can replace this mock data with actual user data from your auth context/service
const loggedInUser = {
  name: 'Alice Johnson',
  role: 'Admin',
  avatarUrl: 'https://i.pravatar.cc/150?img=35', // Replace with your real profile image URL
};

const AcceleratorLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar receives user props */}
      <AcceleratorSidebar user={loggedInUser} />
      
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

export default AcceleratorLayout;
