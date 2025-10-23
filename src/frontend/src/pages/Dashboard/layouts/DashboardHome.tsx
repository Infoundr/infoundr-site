import React, { useState, useEffect } from 'react';
import { _SERVICE } from "../../../../../declarations/backend/backend.did";
import { mockChatHistory, mockTasks, mockGithubIssues, useMockData } from '../../../mocks/mockData';

interface Props {
    actor: _SERVICE;
    useMockData?: boolean;
}

const DashboardHome: React.FC<Props> = ({ actor, useMockData = true }) => {
    const [chatCount, setChatCount] = useState(0);
    const [taskCount, setTaskCount] = useState(0);
    const [issueCount, setIssueCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (useMockData) {
                    setChatCount(mockChatHistory.length);
                    setTaskCount(mockTasks.length);
                    setIssueCount(mockGithubIssues.length);
                } else {
                    // TODO: Implement real data fetching
                    setChatCount(0);
                    setTaskCount(0);
                    setIssueCount(0);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [actor, useMockData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Analytics Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Your Analytics</h2>
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md">1d</button>
                        <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md">7d</button>
                        <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md">30d</button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Lines of Agent Edits</h3>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">4,353</div>
                        <div className="text-sm text-gray-500">/ 46,428</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Tabs Accepted</h3>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">56</div>
                    </div>
                </div>

                {/* Simple Chart Placeholder */}
                <div className="mt-6 h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Usage Chart</div>
                </div>
            </div>

            {/* Subscription Plans Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Pro+</h3>
                        <span className="text-sm text-gray-500">$60/mo.</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Get 3x more usage than Pro, unlock higher limits on Agent, and more.</p>
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        Upgrade to Pro+
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Ultra</h3>
                        <span className="text-sm text-gray-500">$200/mo.</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Run parallel agents, get maximum value with 20x usage limits, and early access to advanced features.</p>
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        Upgrade to Ultra
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Pro</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Current</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-4">$20/mo.</div>
                    <p className="text-sm text-gray-600 mb-4">Entry-level plan with access to premium models, unlimited Tab completions, and more.</p>
                    <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                        Manage Subscription
                    </button>
                </div>
            </div>

            {/* On-Demand Usage */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">On-Demand Usage is Off</h3>
                        <p className="text-sm text-gray-600 mt-1">Go beyond your plan's included quota with on-demand usage</p>
                    </div>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                        Enable On-Demand Usage
                    </button>
                </div>
            </div>
            
        </div>
    );
};

export default DashboardHome;
