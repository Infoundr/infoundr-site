import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../declarations/backend/backend.did.d';
import Button from '../../components/common/Button';

interface AdminContext {
    actor: ActorSubclass<_SERVICE> | null;
    currentPrincipal: string;
}

const AdminUsers: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { actor, currentPrincipal } = useOutletContext<AdminContext>();
    const [users, setUsers] = useState<any[]>([]);
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'principal' | 'name' | 'email' | 'created_at'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        if (actor) {
            fetchUsers(actor);
        }
    }, [actor]);

    const fetchUsers = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            console.log('Fetching users with actor:', authenticatedActor);
            console.log('Current Principal:', currentPrincipal);
            
            const usersResult = await authenticatedActor.get_users();
            console.log('Users result:', usersResult);
            
            if ('Ok' in usersResult) {
                setUsers(usersResult.Ok);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
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

    // Filter and sort users
    const filteredAndSortedUsers = users
        .filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email && user.email.length > 0 && user.email[0] && user.email[0].toLowerCase().includes(searchTerm.toLowerCase())) ||
            user.principal.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'email':
                    aValue = (a.email && a.email.length > 0 && a.email[0] ? a.email[0] : '').toLowerCase();
                    bValue = (b.email && b.email.length > 0 && b.email[0] ? b.email[0] : '').toLowerCase();
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

    const handleSort = (field: 'principal' | 'name' | 'email' | 'created_at') => {
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

    const truncatePrincipal = (principal: string) => {
        if (principal.length <= 20) return principal;
        return `${principal.substring(0, 10)}...${principal.substring(principal.length - 10)}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Registered Users</h1>
                    <p className="text-gray-600">Manage and monitor all registered users on the platform</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {users.length} Total Users
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                            Search Users
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="search"
                                placeholder="Search by name, email, or principal..."
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
                            value={sortBy}
                            onChange={(e) => handleSort(e.target.value as 'principal' | 'name' | 'email' | 'created_at')}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="principal">Sort by Principal ID</option>
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

            {/* Users Table */}
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => handleSort('principal')}>
                                    <div className="flex items-center gap-2">
                                        Principal ID
                                        {sortBy === 'principal' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('created_at')}>
                                    <div className="flex items-center gap-2">
                                        Created At
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
                            {filteredAndSortedUsers.length > 0 ? (
                                filteredAndSortedUsers.map((user, index) => (
                                    <tr key={user.principal.toString()} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-purple-600">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 font-mono">
                                                {truncatePrincipal(user.principal.toString())}
                                            </div>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(user.principal.toString())}
                                                className="text-xs text-purple-600 hover:text-purple-800 ml-2"
                                                title="Copy to clipboard"
                                            >
                                                Copy
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                                    onClick={() => {
                                                        // TODO: Implement user details view
                                                        alert('User details view coming soon!');
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Results Summary */}
            {filteredAndSortedUsers.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="text-sm text-gray-600 text-center">
                        Showing {filteredAndSortedUsers.length} of {users.length} users
                        {searchTerm && ` matching "${searchTerm}"`}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers; 