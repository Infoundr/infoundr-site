import React, { useState } from 'react';

const ConnectionsToWorkspaces: React.FC = () => {
    const [connections, setConnections] = useState([
        {
            id: 1,
            name: 'GitHub',
            description: 'Connect GitHub for Background Agents, Bugbot and enhanced codebase context',
            icon: '🐙',
            connected: false,
            type: 'repository'
        },
        {
            id: 2,
            name: 'GitLab',
            description: 'Connect GitLab for Bugbot and enhanced codebase context',
            icon: '🦊',
            connected: false,
            type: 'repository'
        },
        {
            id: 3,
            name: 'Slack',
            description: 'Work with Background Agents from Slack',
            icon: '💬',
            connected: true,
            type: 'communication'
        },
        {
            id: 4,
            name: 'Linear',
            description: 'Connect a Linear workspace to delegate issues to Background Agents',
            icon: '📊',
            connected: false,
            type: 'project_management'
        },
        {
            id: 5,
            name: 'Notion',
            description: 'Connect Notion for document management and knowledge base integration',
            icon: '📝',
            connected: false,
            type: 'documentation'
        },
        {
            id: 6,
            name: 'Discord',
            description: 'Integrate Discord for team communication and bot interactions',
            icon: '🎮',
            connected: false,
            type: 'communication'
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

            {/* API Keys Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Workspace API Keys</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Workspace API Keys provide secure, programmatic access to your connected workspaces, 
                    including the headless version of the Agent CLI and Background Agent API. 
                    Treat them like passwords: keep them secure and never share them publicly.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-2">🔑</div>
                        <p className="text-gray-500 text-sm mb-1">No API Keys Yet</p>
                        <p className="text-gray-400 text-xs">No API Keys have been created yet</p>
                    </div>
                    <div className="text-center mt-4">
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center mx-auto">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New API Key
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h3 className="font-medium text-gray-800">Import Workspace</h3>
                            <p className="text-sm text-gray-600">Import existing workspace configuration</p>
                        </div>
                    </button>
                    
                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h3 className="font-medium text-gray-800">Sync All</h3>
                            <p className="text-sm text-gray-600">Sync all connected workspaces</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectionsToWorkspaces;
