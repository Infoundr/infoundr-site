import React, { useState, useEffect } from 'react';
import Button from './Button';
import { AuthClient } from '@dfinity/auth-client';
import { canisterId, createActor } from '../../../../declarations/backend';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
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
      const actor = createActor(canisterId);
      await actor.join_waitlist(email, name);
      // TODO: Implement email verification flow
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
      const authClient = await AuthClient.create();
      
      // Start the login flow
      await new Promise((resolve) => {
        authClient.login({
          identityProvider: process.env.DFX_NETWORK === 'ic' 
            ? 'https://identity.ic0.app'
            : `http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`,
          onSuccess: resolve,
          onError: (error) => {
            throw error;
          },
        });
      });

      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal();

      const actor = createActor(canisterId, {
        agentOptions: {
          identity,
        },
      });

      // Use principal's toString() as a unique identifier
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
      const authClient = await AuthClient.create();
      
      await new Promise((resolve) => {
        authClient.login({
          identityProvider: process.env.DFX_NETWORK === 'ic'
            ? 'https://nfid.one'
            : 'https://nfid.one/authenticate/?applicationName=Infoundr',
          onSuccess: resolve,
          onError: (error) => {
            throw error;
          },
        });
      });

      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal();

      const actor = createActor(canisterId, {
        agentOptions: {
          identity,
        },
      });

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
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <Button 
            variant="primary" 
            className="w-full !bg-[#8B5CF6] hover:!bg-[#7C3AED]"
            disabled={isLoading}
          >
            {isLoading ? 'Joining...' : 'Join with Email'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 text-base">Or</span>
          </div>
        </div>

        {/* Internet Identity */}
        <Button
          variant="secondary"
          className="w-full mb-4 flex items-center justify-center gap-3"
          onClick={handleIISignin}
          disabled={isLoading}
        >
          <img src="/ii-logo.svg" alt="Internet Identity" className="w-6 h-6" />
          Join with Internet Identity
        </Button>

        {/* NFID */}
        <Button
          variant="secondary"
          className="w-full flex items-center justify-center gap-3"
          onClick={handleNFIDSignin}
          disabled={isLoading}
        >
          <img src="/nfid-logo.svg" alt="NFID" className="w-6 h-6" />
          Join with NFID
        </Button>

        {error && (
          <p className="mt-6 text-red-600 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default WaitlistModal; 