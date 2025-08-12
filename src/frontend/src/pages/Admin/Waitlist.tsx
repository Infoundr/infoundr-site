import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createActor } from '../../../../declarations/backend';
import { HttpAgent, ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { _SERVICE } from '../../../../declarations/backend/backend.did.d';
import { CANISTER_ID } from '../../config';
import { WaitlistEntry } from '../../../../declarations/backend/backend.did';
import { checkIsAuthenticated, createAuthenticatedActor } from '../../services/auth';
import Button from '../../components/common/Button';

const AdminWaitlist: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [actor, setActor] = useState<ActorSubclass<_SERVICE> | null>(null);
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        initializeActor();
    }, []);

    const initializeActor = async () => {
        try {
            const auth = await checkIsAuthenticated();
            setIsAuthenticated(auth);
            
            if (auth) {
                const authenticatedActor = await createAuthenticatedActor();
                setActor(authenticatedActor);
                await checkAdminStatus(authenticatedActor);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error initializing actor:', error);
            setLoading(false);
        }
    };

    const checkAdminStatus = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            const isAdminUser = await authenticatedActor.is_admin();
            setIsAdmin(isAdminUser);
            if (isAdminUser) {
                await fetchWaitlist(authenticatedActor);
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    };

    const fetchWaitlist = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            const waitlistResult = await authenticatedActor.get_waitlist();
            if ('Ok' in waitlistResult) {
                setWaitlist(waitlistResult.Ok);
            }
        } catch (error) {
            console.error('Error fetching waitlist:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Authentication is now handled by AdminLayout
    if (!actor) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    // Filter and sort waitlist
    const filteredAndSortedWaitlist = waitlist
        .filter(entry => {
            const matchesSearch = 
                entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || 
                Object.keys(entry.status)[0] === statusFilter;
            
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'email':
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                    break;
                case 'created_at':
                    aValue = Number(a.created_at);
                    bValue = Number(b.created_at);
                    break;
                default:
                    return 0;
            }
            
            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

    const handleSort = (field: 'name' | 'email' | 'created_at') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const formatDate = (timestamp: bigint) => {
        return new Date(Number(timestamp) / 1000000).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: any) => {
        const statusKey = Object.keys(status)[0];
        const statusValue = status[statusKey];
        
        switch (statusKey) {
            case 'Pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⏳ Pending
                    </span>
                );
            case 'Approved':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Approved
                    </span>
                );
            case 'Rejected':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ❌ Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {statusKey}
                    </span>
                );
        }
    };

    const getStatusCounts = () => {
        const counts = { Pending: 0, Approved: 0, Rejected: 0 };
        waitlist.forEach(entry => {
            const status = Object.keys(entry.status)[0];
            if (counts.hasOwnProperty(status)) {
                counts[status as keyof typeof counts]++;
            }
        });
        return counts;
    };

    const statusCounts = getStatusCounts();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Waitlist Entries</h1>
                    <p className="text-gray-600">Review and manage waitlist applications</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {waitlist.length} Total Entries
                    </div>
                </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-400">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">⏳</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{statusCounts.Pending}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-400">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">✅</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Approved</p>
                            <p className="text-2xl font-bold text-gray-900">{statusCounts.Approved}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-400">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">❌</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Rejected</p>
                            <p className="text-2xl font-bold text-gray-900">{statusCounts.Rejected}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                            Search Entries
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="search"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Pending' | 'Approved' | 'Rejected')}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => handleSort(e.target.value as 'name' | 'email' | 'created_at')}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="created_at">Sort by Date</option>
                            <option value="name">Sort by Name</option>
                            <option value="email">Sort by Email</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Waitlist Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-2">
                                        Name
                                        {sortBy === 'name' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('email')}>
                                    <div className="flex items-center gap-2">
                                        Email
                                        {sortBy === 'email' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('created_at')}>
                                    <div className="flex items-center gap-2">
                                        Applied
                                        {sortBy === 'created_at' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedWaitlist.length > 0 ? (
                                filteredAndSortedWaitlist.map((entry, index) => (
                                    <tr key={entry.email} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-purple-600">
                                                        {entry.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{entry.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(entry.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(entry.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                                    onClick={() => {
                                                        // TODO: Implement entry details view
                                                        alert('Entry details view coming soon!');
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    className="text-green-600 hover:text-green-800 text-xs"
                                                    onClick={() => {
                                                        // TODO: Implement approve action
                                                        alert('Approve action coming soon!');
                                                    }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    className="text-red-600 hover:text-red-800 text-xs"
                                                    onClick={() => {
                                                        // TODO: Implement reject action
                                                        alert('Reject action coming soon!');
                                                    }}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            {searchTerm || statusFilter !== 'all' 
                                                ? 'No entries found matching your criteria.' 
                                                : 'No waitlist entries found.'}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Results Summary */}
            {filteredAndSortedWaitlist.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="text-sm text-gray-600 text-center">
                        Showing {filteredAndSortedWaitlist.length} of {waitlist.length} entries
                        {searchTerm && ` matching "${searchTerm}"`}
                        {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWaitlist; 