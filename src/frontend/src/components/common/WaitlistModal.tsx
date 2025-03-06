import React, { useState, useEffect } from 'react';
import Button from './Button';
import { loginWithII, loginWithNFID } from '../../services/auth';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Email signup handler
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const actor = await loginWithII();
      await actor.join_waitlist(name);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to join waitlist");
    } finally {
      setIsLoading(false);
    }
  };

  // Internet Identity signin handler
  const handleIISignin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const actor = await loginWithII();
      const principal = await actor.getPrincipal();

      await actor.join_waitlist(
        `${principal.toString()}@ii.internet-identity.ic0.app`,
        `II User ${principal.toString().slice(0, 6)}`
      );
      
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setIsLoading(false);
    }
  };

  // NFID signin handler
  const handleNFIDSignin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const actor = await loginWithNFID();
      const principal = await actor.getPrincipal();

      await actor.join_waitlist(
        `${principal.toString()}@nfid.one`,
        `NFID User ${principal.toString().slice(0, 6)}`
      );
      
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] min-h-screen"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        // Close modal when clicking the backdrop (outside the modal)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 my-auto relative">
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

        <h2 className="text-3xl font-bold mb-8 text-center">Join the Waitlist</h2>
        
        {/* Email Signup Form */}
        <form onSubmit={handleEmailSignup} className="space-y-5 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 text-base">Continue with</span>
          </div>
        </div>

        {/* Internet Identity */}
        <Button
          variant="primary"
          className="w-full mb-4 flex items-center justify-center gap-3"
          onClick={handleIISignin}
          disabled={isLoading}
        >
          <img src="/images/icp-logo.png" alt="Internet Identity" className="w-6 h-6" />
          Join with Internet Identity
        </Button>

        {/* Email (using NFID) */}
        <Button
          variant="primary"
          className="w-full flex items-center justify-center gap-3"
          onClick={handleNFIDSignin}
          disabled={isLoading}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Join with Email
        </Button>

        {error && (
          <p className="mt-6 text-red-600 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default WaitlistModal; 