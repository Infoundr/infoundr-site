import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AcceleratorSidebar: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname.startsWith(path) ? 'bg-purple-700' : '';
    };

    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="h-20 flex items-center justify-center text-2xl font-bold">
                Infoundr
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                <Link
                    to="/accelerator/dashboard"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('/accelerator/dashboard')}`}
                >
                    {/* Replace with an actual icon */}
                    <span className="mr-3">🏠</span>
                    Dashboard
                </Link>
                <Link
                    to="/accelerator/startups"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('/accelerator/startups')}`}
                >
                    {/* Replace with an actual icon */}
                    <span className="mr-3">🚀</span>
                    Startups
                </Link>
                <Link
                    to="/accelerator/invites"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('/accelerator/invites')}`}
                >
                    {/* Replace with an actual icon */}
                    <span className="mr-3">✉️</span>
                    Invites
                </Link>
                <Link
                    to="/accelerator/analytics"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('/accelerator/analytics')}`}
                >
                    {/* Replace with an actual icon */}
                    <span className="mr-3">📊</span>
                    Analytics
                </Link>
                <Link
                    to="/accelerator/roles"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('/accelerator/roles')}`}
                >
                    {/* Replace with an actual icon */}
                    <span className="mr-3">👥</span>
                    Roles & Permissions
                </Link>
                <Link
                    to="/accelerator/settings"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('/accelerator/settings')}`}
                >
                    {/* Replace with an actual icon */}
                    <span className="mr-3">⚙️</span>
                    Settings
                </Link>
            </nav>
        </div>
    );
};

export default AcceleratorSidebar; 