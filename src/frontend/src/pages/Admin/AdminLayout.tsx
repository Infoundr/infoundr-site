import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import { logout } from '../../services/auth';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/admin');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/users', label: 'Registered Users', icon: '👥' },
        { path: '/admin/waitlist', label: 'Waitlist Entries', icon: '⏳' },
        { path: '/admin/admins', label: 'Admin Management', icon: '🔐' },
        { path: '/admin/accelerators', label: 'Accelerator Management', icon: '🚀' },
        { path: '/admin/platform-users', label: 'Platform Users', icon: '🔗' },
        { path: '/admin/api-messages', label: 'API Messages', icon: '💬' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                        </div>
                        <Button
                            variant="secondary"
                            className="flex items-center gap-2"
                            onClick={handleLogout}
                        >
                            <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                                />
                            </svg>
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-64 flex-shrink-0">
                        <nav className="bg-white rounded-lg shadow-sm p-4">
                            <ul className="space-y-2">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <li key={item.path}>
                                            <button
                                                onClick={() => navigate(item.path)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                                    isActive
                                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                            >
                                                <span className="text-lg">{item.icon}</span>
                                                <span className="font-medium">{item.label}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout; 