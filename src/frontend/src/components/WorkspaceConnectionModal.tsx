import React from 'react';

interface WorkspaceConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform: string;
}

const WorkspaceConnectionModal: React.FC<WorkspaceConnectionModalProps> = ({ 
    isOpen, 
    onClose, 
    platform 
}) => {
    if (!isOpen) return null;

    const getInstructions = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'slack':
                return {
                    title: 'Connect Your Slack Workspace',
                    steps: [
                        '1. Go to your Slack workspace',
                        '2. Tag the InFoundr AI Co-founder bot',
                        '3. Send any message to the bot (e.g., "Hello")',
                        '4. The bot will provide you with a connection link',
                        '5. Click the link to authenticate and link your workspace',
                        '6. Return to this dashboard to see your connection status'
                    ],
                    icon: '💬'
                };
            case 'discord':
                return {
                    title: 'Connect Your Discord Server',
                    steps: [
                        '1. Go to your Discord server',
                        '2. Find the InFoundr AI Co-founder bot',
                        '3. Send any message to the bot (e.g., "Hello")',
                        '4. The bot will provide you with a connection link',
                        '5. Click the link to authenticate and link your server',
                        '6. Return to this dashboard to see your connection status'
                    ],
                    icon: '🎮'
                };
            case 'openchat':
                return {
                    title: 'Connect Your OpenChat Account',
                    steps: [
                        '1. Go to your OpenChat app',
                        '2. Find the InFoundr AI Co-founder bot',
                        '3. Send any message to the bot (e.g., "Hello")',
                        '4. The bot will provide you with a connection link',
                        '5. Click the link to authenticate and link your account',
                        '6. Return to this dashboard to see your connection status'
                    ],
                    icon: '🤖'
                };
            default:
                return {
                    title: 'Connect Your Workspace',
                    steps: [
                        '1. Go to your workspace',
                        '2. Find the InFoundr AI Co-founder bot',
                        '3. Send any message to the bot',
                        '4. Follow the authentication instructions',
                        '5. Return to this dashboard to see your connection status'
                    ],
                    icon: '🔗'
                };
        }
    };

    const instructions = getInstructions(platform);

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="text-2xl">{instructions.icon}</div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                {instructions.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-3 mb-6">
                        <p className="text-gray-600 text-sm">
                            Follow these steps to connect your {platform} workspace:
                        </p>
                        <div className="space-y-3">
                            {instructions.steps.map((step, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                        {index + 1}
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium hover:shadow-md"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceConnectionModal;
