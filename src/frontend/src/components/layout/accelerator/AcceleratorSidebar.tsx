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

interface User {
  name: string;
  role: string;
  avatarUrl: string;
}

interface Props {
  user: User;
}

const AcceleratorSidebar: React.FC<Props> = ({ user }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="w-64 h-screen bg-white text-gray-800 flex flex-col border-r border-gray-200 justify-between">
      <div>
        {/* Logo */}
        <div className="h-28 flex items-center justify-start px-5">
          <img src="/images/Logo.png" alt="Infoundr" className="h-20" />
        </div>

        <div className="border-b border-gray-200"></div>

        {/* Nav Links */}
        <nav className="px-4 py-4 space-y-2">
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
                  className={`w-6 h-6 mr-3 ${!active ? 'filter grayscale' : ''}`}
                />
                {text}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logged-in user */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceleratorSidebar;
