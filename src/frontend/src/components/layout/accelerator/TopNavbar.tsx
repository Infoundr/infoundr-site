import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
    { to: "/accelerator/dashboard", text: "Dashboard" },
    { to: "/accelerator/startups", text: "Startups" },
    { to: "#", text: "Mentors" },
    { to: "#", text: "Events" },
    { to: "#", text: "Resources" },
    { to: "#", text: "Reports" },
];

const TopNavbar: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <img src="/images/Logo.png" alt="Infoundr" className="h-20" />
                    </div>

                    {/* Centered Navigation Links */}
                    <div className="flex-1 flex items-center justify-center">
                        <div className="hidden md:flex space-x-8">
                            {navLinks.map(({ to, text }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`text-base font-medium transition-colors ${
                                        isActive(to)
                                            ? 'text-purple-600'
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    {text}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Section: Notifications and Profile */}
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <img src="/icons/accelerator/startups/notifications.png" alt="Notifications" className="h-6 w-6" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/150?u=michaeldavis" alt="Michael Davis" />
                            <span className="text-base font-medium text-gray-700">Michael Davis</span>
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default TopNavbar; 