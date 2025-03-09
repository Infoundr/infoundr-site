import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/dashboard');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-[#4C1D95] text-white">
                {/* Logo */}
                <div className="flex justify-start">
                    <img 
                        src="/images/Logo.png" 
                        alt="Infoundr" 
                        className="h-24"
                    />
                </div>

                {/* Navigation Links */}
                <nav className="">
                    <Link 
                        to="/dashboard/home" 
                        className="flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors"
                    >
                        <img src="/icons/home.png" alt="" className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">Dashboard</span>
                    </Link>

                    <Link 
                        to="/dashboard/ai-assistants" 
                        className="flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors"
                    >
                        <img src="/icons/robot-white.png" alt="" className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">AI Assistants</span>
                    </Link>

                    <Link 
                        to="/dashboard/tasks" 
                        className="flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors"
                    >
                        <img src="/icons/tasks.png" alt="" className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">Task Automation</span>
                    </Link>

                    <Link 
                        to="/dashboard/analytics" 
                        className="flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors"
                    >
                        <img src="/icons/metrics.png" alt="" className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">Analytics</span>
                    </Link>

                    <Link 
                        to="/dashboard/team" 
                        className="flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors"
                    >
                        <svg 
                            className="w-5 h-5 mr-3" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                        >
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="text-sm font-medium">Team</span>
                    </Link>

                    <Link 
                        to="/dashboard/ideation" 
                        className="flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors"
                    >
                        <img src="/icons/bulb-white.png" alt="" className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">Ideation</span>
                    </Link>
                </nav>

                {/* Logout Button */}
                <div className="mt-auto pt-6 pb-8 px-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center text-gray-100 hover:text-white transition-colors"
                    >
                        <svg 
                            className="w-5 h-5 mr-3" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Add your main content here */}
            </div>
        </div>
    );
};

export default DashboardLayout; 