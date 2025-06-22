import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const StartupDetailsSidebar: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname.endsWith(path) ? 'bg-purple-700' : '';
    };

    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="h-20 flex items-center justify-center text-2xl font-bold">
                TechLaunch
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                <Link
                    to="overview"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('overview')}`}
                >
                    <span className="mr-3">📊</span>
                    Dashboard
                </Link>
                <Link
                    to="/accelerator/startups"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('/accelerator/startups')}`}
                >
                    <span className="mr-3">🚀</span>
                    Startups
                </Link>
                <Link
                    to="programs"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('programs')}`}
                >
                    <span className="mr-3">📚</span>
                    Programs
                </Link>
                <Link
                    to="mentors"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('mentors')}`}
                >
                    <span className="mr-3">👥</span>
                    Mentors
                </Link>
                <Link
                    to="analytics"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('analytics')}`}
                >
                    <span className="mr-3">📈</span>
                    Analytics
                </Link>
                <Link
                    to="resources"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('resources')}`}
                >
                    <span className="mr-3">📄</span>
                    Resources
                </Link>
                <Link
                    to="settings"
                    className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md ${isActive('settings')}`}
                >
                    <span className="mr-3">⚙️</span>
                    Settings
                </Link>
            </nav>
            <div className="p-4 border-t border-gray-700">
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/100" alt="Alex Morgan" />
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">Alex Morgan</p>
                        <p className="text-xs text-gray-400">Program Manager</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartupDetailsSidebar; 