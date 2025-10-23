import React, { useState } from 'react';

const ConnectionsToWorkspaces: React.FC = () => {
    const [connections, setConnections] = useState([
        {
            id: 1,
            name: 'Slack',
            description: 'Work with Background Agents from Slack',
            icon: '💬',
            connected: true,
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

    const handleConnect = (id: number) => {
        setConnections(prev => 
            prev.map(conn => 
                conn.id === id 
                    ? { ...conn, connected: !conn.connected }
                    : conn
            )
        );
    };

    const connectedCount = connections.filter(conn => conn.connected).length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Connections to Workspaces</h1>
                <p className="text-gray-600">Connect your favorite tools and platforms to create a unified workspace experience.</p>
                <div className="mt-4 flex items-center space-x-4">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {connectedCount} Connected
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
                                : 'border-gray-200 hover:border-gray-300'
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
                                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                                    connection.connected
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                {connection.connected ? 'Connected' : 'Connect'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConnectionsToWorkspaces;
