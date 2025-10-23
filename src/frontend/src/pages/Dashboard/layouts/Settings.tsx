import React, { useState } from 'react';

const Settings: React.FC = () => {
    const [onDemandUsage, setOnDemandUsage] = useState(false);
    const [shareData, setShareData] = useState(true);

    const activeSessions = [
        { id: 1, type: 'Desktop App', created: 'Created about 2 months ago', icon: '🖥️' },
        { id: 2, type: 'Desktop App', created: 'Created about 2 months ago', icon: '🖥️' },
        { id: 3, type: 'Web', created: 'Created about 1 month ago', icon: '🌐' },
        { id: 4, type: 'Desktop App', created: 'Created about 3 weeks ago', icon: '🖥️' },
        { id: 5, type: 'Web', created: 'Created about 2 weeks ago', icon: '🌐' },
    ];

    const handleRevokeSession = (sessionId: number) => {
        // TODO: Implement session revocation
        console.log('Revoking session:', sessionId);
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

            {/* On-Demand Usage */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">On-Demand Usage</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Allow users on your team to go beyond included usage limits. On-demand usage is billed in arrears.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <button
                                onClick={() => setOnDemandUsage(!onDemandUsage)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    onDemandUsage ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        onDemandUsage ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
                <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                    Save Limits
                </button>
            </div>

            {/* Privacy */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Privacy</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-medium text-gray-800">Share Data</h4>
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                    Active
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                                Your prompts, edits and other usage data will be stored and trained on by Cursor to improve the product.
                            </p>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                                Learn More
                            </a>
                        </div>
                        <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                            Edit
                        </button>
                    </div>
                </div>
            </div>

            {/* Student Verification */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Student Verification</h3>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-2">Student Status</h4>
                        <p className="text-sm text-gray-600">
                            Only .edu emails and specific educational domains are eligible for student verification.
                        </p>
                    </div>
                    <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Not Eligible</span>
                    </button>
                </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Active Sessions</h3>
                
                <div className="space-y-3">
                    {activeSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="text-lg">{session.icon}</span>
                                <div>
                                    <h4 className="font-medium text-gray-800">{session.type}</h4>
                                    <p className="text-sm text-gray-600">{session.created}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRevokeSession(session.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Revoke
                            </button>
                        </div>
                    ))}
                    
                    <div className="text-center pt-2">
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                            ... See 38 more
                        </a>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-4">
                        Session revocation may take up to 10 minutes to complete
                    </p>
                </div>
            </div>

            {/* More */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
            </div>
        </div>
    );
};

export default Settings;
