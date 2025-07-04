import React from 'react';
import AddStartupButton from '../../../components/common/AddStartupButton';
import StartupSearchBar from '../../../components/common/StartupSearchBar';
import StartupCardGrid from '../../../components/common/StartupCardGrid';
import StartupPagination from '../../../components/common/StartupPagination';

const Startups: React.FC = () => {
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-800">Startups Management</h1>
                <AddStartupButton />
            </div>
            <p className="mt-2 text-gray-600">Manage and track all startups in your accelerator program.</p>
            <StartupSearchBar />
            <StartupCardGrid />
            <StartupPagination />
        </div>
    );
};

export default Startups; 