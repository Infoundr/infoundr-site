import React, { useState, useEffect } from 'react';
import { getLinkedWorkspaceAccounts } from '../../../services/workspace-connection';
import { createSettingsService, SettingsUserData } from '../../../services/settings';
import { mockActor, useMockData } from '../../../mocks/mockData';
import LoadingSpinner from '../../../components/LoadingSpinner';

const Settings: React.FC = () => {
    const [displayName, setDisplayName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempDisplayName, setTempDisplayName] = useState('');
    const [onDemandUsage, setOnDemandUsage] = useState(false);
    const [shareData, setShareData] = useState(true);
    const [linkedWorkspaces, setLinkedWorkspaces] = useState([
        { id: 1, name: 'Slack Workspace', platform: 'Slack', connected: 'Connected 2 months ago', icon: '💬', status: 'Active' },
        { id: 2, name: 'Discord Server', platform: 'Discord', connected: 'Connected 1 month ago', icon: '🎮', status: 'Active' },
        { id: 3, name: 'OpenChat Group', platform: 'OpenChat', connected: 'Connected 3 weeks ago', icon: '💬', status: 'Active' },
    ]);
    const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
    const [user, setUser] = useState<SettingsUserData | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [settingsService] = useState(() => createSettingsService());
    const [isSavingName, setIsSavingName] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error'>('success');

    // Fetch user data using the user service
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoadingUser(true);
                
                if (useMockData) {
                    // Set mock user data
                    const mockUserData: SettingsUserData = {
                        name: "John Doe",
                        email: "john@example.com",
                        plan: "Free Plan"
                    };
                    setUser(mockUserData);
                    setDisplayName(mockUserData.name);
                    setTempDisplayName(mockUserData.name);
                } else {
                    // Fetch real user data using the service
                    const userData = await settingsService.getCurrentUserData();
                    setUser(userData);
                    setDisplayName(userData.name);
                    setTempDisplayName(userData.name);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                // Set fallback data
                const fallbackUserData: SettingsUserData = {
                    name: "User",
                    email: "user@example.com",
                    plan: "Free Plan"
                };
                setUser(fallbackUserData);
                setDisplayName(fallbackUserData.name);
                setTempDisplayName(fallbackUserData.name);
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchUserData();
    }, [settingsService]);

    // Fetch linked workspace accounts on component load
    useEffect(() => {
        const checkLinkedAccounts = async () => {
            try {
                const linkedAccounts = await getLinkedWorkspaceAccounts();
                console.log('Linked accounts from backend:', linkedAccounts);
                
                // Update workspaces based on actual linked accounts
                setLinkedWorkspaces(prev => 
                    prev.map(workspace => ({
                        ...workspace,
                        status: linkedAccounts.includes(workspace.platform.toLowerCase()) ? 'Active' : 'Not Connected'
                    }))
                );
            } catch (error) {
                console.error('Error checking linked accounts:', error);
            } finally {
                setIsLoadingWorkspaces(false);
            }
        };
        
        checkLinkedAccounts();
    }, []);

    const handleEditName = () => {
        setIsEditingName(true);
        setTempDisplayName(displayName);
    };

    const handleSaveName = async () => {
        try {
            setIsSavingName(true);
            
            // Update via service first
            await settingsService.updateDisplayName(tempDisplayName);
            
            // Update local state only after successful backend update
            setDisplayName(tempDisplayName);
            setIsEditingName(false);
            
            // Show success modal
            setModalMessage('Display name updated successfully!');
            setModalType('success');
            setShowModal(true);
            
            console.log('Display name saved successfully:', tempDisplayName);
        } catch (error) {
            console.error('Error saving display name:', error);
            // Revert temp name on error
            setTempDisplayName(displayName);
            
            // Show error modal
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setModalMessage(`Failed to update display name: ${errorMessage}`);
            setModalType('error');
            setShowModal(true);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleCancelEdit = () => {
        setTempDisplayName(displayName);
        setIsEditingName(false);
    };

    const handleDisconnectWorkspace = (workspaceId: number) => {
        // TODO: Implement workspace disconnection
        console.log('Disconnecting workspace:', workspaceId);
    };

    const handleDeleteAccount = () => {
        // TODO: Implement account deletion
        console.log('Delete account requested');
    };

    // Show loading spinner while fetching user data
    if (isLoadingUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your account settings and preferences.</p>
            </div>

            {/* Profile Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Profile</h3>
                
                <div className="space-y-4">
                    {/* User Info Display */}
                    {user && (
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-lg font-medium">
                                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-800">{user.name}</h4>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <span className="inline-block mt-1 text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                                    {user.plan}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-800 mb-2">Display Name</h4>
                            <p className="text-sm text-gray-600 mb-2">
                                This is how your name will appear across the platform.
                            </p>
                            {isEditingName ? (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={tempDisplayName}
                                        onChange={(e) => setTempDisplayName(e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Enter your display name"
                                        autoFocus
                                        disabled={isSavingName}
                                    />
                                    <button
                                        onClick={handleSaveName}
                                        disabled={isSavingName}
                                        className="bg-purple-500 text-white py-2 px-3 rounded-md hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center space-x-2"
                                    >
                                        {isSavingName ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <span>Save</span>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={isSavingName}
                                        className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-800 font-medium">{displayName}</span>
                                    <button
                                        onClick={handleEditName}
                                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Privacy</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-medium text-gray-800">Data Sharing</h4>
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                                    Coming Soon
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                                Privacy controls and data sharing preferences will be available in a future update.
                            </p>
                        </div>
                        <button disabled className="bg-gray-100 text-gray-400 py-2 px-4 rounded-md cursor-not-allowed">
                            Coming Soon
                        </button>
                    </div>
                </div>
            </div>

            {/* Linked Workspaces */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Linked Workspaces</h3>
                
                {isLoadingWorkspaces ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {linkedWorkspaces.map((workspace) => (
                            <div key={workspace.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">{workspace.icon}</span>
                                    <div>
                                        <h4 className="font-medium text-gray-800">{workspace.name}</h4>
                                        <p className="text-sm text-gray-600">{workspace.platform} • {workspace.connected}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        workspace.status === 'Active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {workspace.status}
                                    </span>
                                    {/* {workspace.status === 'Active' && (
                                        <button
                                            onClick={() => handleDisconnectWorkspace(workspace.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Disconnect
                                        </button>
                                    )} */}
                                </div>
                            </div>
                        ))}
                        
                        <div className="text-center pt-2">
                            <a href="/dashboard/connections" className="text-sm text-purple-600 hover:text-purple-800">
                                Manage all connections →
                            </a>
                        </div>
                        
                        {/* <p className="text-xs text-gray-500 mt-4">
                            Disconnecting a workspace will remove access to AI assistants in that platform
                        </p> */}
                    </div>
                )}
            </div>

            {/* More */}
            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">More</h3>
                
                <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-2">Delete Account</h4>
                        <p className="text-sm text-gray-600">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                    </div>
                    <button
                        onClick={handleDeleteAccount}
                        className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div> */}

            {/* Success/Error Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center space-x-4">
                            {modalType === 'success' ? (
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className={`text-lg font-medium ${modalType === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                                    {modalType === 'success' ? 'Success!' : 'Error'}
                                </h3>
                                <p className={`mt-1 text-sm ${modalType === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                                    {modalMessage}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    modalType === 'success'
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;