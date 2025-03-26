import React, { useState, useEffect } from 'react';
import ChatHistory from '../components/dashboard/ChatHistory';
import TaskList from '../components/dashboard/TaskList';
import GithubIssues from '../components/dashboard/GithubIssues';
import { Actor } from '@dfinity/agent';
import { createActor } from "../../../declarations/backend";
import { HttpAgent } from "@dfinity/agent";
import { _SERVICE } from "../../../declarations/backend/backend.did";

// Import or define canister IDs (same as in auth.ts)
const LOCAL_CANISTER_ID = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
const MAINNET_CANISTER_ID = ""; // Add your mainnet canister ID here

const canisterID = import.meta.env.VITE_DFX_NETWORK === 'ic' 
  ? MAINNET_CANISTER_ID 
  : LOCAL_CANISTER_ID;
import { Link, useNavigate, Outlet, useLocation, Routes, Route } from 'react-router-dom';
import { logout } from '../services/auth';
import Analytics from '../pages/Analytics';
import Tasks from '../pages/Tasks';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [actor, setActor] = useState<Actor | null>(null);

    useEffect(() => {
        const initActor = async () => {
            try {
                const agent = new HttpAgent({});
                
                if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
                    await agent.fetchRootKey();
                }

                const actor = createActor(canisterID, { agent });
                setActor(actor);
            } catch (error) {
                console.error("Failed to initialize actor:", error);
            }
        };

        initActor();
    }, []);

    const renderContent = () => {
        if (!actor) {
            return <div>Loading...</div>;
        }

        switch (activeSection) {
            case 'ai-assistants':
                return <ChatHistory actor={actor as unknown as _SERVICE} />;
            case 'tasks':
                return <TaskList actor={actor as unknown as _SERVICE} />;
            case 'github':
                return null; // Commented GithubIssues component
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        <ChatHistory actor={actor as unknown as _SERVICE} />
                        <TaskList actor={actor as unknown as _SERVICE} />
                    </div>
                );
        }
    };

    const isActive = (path: string) => {
        return location.pathname.startsWith(path) ? 'bg-[#5B21B6]' : '';
    };

    const handleLogout = async () => {
        await logout();
        navigate('/dashboard');
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-[#4C1D95] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="flex justify-start p-4">
                    <img 
                        src="/images/Logo.png" 
                        alt="Infoundr" 
                        className="h-16 lg:h-24"
                    />
                </div>

                {/* Navigation Links */}
                <nav className="mt-4">
                    <Link 
                        to="/dashboard/home" 
                        className={`flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors ${isActive('/dashboard/home')}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <img src="/icons/home.png" alt="" className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">Dashboard</span>
                    </Link>

                    <Link 
                        to="/dashboard/ai-assistants" 
                        className={`flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors ${isActive('/dashboard/ai-assistants')}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <img src="/icons/robot-white.png" alt="" className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">AI Assistants</span>
                    </Link>

                    <Link 
                        to="/dashboard/tasks" 
                        className={`flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors ${isActive('/dashboard/tasks')}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <img src="/icons/tasks.png" alt="" className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">Task Automation</span>
                    </Link>

                    <Link 
                        to="/dashboard/analytics" 
                        className={`flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors ${isActive('/dashboard/analytics')}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <img src="/icons/metrics.png" alt="" className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">Analytics</span>
                    </Link>

                    <Link 
                        to="/dashboard/team" 
                        className={`flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors ${isActive('/dashboard/team')}`}
                        onClick={() => setSidebarOpen(false)}
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
                        className={`flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors ${isActive('/dashboard/ideation')}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <img src="/icons/bulb-white.png" alt="" className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">Ideation</span>
                    </Link>
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
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
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white shadow-sm lg:hidden">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-gray-500 focus:outline-none focus:text-gray-700"
                        >
                            <svg 
                                className="h-6 w-6" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <img 
                            src="/images/Logo.png" 
                            alt="Infoundr" 
                            className="h-8"
                        />
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-4">
                    {renderContent()}
                    <Routes>
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="tasks" element={<Tasks />} />
                        <Route path="*" element={<div>Page not found</div>} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
