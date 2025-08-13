import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../declarations/backend/backend.did.d';
import Button from '../../components/common/Button';

interface AdminContext {
    actor: ActorSubclass<_SERVICE> | null;
    currentPrincipal: string;
}

const AdminAccelerators: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { actor, currentPrincipal } = useOutletContext<AdminContext>();
    const [accelerators, setAccelerators] = useState<any[]>([]);
    const [selectedAccelerator, setSelectedAccelerator] = useState<any>(null);
    const [showAcceleratorDetails, setShowAcceleratorDetails] = useState<boolean>(false);
    const [isDeletingAccelerator, setIsDeletingAccelerator] = useState<string | null>(null);
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'website' | 'total_startups'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        if (actor) {
            fetchAccelerators(actor);
        }
    }, [actor]);

    const fetchAccelerators = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            console.log('Fetching accelerators with actor:', authenticatedActor);
            console.log('Current Principal:', currentPrincipal);
            
            const acceleratorsResult = await authenticatedActor.get_all_accelerators();
            console.log('Accelerators result:', acceleratorsResult);
            
            if ('Ok' in acceleratorsResult) {
                setAccelerators(acceleratorsResult.Ok);
            }
        } catch (error) {
            console.error('Error fetching accelerators:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccelerator = async (id: any) => {
        if (!actor) return;

        const accelerator = accelerators.find(acc => acc.id.toString() === id.toString());
        if (!accelerator) return;

        if (!confirm(`Are you sure you want to delete accelerator "${accelerator.name}"? This action cannot be undone and will remove all associated data.`)) return;

        setIsDeletingAccelerator(id.toString());
        try {
            const result = await actor.delete_accelerator(id);
            if ('Ok' in result) {
                // Refresh accelerators list
                await fetchAccelerators(actor);
                alert('Accelerator deleted successfully!');
            } else {
                alert(`Error deleting accelerator: ${result.Err}`);
            }
        } catch (error) {
            console.error('Error deleting accelerator:', error);
            alert('Error deleting accelerator');
        } finally {
            setIsDeletingAccelerator(null);
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

    // Filter and sort accelerators
    const filteredAndSortedAccelerators = accelerators
        .filter(accelerator => 
            accelerator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            accelerator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            accelerator.website.toLowerCase().includes(searchTerm.toLowerCase())
        )
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
                case 'total_startups':
                    aValue = Number(a.total_startups);
                    bValue = Number(b.total_startups);
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

    const handleSort = (field: 'name' | 'email' | 'website' | 'total_startups') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getTotalStartups = () => {
        return accelerators.reduce((total, acc) => total + Number(acc.total_startups), 0);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Accelerator Management</h1>
                    <p className="text-gray-600">Manage accelerator programs and their associated data</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {accelerators.length} Accelerators
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {getTotalStartups()} Total Startups
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                            Search Accelerators
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="search"
                                placeholder="Search by name, email, or website..."
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
                            onChange={(e) => handleSort(e.target.value as 'name' | 'email' | 'website' | 'total_startups')}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="email">Sort by Email</option>
                            <option value="website">Sort by Website</option>
                            <option value="total_startups">Sort by Startups</option>
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

            {/* Accelerators Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-2">
                                        Accelerator
                                        {sortBy === 'name' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => handleSort('email')}>
                                    <div className="flex items-center gap-2">
                                        Contact
                                        {sortBy === 'email' && (
                                            <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Website
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('total_startups')}>
                                    <div className="flex items-center gap-2">
                                        Startups
                                        {sortBy === 'total_startups' && (
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
                            {filteredAndSortedAccelerators.length > 0 ? (
                                filteredAndSortedAccelerators.map((accelerator) => (
                                    <tr key={accelerator.id.toString()} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-green-600">
                                                        🚀
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{accelerator.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {accelerator.id.toString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{accelerator.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {accelerator.website ? (
                                                    <a 
                                                        href={accelerator.website.startsWith('http') ? accelerator.website : `https://${accelerator.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        {accelerator.website}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">No website</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {accelerator.total_startups}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                                    onClick={() => {
                                                        setSelectedAccelerator(accelerator);
                                                        setShowAcceleratorDetails(true);
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    className="text-red-600 hover:text-red-800 text-xs"
                                                    onClick={() => handleDeleteAccelerator(accelerator.id)}
                                                    disabled={isDeletingAccelerator === accelerator.id.toString()}
                                                >
                                                    {isDeletingAccelerator === accelerator.id.toString() ? 'Deleting...' : 'Delete'}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            {searchTerm ? 'No accelerators found matching your search.' : 'No accelerators found.'}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Results Summary */}
            {filteredAndSortedAccelerators.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="text-sm text-gray-600 text-center">
                        Showing {filteredAndSortedAccelerators.length} of {accelerators.length} accelerators
                        {searchTerm && ` matching "${searchTerm}"`}
                    </div>
                </div>
            )}

            {/* Accelerator Details Modal */}
            {showAcceleratorDetails && selectedAccelerator && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Accelerator Details</h3>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowAcceleratorDetails(false);
                                    setSelectedAccelerator(null);
                                }}
                            >
                                Close
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <p className="text-sm text-gray-900">{selectedAccelerator.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ID</label>
                                    <p className="text-sm text-gray-900 font-mono">{selectedAccelerator.id.toString()}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="text-sm text-gray-900">{selectedAccelerator.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Website</label>
                                    <p className="text-sm text-gray-900">
                                        {selectedAccelerator.website || 'No website'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Startups</label>
                                    <p className="text-sm text-gray-900 font-medium">{selectedAccelerator.total_startups}</p>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        className="text-red-600 hover:text-red-800"
                                        onClick={() => {
                                            setShowAcceleratorDetails(false);
                                            setSelectedAccelerator(null);
                                            handleDeleteAccelerator(selectedAccelerator.id);
                                        }}
                                    >
                                        Delete Accelerator
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAccelerators; 