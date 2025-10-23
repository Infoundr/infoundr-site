import React, { useState } from 'react';

const UsageAnalytics: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [selectedDateRange, setSelectedDateRange] = useState('Oct 15 - Oct 23');

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

            {/* Subscription Plans */}
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

            {/* Usage Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">All Events</h2>
                    <div className="flex items-center space-x-4">
                        <select 
                            value={selectedDateRange}
                            onChange={(e) => setSelectedDateRange(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        >
                            <option value="Oct 15 - Oct 23">Oct 15 - Oct 23</option>
                            <option value="Oct 8 - Oct 15">Oct 8 - Oct 15</option>
                            <option value="Oct 1 - Oct 8">Oct 1 - Oct 8</option>
                        </select>
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
                        <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Model</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Kind</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tokens</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usageEvents.map((event, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-800">{event.date}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{event.model}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{event.kind}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600 flex items-center">
                                        {event.tokens}
                                        <svg className="w-3 h-3 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{event.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsageAnalytics;
