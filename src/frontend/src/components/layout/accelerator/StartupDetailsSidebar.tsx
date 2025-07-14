import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Rocket,
  Book,
  Users,
  BarChart2,
  FileText,
  Settings
} from 'lucide-react';

const StartupDetailsSidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname.includes(path)
      ? 'bg-[#f1eafa] text-purple-700 font-semibold'
      : 'text-gray-600';

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col justify-between">
      <div>
        {/* Logo Section */}
        <div className="px-6 py-4">
        <span className="text-2xl font-bold">
        <span className="text-[#6B46C1]">In</span><span className="text-gray-900">Foundr</span>
        </span>
    </div>
        {/* Navigation */}
        <nav className="px-4 flex flex-col gap-1 mt-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${isActive('/dashboard')}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/accelerator/startups"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${isActive('/startups')}`}
          >
            <Rocket size={18} />
            <span>Startups</span>
          </Link>

          <Link
            to="/programs"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${isActive('/programs')}`}
          >
            <Book size={18} />
            <span>Programs</span>
          </Link>

          <Link
            to="/mentors"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${isActive('/mentors')}`}
          >
            <Users size={18} />
            <span>Mentors</span>
          </Link>

          <Link
            to="/analytics"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${isActive('/analytics')}`}
          >
            <BarChart2 size={18} />
            <span>Analytics</span>
          </Link>

          <Link
            to="/resources"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${isActive('/resources')}`}
          >
            <FileText size={18} />
            <span>Resources</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${isActive('/settings')}`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-t">
        <div className="flex items-center gap-3">
          <img
            className="w-10 h-10 rounded-full"
            src="https://i.pravatar.cc/100"
            alt="Alex Morgan"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Alex Morgan</p>
            <p className="text-xs text-gray-500">Program Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupDetailsSidebar;
