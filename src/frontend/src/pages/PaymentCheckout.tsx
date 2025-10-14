import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/common/PaymentModal';
import InFoundrNotification from '../components/common/InFoundrNotification';
import { useInFoundrNotification } from '../hooks/useInFoundrNotification';
import { getCurrentUser, hasActiveProSubscription } from '../services/auth';

const PaymentCheckout: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [hasProSubscription, setHasProSubscription] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const { notification, showSuccess, hideNotification } = useInFoundrNotification();

  useEffect(() => {
    const checkSubscriptionAndFetchUser = async () => {
      try {
        // Check if user already has Pro subscription
        const hasPro = await hasActiveProSubscription();
        setHasProSubscription(hasPro);
        
        if (hasPro) {
          console.log('✅ User already has Pro subscription, redirecting to dashboard');
          
          // Show personalized InFoundr notification
          console.log('🔔 About to show notification...');
          showSuccess(
            'You\'re already Pro! 🚀',
            'Great news! You already have an active Pro subscription with unlimited access to all AI agents and premium features. Taking you to your dashboard...',
            { duration: 6000, autoClose: true }
          );
          console.log('🔔 Notification should be showing now...');
          
          // Use requestAnimationFrame to ensure the notification renders first
          requestAnimationFrame(() => {
            setTimeout(() => {
              console.log('🔄 Redirecting to dashboard...');
              navigate('/dashboard', { replace: true });
            }, 3000); // 3 seconds should be enough to see the notification
          });
          return;
        }
        
        // User doesn't have Pro, proceed with payment flow
        console.log('💰 User needs to upgrade to Pro, showing payment modal');
        setShowPaymentModal(true);
        
        // Try to get user email
        const user = await getCurrentUser();
        if (user && 'Ok' in user) {
          // Try to extract email from user data if available
          // For now, user will enter email in the modal
        }
      } catch (err) {
        console.error('Error checking subscription or fetching user details:', err);
        // On error, still show payment modal (fail open)
        setShowPaymentModal(true);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscriptionAndFetchUser();
  }, [navigate]);

  const handleCloseModal = () => {
    // Navigate back to home when modal is closed
    navigate('/#pricing');
  };

  // Show loading state while checking subscription
  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your subscription status...</p>
        </div>
      </div>
    );
  }

  // Show success message if user already has Pro
  if (hasProSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're already Pro!</h2>
          <p className="text-gray-600 mb-6">
            You already have an active Pro subscription. Redirecting you to your dashboard...
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showPaymentModal && (
        <PaymentModal
          isOpen={true}
          onClose={handleCloseModal}
          userEmail={userEmail}
        />
      )}
      
      {/* InFoundr Notification */}
      <InFoundrNotification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        autoClose={notification.autoClose}
        duration={notification.duration}
      />
    </div>
  );
};

export default PaymentCheckout;

