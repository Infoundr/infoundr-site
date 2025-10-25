import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { _SERVICE } from "../../../../../declarations/backend/backend.did";
import { mockChatHistory, mockTasks, mockGithubIssues, useMockData } from '../../../mocks/mockData';
import { AnalyticsSummary, UserAnalytics } from '../../../types/analytics';
import { createAnalyticsService } from '../../../services/analytics';
import { getCurrentUser } from '../../../services/auth';
import { createSubscriptionService } from '../../../services/subscription';
import { AreaChartComponent } from '../../../components/charts/AreaChart';

interface Props {
    actor: _SERVICE;
    useMockData?: boolean;
}

const DashboardHome: React.FC<Props> = ({ actor, useMockData = true }) => {
    const navigate = useNavigate();
    const [chatCount, setChatCount] = useState(0);
    const [taskCount, setTaskCount] = useState(0);
    const [issueCount, setIssueCount] = useState(0);
    const [loading, setLoading] = useState(true);

    let forceMockData = false;
    
    // Analytics state
    const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState(7); // 7 days by default
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);

    // Subscription state
    const [isPro, setIsPro] = useState(false);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);

    // Modal state
    const [showContactModal, setShowContactModal] = useState(false);

    // Fetch analytics data
    const fetchAnalytics = async (period: number) => {
        try {
            setAnalyticsLoading(true);
            if (!forceMockData && actor) {
                const analyticsService = createAnalyticsService();
                
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
                // Mock analytics data - dynamic based on period
                const generateMockData = (period: number) => {
                    let labels: string[] = [];
                    let data: number[] = [];
                    let baseRequests = 0;
                    let baseLines = 0;
                    let baseInteractions = 0;
                    let baseTasks = 0;

                    if (period === 1) {
                        // 1 day - hourly data
                        labels = ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
                        data = [2, 1, 0, 3, 8, 12, 15, 9];
                        baseRequests = 50;
                        baseLines = 1200;
                        baseInteractions = 25;
                        baseTasks = 3;
                    } else if (period === 7) {
                        // 7 days - daily data
                        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                        data = [12, 19, 8, 15, 22, 18, 25];
                        baseRequests = 156;
                        baseLines = 4353;
                        baseInteractions = 89;
                        baseTasks = 12;
                    } else if (period === 30) {
                        // 30 days - weekly data
                        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                        data = [45, 52, 38, 61];
                        baseRequests = 650;
                        baseLines = 18500;
                        baseInteractions = 350;
                        baseTasks = 45;
                    }

                    return {
                        requests_made: baseRequests,
                        lines_of_agent_edits: baseLines,
                        ai_interactions: baseInteractions,
                        tasks_completed: baseTasks,
                        chart_data: {
                            labels: labels,
                            datasets: [{
                                label: 'Requests',
                                data: data,
                                background_color: 'rgba(59, 130, 246, 0.1)',
                                border_color: 'rgba(59, 130, 246, 1)'
                            }]
                        }
                    };
                };

                setAnalytics(generateMockData(period));
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
                const analyticsService = createAnalyticsService();
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

    // Fetch subscription status
    const fetchSubscriptionStatus = async () => {
        try {
            setSubscriptionLoading(true);
            if (!forceMockData && actor) {
                const subscriptionService = createSubscriptionService(actor);
                const proStatus = await subscriptionService.isUserPro();
                setIsPro(proStatus);
            } else {
                // Mock subscription status
                setIsPro(false); // Default to Free plan for mock data
            }
        } catch (error) {
            console.error('Error fetching subscription status:', error);
            setIsPro(false);
        } finally {
            setSubscriptionLoading(false);
        }
    };

    // Fetch analytics when component mounts or period changes
    useEffect(() => {
        fetchAnalytics(selectedPeriod);
    }, [actor, forceMockData, selectedPeriod]);

    // Fetch subscription status when component mounts
    useEffect(() => {
        fetchSubscriptionStatus();
    }, [actor, forceMockData]);

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
                {analytics && analytics.chart_data && analytics.chart_data.labels && analytics.chart_data.datasets && analytics.chart_data.datasets[0] && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Usage Over Time</h3>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <AreaChartComponent 
                                data={analytics.chart_data.labels.map((label, index) => ({
                                    name: label,
                                    value: analytics.chart_data.datasets[0]?.data[index] || 0
                                }))}
                                className="h-48"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Subscription Plans Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pro Plan */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Pro</h3>
                        {isPro ? (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Current</span>
                        ) : (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Free</span>
                        )}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">$20/mo.</div>
                    <p className="text-sm text-gray-600 mb-4">Entry-level plan with access to premium models, unlimited Tab completions, and more.</p>
                    {isPro ? (
                        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                            Manage Subscription
                        </button>
                    ) : (
                        <button 
                            onClick={() => navigate('/payment/checkout')}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Upgrade to Pro
                        </button>
                    )}
                </div>

                {/* Enterprise Plan */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Enterprise</h3>
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">Custom</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-4">Contact us for pricing</div>
                    <p className="text-sm text-gray-600 mb-4">Custom solutions for large teams with dedicated support, advanced features, and enterprise-grade security.</p>
                    <button 
                        onClick={() => setShowContactModal(true)}
                        className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors flex items-center justify-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Us
                    </button>
                </div>
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Contact Us</h3>
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-gray-600 mb-4">
                                For Enterprise plan inquiries, please reach out to our team:
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-800 font-medium">hi@infoundr.com</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">
                                We'll get back to you within 24 hours to discuss your enterprise needs and provide a custom quote.
                            </p>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => window.open('mailto:hi@infoundr.com?subject=Enterprise Plan Inquiry', '_blank')}
                                className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Send Email
                            </button>
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default DashboardHome;