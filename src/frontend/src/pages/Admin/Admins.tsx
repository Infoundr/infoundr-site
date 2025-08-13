import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../declarations/backend/backend.did.d';
import Button from '../../components/common/Button';

interface AdminContext {
    actor: ActorSubclass<_SERVICE> | null;
    currentPrincipal: string;
}

const AdminAdmins: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { actor, currentPrincipal } = useOutletContext<AdminContext>();
    const [admins, setAdmins] = useState<Array<[any, any]>>([]);
    const [newAdminPrincipal, setNewAdminPrincipal] = useState<string>("");
    const [showAddAdminForm, setShowAddAdminForm] = useState<boolean>(false);
    const [isAddingAdmin, setIsAddingAdmin] = useState<boolean>(false);
    const [isRemovingAdmin, setIsRemovingAdmin] = useState<string | null>(null);
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'principal' | 'created_at'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        if (actor) {
            fetchAdmins(actor);
        }
    }, [actor]);

    const fetchAdmins = async (authenticatedActor: ActorSubclass<_SERVICE>) => {
        try {
            console.log('Fetching admins with actor:', authenticatedActor);
            console.log('Current Principal:', currentPrincipal);
            
            const adminsResult = await authenticatedActor.get_admin_details();
            console.log('Admins result:', adminsResult);
            
            setAdmins(adminsResult);
        } catch (error) {
            console.error('Error fetching admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async () => {
        if (!actor || !newAdminPrincipal.trim()) return;
        
        setIsAddingAdmin(true);
        try {
            const result = await actor.add_admin(newAdminPrincipal as any);
            if ('Ok' in result) {
                setNewAdminPrincipal("");
                setShowAddAdminForm(false);
                // Refresh admins list
                await fetchAdmins(actor);
                alert('Admin added successfully!');
            } else {
                alert(`Error adding admin: ${result.Err}`);
            }
        } catch (error) {
            console.error('Error adding admin:', error);
            alert('Error adding admin');
        } finally {
            setIsAddingAdmin(false);
        }
    };

    const handleRemoveAdmin = async (principal: string) => {
        if (!actor) return;
        
        if (!confirm(`Are you sure you want to remove admin ${principal}? This action cannot be undone.`)) return;
        
        setIsRemovingAdmin(principal);
        try {
            const result = await actor.remove_admin(principal as any);
            if ('Ok' in result) {
                // Refresh admins list
                await fetchAdmins(actor);
                alert('Admin removed successfully!');
            } else {
                alert(`Error removing admin: ${result.Err}`);
            }
        } catch (error) {
            console.error('Error removing admin:', error);
            alert('Error removing admin');
        } finally {
            setIsRemovingAdmin(null);
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
                    <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
                    <p className="text-gray-600">Manage admin access and permissions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        {admins.length} Admin Users
                    </div>
                </div>
            </div>

            {/* Add Admin Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Add New Admin</h3>
                    <Button
                        variant="primary"
                        className="!bg-[#8B5CF6] hover:!bg-[#7C3AED]"
                        onClick={() => setShowAddAdminForm(!showAddAdminForm)}
                    >
                        {showAddAdminForm ? 'Cancel' : 'Add Admin'}
                    </Button>
                </div>

                {showAddAdminForm && (
                    <div className="border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="principal" className="block text-sm font-medium text-gray-700 mb-2">
                                    Principal ID
                                </label>
                                <input
                                    type="text"
                                    id="principal"
                                    placeholder="Enter principal ID (e.g., 2vxsx-fae...)"
                                    value={newAdminPrincipal}
                                    onChange={(e) => setNewAdminPrincipal(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    The principal ID of the user you want to grant admin access to
                                </p>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    variant="primary"
                                    className="!bg-[#8B5CF6] hover:!bg-[#7C3AED] w-full"
                                    onClick={handleAddAdmin}
                                    disabled={!newAdminPrincipal.trim() || isAddingAdmin}
                                >
                                    {isAddingAdmin ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Adding...
                                        </div>
                                    ) : (
                                        'Add Admin'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Admins List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Current Admins</h3>
                    <p className="text-sm text-gray-600">These users have full administrative access to the platform</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Principal ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Admin Since
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.length > 0 ? (
                                admins.map((adminData, index) => {
                                    const principal = adminData[0].toString();
                                    const adminInfo = adminData[1];
                                    const isCurrentUser = false; // TODO: Check if this is the current user
                                    
                                    return (
                                        <tr key={principal} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-red-600">
                                                            🔐
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 font-mono">
                                                            {truncatePrincipal(principal)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {principal}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(adminInfo.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(principal);
                                                            alert('Principal ID copied to clipboard!');
                                                        }}
                                                    >
                                                        Copy ID
                                                    </Button>
                                                    {!isCurrentUser && (
                                                        <Button
                                                            variant="secondary"
                                                            className="text-red-600 hover:text-red-800 text-xs"
                                                            onClick={() => handleRemoveAdmin(principal)}
                                                            disabled={isRemovingAdmin === principal}
                                                        >
                                                            {isRemovingAdmin === principal ? 'Removing...' : 'Remove'}
                                                        </Button>
                                                    )}
                                                    {isCurrentUser && (
                                                        <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
                                                            Current User
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            No admin users found.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <p>
                                Admin users have full access to all platform features and data. Only add users you trust completely.
                                Removing an admin will immediately revoke their access.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAdmins; 