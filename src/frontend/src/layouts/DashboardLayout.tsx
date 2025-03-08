import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-[#4C1D95] text-white">
                <div className="p-6">
                    <img src="/images/Logo.png" alt="Infoundr" className="h-8 mb-8" />
                    
                    <nav className="space-y-2">
                        <Link 
                            to="/dashboard/home" 
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#6D28D9] transition-colors"
                        >
                            <span className="material-icons">dashboard</span>
                            <span>Dashboard</span>
                        </Link>
                        <Link 
                            to="/dashboard/ai-assistants" 
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#6D28D9] transition-colors"
                        >
                            <span className="material-icons">smart_toy</span>
                            <span>AI Assistants</span>
                        </Link>
                        <Link 
                            to="/dashboard/analytics" 
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#6D28D9] transition-colors"
                        >
                            <span className="material-icons">analytics</span>
                            <span>Analytics</span>
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#6D28D9] transition-colors w-full text-left mt-8"
                        >
                            <span className="material-icons">logout</span>
                            <span>Logout</span>
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                <Routes>
                    <Route path="home" element={<div>Dashboard Home</div>} />
                    <Route path="ai-assistants" element={<div>AI Assistants</div>} />
                    <Route path="analytics" element={<div>Analytics</div>} />
                </Routes>
            </main>
        </div>
    );
};

export default DashboardLayout; 