import React, { useState, useEffect } from 'react';
import { createAnalyticsService } from '../../../services/analytics';
import { AnalyticsSummary } from '../../../types/analytics';
import { AreaChartComponent } from '../../../components/charts/AreaChart';

const UsageAnalytics: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [selectedDateRange, setSelectedDateRange] = useState('Oct 15 - Oct 23');
    const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch analytics data
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const analyticsService = createAnalyticsService();
                const days = selectedPeriod === '1d' ? 1 : selectedPeriod === '7d' ? 7 : 30;
                const data = await analyticsService.getAnalyticsSummary(days);
                
                setAnalyticsData(data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Failed to load analytics data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [selectedPeriod]);

    const usageEvents = [
        { date: 'Oct 23, 10:50 AM', model: 'auto', kind: 'Included', tokens: '1.2M', cost: '$0.31 Included' },
        { date: 'Oct 23, 10:47 AM', model: 'auto', kind: 'Included', tokens: '1M', cost: '$0.37 Included' },
        { date: 'Oct 23, 10:44 AM', model: 'auto', kind: 'Included', tokens: '2M', cost: '$0.53 Included' },
        { date: 'Oct 23, 10:39 AM', model: 'auto', kind: 'Included', tokens: '426.2K', cost: '$0.11 Included' },
        { date: 'Oct 23, 10:35 AM', model: 'auto', kind: 'Included', tokens: '1.7M', cost: '$0.52 Included' },
        { date: 'Oct 23, 09:48 AM', model: 'auto', kind: 'Included', tokens: '99.3K', cost: '$0.04 Included' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Usage Analytics</h1>
                <p className="text-gray-600">Track your usage patterns and optimize your workflow.</p>
            </div>

            {/* Analytics Overview */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-800">{error}</p>
                    </div>
                </div>
            ) : analyticsData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Requests Made</p>
                                <p className="text-2xl font-bold text-gray-900">{analyticsData.requests_made}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Lines of Code Edited</p>
                                <p className="text-2xl font-bold text-gray-900">{analyticsData.lines_of_agent_edits}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">AI Interactions</p>
                                <p className="text-2xl font-bold text-gray-900">{analyticsData.ai_interactions}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{analyticsData.tasks_completed}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Usage Chart */}
            {analyticsData && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Usage Trends</h3>
                        <div className="flex space-x-1">
                            {['1d', '7d', '30d'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-3 py-1 text-sm rounded-md ${
                                        selectedPeriod === period
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Area Chart Visualization */}
                    <AreaChartComponent 
                        data={analyticsData.chart_data.labels.map((label, index) => ({
                            name: label,
                            value: analyticsData.chart_data.datasets[0].data[index]
                        }))}
                        className="h-64"
                    />
                    
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Requests made over the last {selectedPeriod === '1d' ? 'day' : selectedPeriod === '7d' ? 'week' : 'month'}
                        </p>
                    </div>
                </div>
            )}

            {/* Analytics Summary */}
            {analyticsData && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-800">Analytics Summary</h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Last {selectedPeriod === '1d' ? '24 hours' : selectedPeriod === '7d' ? '7 days' : '30 days'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                                    <p className="text-2xl font-bold text-gray-900">{analyticsData.requests_made}</p>
                                </div>
                                <div className="text-blue-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">AI Interactions</p>
                                    <p className="text-2xl font-bold text-gray-900">{analyticsData.ai_interactions}</p>
                                </div>
                                <div className="text-purple-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Code Lines Edited</p>
                                    <p className="text-2xl font-bold text-gray-900">{analyticsData.lines_of_agent_edits}</p>
                                </div>
                                <div className="text-green-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">{analyticsData.tasks_completed}</p>
                                </div>
                                <div className="text-orange-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsageAnalytics;
