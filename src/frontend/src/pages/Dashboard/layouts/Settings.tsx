import React, { useState, useEffect } from 'react';
import { getLinkedWorkspaceAccounts } from '../../../services/workspace-connection';

const Settings: React.FC = () => {
    const [displayName, setDisplayName] = useState('Steve Kimoi');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempDisplayName, setTempDisplayName] = useState(displayName);
    const [onDemandUsage, setOnDemandUsage] = useState(false);
    const [shareData, setShareData] = useState(true);
    const [linkedWorkspaces, setLinkedWorkspaces] = useState([
        { id: 1, name: 'Slack Workspace', platform: 'Slack', connected: 'Connected 2 months ago', icon: '💬', status: 'Active' },
        { id: 2, name: 'Discord Server', platform: 'Discord', connected: 'Connected 1 month ago', icon: '🎮', status: 'Active' },
        { id: 3, name: 'OpenChat Group', platform: 'OpenChat', connected: 'Connected 3 weeks ago', icon: '💬', status: 'Active' },
    ]);
    const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);

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

    const handleSaveName = () => {
        setDisplayName(tempDisplayName);
        setIsEditingName(false);
        // TODO: Save to backend
        console.log('Saving display name:', tempDisplayName);
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
                                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter your display name"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveName}
                                        className="bg-purple-500 text-white py-2 px-3 rounded-md hover:bg-purple-600 transition-colors text-sm"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm"
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
        </div>
    );
};

export default Settings;