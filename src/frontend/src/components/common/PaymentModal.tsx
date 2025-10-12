import React, { useState } from 'react';
import { initializePayment } from '../../services/payment';
import Button from './Button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, userEmail }) => {
  const [email, setEmail] = useState(userEmail || '');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState<'KES' | 'NGN'>('KES');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prices = {
    monthly: {
      KES: '2,900',
      NGN: '29,000',
    },
    yearly: {
      KES: '29,000',
      NGN: '290,000',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Validate phone for KES/M-Pesa
      if (currency === 'KES' && phone && !phone.match(/^\+?254[0-9]{9}$/)) {
        throw new Error('Phone number must be in format +254XXXXXXXXX for M-Pesa');
      }

      const response = await initializePayment({
        tier: 'Pro',
        billingPeriod,
        currency,
        email,
        phoneNumber: phone || undefined,
        enableMpesa: currency === 'KES',
        enableCard: true,
      });

      if (response.success && response.authorizationUrl) {
        // Store the payment reference for later verification
        sessionStorage.setItem('pending_payment_reference', response.reference);
        
        // Redirect to Paystack checkout
        window.location.href = response.authorizationUrl;
      } else {
        throw new Error(response.message || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
          <p className="text-gray-600 text-sm">
            Get unlimited access to all AI agents and premium features
          </p>
        </div>

        {/* Billing Period Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Billing Period
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`p-3 rounded-lg border-2 transition-all ${
                billingPeriod === 'monthly'
                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">Monthly</div>
              <div className="text-sm text-gray-600">Pay monthly</div>
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('yearly')}
              className={`p-3 rounded-lg border-2 transition-all ${
                billingPeriod === 'yearly'
                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">Yearly</div>
              <div className="text-sm text-green-600">Save ~17%</div>
            </button>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Currency & Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCurrency('KES')}
              className={`p-3 rounded-lg border-2 transition-all ${
                currency === 'KES'
                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">KES {prices[billingPeriod].KES}</div>
              <div className="text-xs text-gray-600">M-Pesa & Card</div>
            </button>
            <button
              type="button"
              onClick={() => setCurrency('NGN')}
              className={`p-3 rounded-lg border-2 transition-all ${
                currency === 'NGN'
                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">NGN {prices[billingPeriod].NGN}</div>
              <div className="text-xs text-gray-600">Card</div>
            </button>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Phone Input (for KES/M-Pesa) */}
          {currency === 'KES' && (
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+254712345678"
              />
              <p className="mt-1 text-xs text-gray-500">
                For M-Pesa payments, use format: +254XXXXXXXXX
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Plan:</span>
              <span className="font-semibold">Pro ({billingPeriod})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-lg">
                {currency} {prices[billingPeriod][currency]}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              'Proceed to Checkout'
            )}
          </Button>

          <p className="mt-4 text-xs text-center text-gray-500">
            Secure payment powered by Paystack. You'll be redirected to complete your payment.
          </p>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;

