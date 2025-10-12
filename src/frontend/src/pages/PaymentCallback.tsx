import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyPayment } from '../services/payment';

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      try {
        // Get the reference from URL params or session storage
        const urlParams = new URLSearchParams(window.location.search);
        const referenceFromUrl = urlParams.get('reference');
        const referenceFromSession = sessionStorage.getItem('pending_payment_reference');
        
        const reference = referenceFromUrl || referenceFromSession;
        
        if (!reference) {
          setStatus('failed');
          setMessage('No payment reference found. Please try again.');
          return;
        }

        console.log('Verifying payment with reference:', reference);
        
        // Verify the payment
        const isSuccess = await verifyPayment(reference);
        
        if (isSuccess) {
          setStatus('success');
          setMessage('Payment successful! Your Pro subscription is now active.');
          
          // Clear the pending reference
          sessionStorage.removeItem('pending_payment_reference');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('failed');
          setMessage('Payment verification failed. Please contact support if you were charged.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage('An error occurred while verifying your payment. Please contact support.');
      }
    };

    verifyPaymentStatus();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="mb-6">
              <svg
                className="animate-spin h-16 w-16 mx-auto text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="mb-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="h-10 w-10 text-red-600"
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
              </div>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/#pricing')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;

