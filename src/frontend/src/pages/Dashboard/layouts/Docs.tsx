import React from 'react';

const Docs: React.FC = () => {
    const documentationSections = [
        {
            title: 'Getting Started',
            description: 'Learn the basics and set up your workspace',
            icon: '🚀',
            links: [
                { title: 'Quick Start Guide', url: '#', description: 'Get up and running in minutes' },
                { title: 'Installation', url: '#', description: 'Install and configure the platform' },
                { title: 'First Steps', url: '#', description: 'Your first project setup' },
            ]
        },
        {
            title: 'AI Assistants',
            description: 'Configure and manage your AI assistants',
            icon: '🤖',
            links: [
                { title: 'Creating Assistants', url: '#', description: 'Build custom AI assistants' },
                { title: 'Assistant Configuration', url: '#', description: 'Configure assistant behavior' },
                { title: 'Training Data', url: '#', description: 'Upload and manage training data' },
            ]
        },
        {
            title: 'Task Automation',
            description: 'Automate your workflow with smart tasks',
            icon: '⚡',
            links: [
                { title: 'Creating Tasks', url: '#', description: 'Set up automated tasks' },
                { title: 'Task Triggers', url: '#', description: 'Configure when tasks run' },
                { title: 'Task Monitoring', url: '#', description: 'Monitor task execution' },
            ]
        },
        {
            title: 'Workspace Connections',
            description: 'Connect your favorite tools and platforms',
            icon: '🔗',
            links: [
                { title: 'GitHub Integration', url: '#', description: 'Connect your GitHub repositories' },
                { title: 'Slack Integration', url: '#', description: 'Integrate with Slack workspace' },
                { title: 'API Keys', url: '#', description: 'Manage workspace API keys' },
            ]
        },
        {
            title: 'Analytics & Usage',
            description: 'Track your usage and optimize performance',
            icon: '📊',
            links: [
                { title: 'Usage Analytics', url: '#', description: 'Understand your usage patterns' },
                { title: 'Performance Metrics', url: '#', description: 'Track system performance' },
                { title: 'Cost Optimization', url: '#', description: 'Optimize your usage costs' },
            ]
        },
        {
            title: 'API Reference',
            description: 'Complete API documentation and examples',
            icon: '🔧',
            links: [
                { title: 'REST API', url: '#', description: 'Complete REST API reference' },
                { title: 'Webhooks', url: '#', description: 'Set up webhook integrations' },
                { title: 'SDK Examples', url: '#', description: 'Code examples and SDKs' },
            ]
        }
    ];

    const quickLinks = [
        { title: 'Troubleshooting', url: '#', icon: '🔧' },
        { title: 'FAQ', url: '#', icon: '❓' },
        { title: 'Community Forum', url: '#', icon: '💬' },
        { title: 'Video Tutorials', url: '#', icon: '🎥' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Documentation</h1>
                <p className="text-gray-600">Find guides, tutorials, and API references to help you get the most out of the platform.</p>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-2xl">{link.icon}</span>
                            <span className="font-medium text-gray-800">{link.title}</span>
                        </a>
                    ))}
                </div>
            </div>

            {/* Documentation Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documentationSections.map((section, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <span className="text-2xl">{section.icon}</span>
                            <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                        <div className="space-y-2">
                            {section.links.map((link, linkIndex) => (
                                <a
                                    key={linkIndex}
                                    href={link.url}
                                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="font-medium text-gray-800 mb-1">{link.title}</div>
                                    <div className="text-sm text-gray-600">{link.description}</div>
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Search Documentation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Search Documentation</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search documentation..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors">
                        Search
                    </button>
                </div>
            </div>

            {/* Popular Articles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Popular Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="#" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <div>
                            <div className="font-medium text-gray-800">Setting up your first AI assistant</div>
                            <div className="text-sm text-gray-600">Complete guide to creating and configuring AI assistants</div>
                        </div>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-bold">2</span>
                        </div>
                        <div>
                            <div className="font-medium text-gray-800">Connecting GitHub repositories</div>
                            <div className="text-sm text-gray-600">Step-by-step GitHub integration guide</div>
                        </div>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-purple-600 font-bold">3</span>
                        </div>
                        <div>
                            <div className="font-medium text-gray-800">Automating repetitive tasks</div>
                            <div className="text-sm text-gray-600">Create efficient workflows with task automation</div>
                        </div>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 font-bold">4</span>
                        </div>
                        <div>
                            <div className="font-medium text-gray-800">Understanding usage analytics</div>
                            <div className="text-sm text-gray-600">Track and optimize your platform usage</div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Docs;
