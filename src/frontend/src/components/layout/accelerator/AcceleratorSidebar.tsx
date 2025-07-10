import { AuthClient } from '@dfinity/auth-client';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    sessionStorage.clear();
    localStorage.clear();
    navigate('/accelerator/login');
  };

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

      {/* Logged-in user and logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4">
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
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
          </svg>
          Log out
        </button>
      </div>
    </div>
  );
};

export default AcceleratorSidebar;
