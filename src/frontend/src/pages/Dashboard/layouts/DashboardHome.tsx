import React, { useState, useEffect } from 'react';
import { _SERVICE } from "../../../../../declarations/backend/backend.did";
import { mockChatHistory, mockTasks, mockGithubIssues, useMockData } from '../../../mocks/mockData';
import { AnalyticsSummary, UserAnalytics } from '../../../types/analytics';
import { createAnalyticsService } from '../../../services/analytics';
import { getCurrentUser } from '../../../services/auth';

interface Props {
    actor: _SERVICE;
    useMockData?: boolean;
}

const DashboardHome: React.FC<Props> = ({ actor, useMockData = true }) => {
    const [chatCount, setChatCount] = useState(0);
    const [taskCount, setTaskCount] = useState(0);
    const [issueCount, setIssueCount] = useState(0);
    const [loading, setLoading] = useState(true);

    let forceMockData = true;
    
    // Analytics state
    const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState(7); // 7 days by default
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);

    // Fetch analytics data
    const fetchAnalytics = async (period: number) => {
        try {
            setAnalyticsLoading(true);
            if (!forceMockData && actor) {
                const analyticsService = createAnalyticsService(actor);
                
                // Get current user to get the user ID
                const currentUser = await getCurrentUser();
                if (!currentUser || currentUser.length === 0) {
                    console.error('No authenticated user found');
                    setAnalytics(null);
                    return;
                }
                
                // Use the principal as the user ID
                const userId = currentUser[0].principal.toString();
                console.log('Fetching analytics for user:', userId);
                
                const analyticsData = await analyticsService.getAnalyticsSummary(period);
                setAnalytics(analyticsData);
            } else {
                // Mock analytics data
                setAnalytics({
                    requests_made: 156,
                    lines_of_agent_edits: 4353,
                    ai_interactions: 89,
                    tasks_completed: 12,
                    chart_data: {
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            label: 'Requests',
                            data: [12, 19, 8, 15, 22, 18, 25],
                            background_color: 'rgba(59, 130, 246, 0.1)',
                            border_color: 'rgba(59, 130, 246, 1)'
                        }]
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setAnalyticsError(error instanceof Error ? error.message : 'Failed to fetch analytics');
            setAnalytics(null);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (forceMockData) {
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
    }, [actor, forceMockData]);

    // Record analytics data (call this when user makes requests)
    const recordAnalytics = async (
        requestsMade: number = 1,
        linesOfCodeEdited: number = 0,
        aiInteractions: number = 0,
        tasksCompleted: number = 0
    ) => {
        try {
            if (!forceMockData && actor) {
                const analyticsService = createAnalyticsService(actor);
                const currentUser = await getCurrentUser();
                
                if (currentUser && currentUser.length > 0 && currentUser[0]) {
                    await analyticsService.recordAnalyticsData(
                        requestsMade,
                        linesOfCodeEdited,
                        aiInteractions,
                        tasksCompleted
                    );
                    
                    // Refresh analytics data after recording
                    fetchAnalytics(selectedPeriod);
                }
            }
        } catch (error) {
            console.error('Error recording analytics:', error);
        }
    };

    // Fetch analytics when component mounts or period changes
    useEffect(() => {
        fetchAnalytics(selectedPeriod);
    }, [actor, forceMockData, selectedPeriod]);

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
                        {/* Test button for recording analytics - remove in production */}
                        {!forceMockData && (
                            <button
                                onClick={() => recordAnalytics(1, 50, 1, 0)}
                                className="px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                            >
                                Test Record
                            </button>
                        )}
                        <button 
                            onClick={() => setSelectedPeriod(1)}
                            className={`px-3 py-1 text-sm rounded-md ${
                                selectedPeriod === 1 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            1d
                        </button>
                        <button 
                            onClick={() => setSelectedPeriod(7)}
                            className={`px-3 py-1 text-sm rounded-md ${
                                selectedPeriod === 7 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            7d
                        </button>
                        <button 
                            onClick={() => setSelectedPeriod(30)}
                            className={`px-3 py-1 text-sm rounded-md ${
                                selectedPeriod === 30 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            30d
                        </button>
                    </div>
                </div>
                
                {analyticsLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                ) : analytics ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600">Requests Made</h3>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{analytics.requests_made.toLocaleString()}</div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600">Lines of Agent Edits</h3>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{analytics.lines_of_agent_edits.toLocaleString()}</div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600">AI Interactions</h3>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{analytics.ai_interactions.toLocaleString()}</div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600">Tasks Completed</h3>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{analytics.tasks_completed.toLocaleString()}</div>
                        </div>
                    </div>
                ) : analyticsError ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="text-red-500 text-sm">
                            Error: {analyticsError}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-32">
                        <div className="text-gray-400 text-sm">No analytics data available</div>
                    </div>
                )}

                {/* Usage Chart */}
                {analytics && analytics.chart_data && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Usage Over Time</h3>
                        <div className="h-48 bg-gray-50 rounded-lg p-4">
                            <div className="flex items-end justify-between h-full space-x-2">
                                {analytics.chart_data.datasets[0]?.data.map((value, index) => (
                                    <div key={index} className="flex flex-col items-center flex-1">
                                        <div 
                                            className="bg-blue-500 rounded-t w-full mb-2 transition-all duration-300 hover:bg-blue-600"
                                            style={{ 
                                                height: `${Math.max((value / Math.max(...analytics.chart_data.datasets[0].data)) * 100, 10)}%` 
                                            }}
                                        ></div>
                                        <span className="text-xs text-gray-500">
                                            {analytics.chart_data.labels[index]}
                                        </span>
                                        <span className="text-xs text-gray-700 font-medium">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
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
