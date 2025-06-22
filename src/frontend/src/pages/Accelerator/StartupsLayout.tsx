import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from '../../components/layout/accelerator/TopNavbar';

const StartupsLayout: React.FC = () => {
    return (
        <div className="bg-gray-100 min-h-screen">
            <TopNavbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default StartupsLayout; 