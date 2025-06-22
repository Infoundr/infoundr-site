import React from 'react';
import { Outlet } from 'react-router-dom';
import AcceleratorSidebar from '../../components/layout/accelerator/AcceleratorSidebar';

const AcceleratorLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-white">
            <AcceleratorSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
                    <div className="container mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AcceleratorLayout; 