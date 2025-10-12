import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/common/PaymentModal';
import { getCurrentUser } from '../services/auth';

const PaymentCheckout: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    // Try to get user email
    const fetchUserDetails = async () => {
      try {
        const user = await getCurrentUser();
        if (user && 'Ok' in user) {
          // Try to extract email from user data if available
          // For now, user will enter email in the modal
        }
      } catch (err) {
        console.log('Could not fetch user details:', err);
      }
    };

    fetchUserDetails();
  }, []);

  const handleCloseModal = () => {
    // Navigate back to home when modal is closed
    navigate('/#pricing');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentModal
        isOpen={true}
        onClose={handleCloseModal}
        userEmail={userEmail}
      />
    </div>
  );
};

export default PaymentCheckout;

