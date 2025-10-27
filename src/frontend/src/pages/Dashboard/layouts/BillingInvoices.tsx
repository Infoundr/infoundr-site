import React, { useState } from 'react';

const BillingInvoices: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('current');

    const includedUsage = [
        { item: 'Auto', quantity: '315M tokens', cost: '$118.77 Included' },
        { item: 'claude-4.5-sonnet', quantity: '21.7M tokens', cost: '$13.42 Included' },
    ];

    const onDemandUsage = [
        // Empty for now - no on-demand usage
    ];

    const invoices = [
        // Empty for now - no invoices
    ];

    const totalIncluded = includedUsage.reduce((sum, item) => {
        const cost = parseFloat(item.cost.replace('$', '').replace(' Included', ''));
        return sum + cost;
    }, 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Billing & Invoices</h1>
                <p className="text-gray-600">Manage your subscription and view billing details.</p>
            </div>

            {/* Subscription Management */}
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

            {/* Included Usage */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Included Usage</h3>
                    <div className="text-sm text-gray-600">Oct 10, 2025 - Nov 10, 2025</div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Item</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Quantity</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-3 px-4 text-sm font-medium text-gray-800">Included in Pro</td>
                                <td className="py-3 px-4 text-sm text-gray-600">-</td>
                                <td className="py-3 px-4 text-sm text-gray-600">-</td>
                            </tr>
                            {includedUsage.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-sm text-gray-800">{item.item}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{item.quantity}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{item.cost}</td>
                                </tr>
                            ))}
                            <tr className="border-t-2 border-gray-200 font-medium">
                                <td className="py-3 px-4 text-sm text-gray-800">Total</td>
                                <td className="py-3 px-4 text-sm text-gray-600">336.7M</td>
                                <td className="py-3 px-4 text-sm text-gray-600">${totalIncluded.toFixed(2)} Included</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4">
                    <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                        Manage subscription
                    </button>
                </div>
            </div>

            {/* On-Demand Usage */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">On-Demand Usage</h3>
                    <div className="text-sm text-gray-600">Sep 1, 2025 - Oct 1, 2025</div>
                </div>
                
                <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">💰</div>
                    <p className="text-gray-500 text-lg">Current total: $0.00</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tokens</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cost</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Qty</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">
                                    No on-demand usage for this period
                                </td>
                            </tr>
                            <tr className="border-t-2 border-gray-200 font-medium">
                                <td className="py-3 px-4 text-sm text-gray-800">Subtotal:</td>
                                <td className="py-3 px-4 text-sm text-gray-600">-</td>
                                <td className="py-3 px-4 text-sm text-gray-600">-</td>
                                <td className="py-3 px-4 text-sm text-gray-600">-</td>
                                <td className="py-3 px-4 text-sm text-gray-600">$0.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Invoices</h3>
                
                <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📄</div>
                    <p className="text-gray-500 text-lg">No invoices found for September 30, 2025</p>
                </div>
            </div>
        </div>
    );
};

export default BillingInvoices;
