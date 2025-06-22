import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
    { to: '/accelerator/dashboard', icon: 'dashboard.png', text: 'Dashboard' },
    { to: '/accelerator/startups', icon: 'startups.png', text: 'Startups' },
    { to: '/accelerator/invites', icon: 'invites.png', text: 'Invites' },
    { to: '/accelerator/analytics', icon: 'analytics.png', text: 'Analytics' },
    { to: '/accelerator/roles', icon: 'roles-permissions.png', text: 'Roles & Permissions' },
    { to: '/accelerator/settings', icon: 'settings.png', text: 'Settings' },
];

const AcceleratorSidebar: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <div className="w-64 bg-white text-gray-800 flex flex-col border-r border-gray-200">
            <div className="h-30 flex items-start justify-start ml-5">
                <img src="/images/Logo.png" alt="Infoundr" className="h-20" />
            </div>
            
            <div className="border-b-[2px] border-gray-200"></div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {navLinks.map(({ to, icon, text }) => {
                    const active = isActive(to);
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                active
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <img
                                src={`/icons/accelerator/${icon}`}
                                alt={text}
                                className={`w-6 h-6 mr-3 ${!active && 'filter grayscale'}`}
                            />
                            {text}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default AcceleratorSidebar; 