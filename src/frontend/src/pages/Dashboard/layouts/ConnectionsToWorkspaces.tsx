import React, { useState, useEffect } from 'react';
import WorkspaceConnectionModal from '../../../components/WorkspaceConnectionModal';
import { getLinkedWorkspaceAccounts } from '../../../services/workspace-connection';

const ConnectionsToWorkspaces: React.FC = () => {
    const [connections, setConnections] = useState([
        {
            id: 1,
            name: 'Slack',
            description: 'Work with Background Agents from Slack',
            icon: '💬',
            connected: false,
            type: 'communication'
        },
        {
            id: 2,
            name: 'Discord',
            description: 'Integrate Discord for team communication and bot interactions',
            icon: '🎮',
            connected: false,
            type: 'communication'
        },
        {
            id: 3,
            name: 'OpenChat',
            description: 'Connect OpenChat for enhanced AI interactions and workspace integration',
            icon: '🤖',
            connected: false,
            type: 'ai_platform'
        }
    ]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState('');

    // Check for linked workspace accounts on component load
    useEffect(() => {
        const checkLinkedAccounts = async () => {
            try {
                const linkedAccounts = await getLinkedWorkspaceAccounts();
                
                setConnections(prev => 
                    prev.map(conn => ({
                        ...conn,
                        connected: linkedAccounts.includes(conn.name.toLowerCase())
                    }))
                );
            } catch (error) {
                console.error('Error checking linked accounts:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        checkLinkedAccounts();
    }, []);

    const handleConnect = (id: number) => {
        const connection = connections.find(conn => conn.id === id);
        if (connection && !connection.connected) {
            setSelectedPlatform(connection.name);
            setModalOpen(true);
        }
    };

    const connectedCount = connections.filter(conn => conn.connected).length;

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Connections to Workspaces</h1>
                <p className="text-gray-600 mb-4">Connect your favorite tools and platforms to create a unified workspace experience.</p>
                <div className="flex items-center space-x-4">
                    <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{connectedCount} Connected</span>
                    </div>
                    <div className="bg-gray-50 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {connections.length - connectedCount} Available
                    </div>
                </div>
            </div>

            {/* Connections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connections.map((connection) => (
                    <div 
                        key={connection.id} 
                        className={`bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
                            connection.connected 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                        }`}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="text-2xl">{connection.icon}</div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{connection.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            connection.connected 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {connection.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                {connection.connected && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4">{connection.description}</p>
                            
                            <button
                                onClick={() => handleConnect(connection.id)}
                                className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                                    connection.connected
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-default'
                                        : 'bg-purple-500 text-white hover:bg-purple-600 hover:shadow-md transform hover:-translate-y-0.5'
                                }`}
                            >
                                {connection.connected ? (
                                    <span className="flex items-center justify-center space-x-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Connected</span>
                                    </span>
                                ) : (
                                    'Connect'
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Workspace Connection Modal */}
            <WorkspaceConnectionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                platform={selectedPlatform}
            />
        </div>
    );
};

export default ConnectionsToWorkspaces;
