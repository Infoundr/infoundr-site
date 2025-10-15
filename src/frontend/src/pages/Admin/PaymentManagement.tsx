import React, { useState, useEffect } from 'react';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE, PaymentRecord, Invoice, PaymentStatus, Currency, UserSubscription, PaymentStats } from '../../../../declarations/backend/backend.did.d';
import { useOutletContext } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

interface AdminContext {
    actor: ActorSubclass<_SERVICE>;
    currentPrincipal: string;
}


const PaymentManagement: React.FC = () => {
    const { actor } = useOutletContext<AdminContext>();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'payments' | 'invoices' | 'subscriptions' | 'stats'>('payments');
    
    // Data states
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
    const [stats, setStats] = useState<PaymentStats | null>(null);

    useEffect(() => {
        fetchData();
    }, [actor]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch all data in parallel
            const [paymentsResult, invoicesResult, subscriptionsResult, statsResult] = await Promise.all([
                actor.admin_get_all_payments(),
                actor.admin_get_all_invoices(),
                actor.admin_get_all_subscriptions(),
                actor.admin_get_payment_stats()
            ]);

            if ('Ok' in paymentsResult) {
                setPayments(paymentsResult.Ok);
            }
            
            if ('Ok' in invoicesResult) {
                setInvoices(invoicesResult.Ok);
            }
            
            if ('Ok' in subscriptionsResult) {
                setSubscriptions(subscriptionsResult.Ok);
            }
            
            if ('Ok' in statsResult) {
                setStats(statsResult.Ok);
            }
        } catch (error) {
            console.error('Error fetching payment data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to convert Currency enum to string
    const getCurrencyString = (currency: Currency | string): string => {
        if (typeof currency === 'string') {
            return currency;
        }
        
        if ('NGN' in currency) return 'NGN';
        if ('GHS' in currency) return 'GHS';
        if ('ZAR' in currency) return 'ZAR';
        if ('KES' in currency) return 'KES';
        if ('USD' in currency) return 'USD';
        
        return 'NGN'; // Default fallback
    };

    const formatCurrency = (amount: number | bigint, currency: Currency | string = 'NGN') => {
        // Convert BigInt to number if needed
        const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;
        const currencyString = getCurrencyString(currency);
        
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currencyString,
        }).format(numAmount / 100); // Convert from kobo to main currency unit
    };

    const formatDate = (timestamp: number | bigint | undefined) => {
        if (timestamp === undefined) return '-';
        const numTimestamp = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
        return new Date(numTimestamp / 1000000).toLocaleString();
    };

    const getStatusBadge = (status: PaymentStatus | string) => {
        const getStatusString = (status: PaymentStatus | string): string => {
            if (typeof status === 'string') {
                return status;
            }
            
            if ('Success' in status) return 'Success';
            if ('Pending' in status) return 'Pending';
            if ('Failed' in status) return 'Failed';
            if ('Queued' in status) return 'Queued';
            if ('Abandoned' in status) return 'Abandoned';
            if ('Reversed' in status) return 'Reversed';
            
            return 'Unknown';
        };

        const statusString = getStatusString(status);
        const statusClasses = {
            'Success': 'bg-green-100 text-green-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Failed': 'bg-red-100 text-red-800',
            'Queued': 'bg-blue-100 text-blue-800',
            'Abandoned': 'bg-gray-100 text-gray-800',
            'Reversed': 'bg-orange-100 text-orange-800'
        };
        
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[statusString as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
                {statusString}
            </span>
        );
    };

    const getTierBadge = (tier: { Pro: null } | { Free: null } | string) => {
        if (typeof tier === 'string') {
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{tier}</span>;
        }
        
        if ('Pro' in tier) {
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Pro</span>;
        } else {
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Free</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Management</h2>
                <p className="text-gray-600">Monitor all payments, invoices, and subscription data across the platform.</p>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Successful Payments</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.successful_payments}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-2xl">📅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthly_revenue)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <span className="text-2xl">👥</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_payments}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                        {[
                            { key: 'payments', label: 'Payments', count: payments.length },
                            { key: 'invoices', label: 'Invoices', count: invoices.length },
                            { key: 'subscriptions', label: 'Subscriptions', count: subscriptions.length },
                            { key: 'stats', label: 'Statistics', count: 0 }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.key
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Payment Records</h3>
                                <button
                                    onClick={fetchData}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>
                            
                            {payments.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="text-4xl">💳</span>
                                    <p className="mt-2 text-gray-500">No payment records found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {payments.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                        {payment.paystack_reference}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {payment.user_id.substring(0, 8)}...
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(payment.amount, payment.currency)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                            {payment.tier} {payment.billing_period}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(payment.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(payment.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {payment.paid_at && payment.paid_at.length > 0 && payment.paid_at[0] !== undefined ? formatDate(payment.paid_at[0]) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Invoices Tab */}
                    {activeTab === 'invoices' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
                                <button
                                    onClick={fetchData}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>
                            
                            {invoices.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="text-4xl">📄</span>
                                    <p className="mt-2 text-gray-500">No invoices found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Number</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Period</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {invoices.map((invoice) => (
                                                <tr key={invoice.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                        {invoice.invoice_number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {invoice.user_id.substring(0, 8)}...
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(invoice.amount, invoice.currency)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                        {invoice.payment_id.substring(0, 8)}...
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {invoice.paid ? (
                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Paid</span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Unpaid</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(invoice.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Subscriptions Tab */}
                    {activeTab === 'subscriptions' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">User Subscriptions</h3>
                                <button
                                    onClick={fetchData}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>
                            
                            {subscriptions.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="text-4xl">👥</span>
                                    <p className="mt-2 text-gray-500">No subscription records found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Renewed</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {subscriptions.map((subscription) => (
                                                <tr key={subscription.user_id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                        {subscription.user_id.substring(0, 12)}...
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getTierBadge(subscription.tier)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {subscription.is_active ? (
                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {subscription.started_at_ns && subscription.started_at_ns.length > 0 && subscription.started_at_ns[0] !== undefined
                                                            ? formatDate(subscription.started_at_ns[0]) 
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {subscription.expires_at_ns && subscription.expires_at_ns.length > 0 && subscription.expires_at_ns[0] !== undefined
                                                            ? formatDate(subscription.expires_at_ns[0]) 
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {subscription.renewed_at_ns && subscription.renewed_at_ns.length > 0 && subscription.renewed_at_ns[0] !== undefined
                                                            ? formatDate(subscription.renewed_at_ns[0]) 
                                                            : '-'
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Statistics Tab */}
                    {activeTab === 'stats' && stats && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Detailed Statistics</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h4 className="text-sm font-medium text-gray-600 mb-4">Payment Overview</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Payments:</span>
                                            <span className="font-medium">{stats.total_payments}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Successful:</span>
                                            <span className="font-medium text-green-600">{stats.successful_payments}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Failed:</span>
                                            <span className="font-medium text-red-600">{stats.failed_payments}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Success Rate:</span>
                                            <span className="font-medium">
                                                {stats.total_payments > 0 
                                                    ? Math.round((stats.successful_payments / stats.total_payments) * 100)
                                                    : 0
                                                }%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h4 className="text-sm font-medium text-gray-600 mb-4">Revenue Breakdown</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Revenue:</span>
                                            <span className="font-medium">{formatCurrency(stats.total_revenue)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Monthly Revenue:</span>
                                            <span className="font-medium">{formatCurrency(stats.monthly_revenue)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Yearly Revenue:</span>
                                            <span className="font-medium">{formatCurrency(stats.yearly_revenue)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Average Payment:</span>
                                            <span className="font-medium">
                                                {stats.successful_payments > 0 
                                                    ? formatCurrency(
                                                        typeof stats.total_revenue === 'bigint' 
                                                            ? Number(stats.total_revenue) / stats.successful_payments
                                                            : stats.total_revenue / stats.successful_payments
                                                    )
                                                    : formatCurrency(0)
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentManagement;
