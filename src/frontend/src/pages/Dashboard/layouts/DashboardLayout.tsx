import React, { useState, useEffect } from 'react';
import ChatHistory from './ChatHistory';
import TaskList from './TaskList';
import GithubIssues from './GithubIssues';
import { Actor } from '@dfinity/agent';
import { createActor } from "../../../../../declarations/backend";
import { HttpAgent } from "@dfinity/agent";
import { _SERVICE } from "../../../../../declarations/backend/backend.did";
import { CANISTER_ID } from '../../../config';

import { Link, useNavigate, Outlet, useLocation, Routes, Route } from 'react-router-dom';
import { logout } from '../../../services/auth';
import Analytics from './Analytics';
import Tasks from './Tasks';
import { mockActor } from '../../../mocks/mockData';
import Ideation from './Ideation';
import { useMockData as mockDataBoolean } from '../../../mocks/mockData';
import LoadingSpinner from '../../../components/LoadingSpinner';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [actor, setActor] = useState<Actor | null>(null);

    useEffect(() => {
        const initActor = async () => {
            try {
                const agent = new HttpAgent({});
                
                if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
                    await agent.fetchRootKey();
                }

                const actor = createActor(CANISTER_ID, { agent });
                setActor(actor);
            } catch (error) {
                console.error("Failed to initialize actor:", error);
            }
        };

        initActor();
    }, []);

    const renderContent = () => {
        if (!actor) {
            return (
                <div className="flex items-center justify-center h-screen">
                    <LoadingSpinner size="lg" />
                </div>
            );
        }

        const path = location.pathname;
        
        // Dashboard home shows all components
        if (path === '/dashboard' || path === '/dashboard/home') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    <ChatHistory actor={actor as unknown as _SERVICE} useMockData={mockDataBoolean} />
                    <TaskList actor={actor as unknown as _SERVICE} useMockData={mockDataBoolean} />
                    <GithubIssues actor={actor as unknown as _SERVICE} useMockData={mockDataBoolean} />
                </div>
            );
        }

        // Individual routes show single components
        if (path === '/dashboard/ai-assistants') {
            return <ChatHistory actor={actor as unknown as _SERVICE} useMockData={mockDataBoolean} />;
        }

        if (path === '/dashboard/tasks') {
            return <TaskList actor={actor as unknown as _SERVICE} useMockData={mockDataBoolean} />;
        }

        if (path === '/dashboard/github') {
            return <GithubIssues actor={actor as unknown as _SERVICE} useMockData={mockDataBoolean} />;
        }

        if (path === '/dashboard/tasks') {
            return <Tasks />;
        }

        if (path === '/dashboard/analytics') {
            return <Analytics />;
        }

        if (path === '/dashboard/team') {
            return <div>Team Page</div>;
        }

        if (path === '/dashboard/ideation') {
            return <Ideation />;
        }

        // Default case

        // Default case
        return null;
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
                        to="/dashboard/github" 
                        className={`flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors ${isActive('/dashboard/github')}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg 
                            className="w-5 h-5 mr-3" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span className="text-sm font-medium">Github</span>
                    </Link>

                    {/* <Link 
                        to="/dashboard/analytics" 
                        className={`flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors ${isActive('/dashboard/analytics')}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <img src="/icons/metrics.png" alt="" className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">Analytics</span>
                    </Link> */}

                    {/* <Link 
                        to="/dashboard/ideation" 
                        className={`flex items-center px-6 py-3 text-gray-100 hover:bg-[#5B21B6] transition-colors ${isActive('/dashboard/ideation')}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <img src="/icons/bulb-white.png" alt="" className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">Ideation</span>
                    </Link> */}
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
                    {/* <Routes>
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="team" element={<div>Team Page</div>} />
                        <Route path="ideation" element={<div>Ideation Page</div>} />
                    </Routes> */}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
