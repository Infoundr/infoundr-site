import React from 'react';
import Button from './Button';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryPlayground: () => void;
  onViewDocumentation: () => void;
}

const GetStartedModal: React.FC<GetStartedModalProps> = ({ 
  isOpen, 
  onClose, 
  onTryPlayground, 
  onViewDocumentation 
}) => {
  // Handle body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] min-h-screen"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 my-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">Get Started with InFoundr</h2>
          <p className="text-gray-600 text-lg">Try our AI Assistant instantly or install in your workspace</p>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-8">
          {/* Playground Option - Recommended */}
          <div 
            className="border-2 border-purple-300 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-gradient-to-r from-purple-50 to-indigo-50"
            onClick={onTryPlayground}
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center group-hover:from-purple-600 group-hover:to-indigo-600 transition-colors duration-200">
                <span className="text-xs font-bold text-white">PG</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">Try Playground Demo</h3>
                  <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-gray-600 mb-3">
                  Experience our AI Assistant instantly without any setup. Perfect for exploring features and getting a feel for the platform.
                </p>
                <div className="flex items-center text-sm text-purple-600 font-medium">
                  <span>Start chatting now - No setup required</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Documentation Option */}
          <div 
            className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={onViewDocumentation}
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-colors duration-200">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Install in Your Workspace</h3>
                <p className="text-gray-500 mb-3">
                  Get the full experience by installing our AI Assistant in your Slack, Discord, or OpenChat workspace with complete integration.
                </p>
                <div className="flex items-center text-sm text-gray-600 font-medium">
                  <span>View installation guide</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>💡 <strong>Tip:</strong> Try the playground first to see what our AI can do, then install for full integration!</p>
        </div>
      </div>
    </div>
  );
};

export default GetStartedModal;
