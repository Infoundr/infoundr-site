import React from 'react';
import { Outlet } from 'react-router-dom';
import StartupDetailsSidebar from '../../components/layout/accelerator/StartupDetailsSidebar';

const StartupDetailsLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <StartupDetailsSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
                    <div className="container mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StartupDetailsLayout; 