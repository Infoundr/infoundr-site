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
import { logout, getCurrentUser } from '../../../services/auth';
import Analytics from './Analytics';
import Tasks from './Tasks';
import { mockActor, useMockData } from '../../../mocks/mockData';
import Ideation from './Ideation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AIAssistantsPage from './AIAssistantsPage';
import ConnectionsToWorkspaces from './ConnectionsToWorkspaces';
import DashboardHome from './DashboardHome';
import UsageAnalytics from './UsageAnalytics';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [actor, setActor] = useState<Actor | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const initActor = async () => {
            // If we're using mock data, use the mock actor instead
            if (useMockData) {
                console.log("Using mock actor for development");
                setActor(mockActor as unknown as Actor);
                // Set mock user data
                setUser({
                    name: "John Doe",
                    email: "john@example.com",
                    plan: "Pro Plan"
                });
                return;
            }

            try {
                const agent = new HttpAgent({});
                
                if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
                    await agent.fetchRootKey();
                }

                const actor = createActor(CANISTER_ID, { agent });
                setActor(actor);
                
                // Get current user
                const currentUser = await getCurrentUser();
                if (currentUser && currentUser[0]) {
                    setUser({
                        name: currentUser[0].name || "User",
                        email: currentUser[0].email || "user@example.com",
                        plan: "Pro Plan"
                    });
                }
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
        
        // Dashboard home shows new home page
        if (path === '/dashboard' || path === '/dashboard/home') {
            return <DashboardHome actor={actor as unknown as _SERVICE} useMockData={useMockData} />;
        }

        // Individual routes show single components
        if (path === '/dashboard/ai-assistants') {
            return <ChatHistory actor={actor as unknown as _SERVICE} useMockData={useMockData} />;
        }

        if (path === '/dashboard/tasks') {
            return <TaskList actor={actor as unknown as _SERVICE} useMockData={useMockData} />;
        }

        if (path === '/dashboard/github') {
            return <GithubIssues actor={actor as unknown as _SERVICE} useMockData={useMockData} />;
        }

        if (path === '/dashboard/tasks') {
            return <Tasks />;
        }

        if (path === '/dashboard/analytics') {
            return <UsageAnalytics />;
        }

        if (path === '/dashboard/team') {
            return <div>Team Page</div>;
        }

        if (path === '/dashboard/ideation') {
            return <Ideation />;
        }

        if (path === '/dashboard/connections') {
            return <ConnectionsToWorkspaces />;
        }

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
        <div className="flex h-screen bg-gray-900 overflow-hidden">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar - Cursor Style */}
            <div className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="flex justify-start p-4">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                        <span className="text-gray-800 font-bold text-sm">I</span>
                    </div>
                </div>

                {/* User Profile Section */}
                {user && (
                    <div className="px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-xs text-gray-400">{user.plan}</span>
                        </div>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="mt-4">
                    <Link 
                        to="/dashboard/home" 
                        className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${isActive('/dashboard/home') ? 'bg-gray-700 text-white border-r-2 border-blue-500' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="text-sm font-medium">Overview</span>
                    </Link>

                    <Link 
                        to="/dashboard/connections" 
                        className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${isActive('/dashboard/connections') ? 'bg-gray-700 text-white border-r-2 border-blue-500' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-sm font-medium">Connections to Workspaces</span>
                    </Link>

                    <Link 
                        to="/dashboard/ai-assistants" 
                        className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${isActive('/dashboard/ai-assistants') ? 'bg-gray-700 text-white border-r-2 border-blue-500' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">AI Assistants</span>
                    </Link>

                    <Link 
                        to="/dashboard/tasks" 
                        className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${isActive('/dashboard/tasks') ? 'bg-gray-700 text-white border-r-2 border-blue-500' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span className="text-sm font-medium">Task Automation</span>
                    </Link>

                    <Link 
                        to="/dashboard/github" 
                        className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${isActive('/dashboard/github') ? 'bg-gray-700 text-white border-r-2 border-blue-500' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span className="text-sm font-medium">GitHub</span>
                    </Link>

                    <div className="border-t border-gray-700 my-4"></div>

                    <Link 
                        to="/dashboard/analytics" 
                        className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${isActive('/dashboard/analytics') ? 'bg-gray-700 text-white border-r-2 border-blue-500' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="text-sm font-medium">Usage</span>
                    </Link>

                    <Link 
                        to="/dashboard/team" 
                        className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${isActive('/dashboard/team') ? 'bg-gray-700 text-white border-r-2 border-blue-500' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm font-medium">Team</span>
                    </Link>
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors rounded"
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="text-gray-500 focus:outline-none focus:text-gray-700 lg:hidden"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div className="flex items-center space-x-2">
                                <span className="text-lg font-semibold text-gray-800">Dashboard</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto bg-gray-50">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;