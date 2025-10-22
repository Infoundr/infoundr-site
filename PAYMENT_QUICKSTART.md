# Paystack Payment Integration - Quick Start

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Paystack account (sign up at https://paystack.com)
- Test API keys from Paystack dashboard

---

## ⚡ Recent Updates

**Fixed Issues:**
1. ✅ Phone number now properly sent to Paystack customer records
2. ✅ Verification endpoint now handles abandoned/pending transactions correctly
3. ✅ Payment API endpoints moved to `src/backend/src/payments/api.rs` for better organization

**Important Notes:**
- The payment channel (Card/M-Pesa) is determined when the user completes checkout, not during initialization
- You must open the `authorization_url` in a browser to see the M-Pesa payment option
- Transactions will show as "abandoned" until the user completes the checkout flow

---

## Step 1: Deploy Updated Canister

```bash
# Navigate to project root
cd /Users/la/InFoundr/infoundr-site

# Build and deploy the backend canister
dfx deploy backend
```

This will deploy all the new payment functionality.

---

## Step 2: Configure Paystack API Keys

Get your API keys from Paystack Dashboard:
1. Go to https://dashboard.paystack.com/#/settings/developers
2. Copy your **Test Secret Key** (starts with `sk_test_`)
3. Copy your **Test Public Key** (starts with `pk_test_`)

### Set Configuration via dfx

```bash
# Set Paystack configuration
dfx canister call backend payment_set_config '(
  record {
    secret_key = "sk_test_YOUR_SECRET_KEY_HERE";
    public_key = "pk_test_YOUR_PUBLIC_KEY_HERE";
    environment = variant { Test };
  }
)'
```

**Verify configuration:**

```bash
dfx canister call backend payment_get_config '()'
# Should return config with secret_key hidden
```

---

## Step 3: Test Payment Initialization

```bash
# Initialize a test payment
dfx canister call backend payment_initialize '(
  record {
    user_id = "test-user-123";
    email = "test@example.com";
    tier = "Pro";
    billing_period = "monthly";
    currency = "NGN";
    callback_url = "http://localhost:3000/payment/callback";
    phone_number = opt "+254712345678";
    enable_mpesa = true;
    enable_card = true;
  }
)'
```

**Expected Response:**
```
(
  variant {
    Ok = record {
      success = true;
      message = "Payment initialized successfully";
      authorization_url = opt "https://checkout.paystack.com/...";
      access_code = opt "...";
      reference = "INF-test-use-1234";
      amount = 2_900_000;
      currency = "NGN";
    }
  }
)
```

---

## Step 4: Test Payment Verification

After a user completes payment, verify it:

```bash
# Verify payment with the reference from initialization
dfx canister call backend payment_verify '("INF-test-use-1234")'
```

---

## 🧪 Testing with Test Cards

### Successful Payment

```
Card Number: 4084084084084081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456
```

### Failed Payment

```
Card Number: 4084084084084081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 1234 (wrong OTP)
```

---

## 📱 M-Pesa Testing

### How to Test M-Pesa:

1. **Initialize a payment with M-Pesa enabled:**
```bash
dfx canister call backend payment_initialize '(
  record {
    user_id = "test-user-124";
    email = "your-email@gmail.com";
    tier = "Pro";
    billing_period = "monthly";
    currency = "KES";
    callback_url = "http://localhost:3000/payment/callback";
    phone_number = opt "+254712345678";  # Your M-Pesa number
    enable_mpesa = true;
    enable_card = false;  # Set to false to only show M-Pesa
  }
)'
```

2. **Copy the `authorization_url` from the response**

3. **Open the URL in your browser:**
   - You'll see the Paystack checkout page
   - Select "Mobile Money" or "M-Pesa" as payment method
   - Enter your M-Pesa number (or it will be pre-filled from the phone_number field)
   - You'll receive an STK push prompt on your phone
   - Enter your M-Pesa PIN to complete payment

4. **Verify the payment:**
```bash
dfx canister call backend payment_verify '("INF-test-use-XXXX")'
```

**Important Notes:**
- M-Pesa testing requires a real Kenyan phone number with M-Pesa enabled
- The phone number must be in international format: `+254XXXXXXXXX`
- Abandoned transactions show "card" as the channel until a payment method is selected
- The actual payment channel is recorded after the user completes checkout

Follow Paystack's M-Pesa test flow.

---

## 💻 Frontend Integration Example

### React/TypeScript

```typescript
// services/paymentService.ts
import { backend } from '../declarations/backend';

export const initializePayment = async (
  userEmail: string,
  tier: 'Pro',
  billingPeriod: 'monthly' | 'yearly',
  phoneNumber?: string
) => {
  const userId = window.ic.plug.principalId; // or from auth
  
  const request = {
    user_id: userId,
    email: userEmail,
    tier: tier,
    billing_period: billingPeriod,
    currency: 'NGN', // or 'KES' for Kenya
    callback_url: `${window.location.origin}/payment/callback`,
    phone_number: phoneNumber ? [phoneNumber] : [],
    enable_mpesa: !!phoneNumber,
    enable_card: true,
  };

  const result = await backend.payment_initialize(request);
  
  if ('Ok' in result && result.Ok.success) {
    // Redirect to Paystack
    window.location.href = result.Ok.authorization_url[0];
  } else {
    throw new Error('Payment initialization failed');
  }
};

export const verifyPayment = async (reference: string) => {
  const result = await backend.payment_verify(reference);
  
  if ('Ok' in result) {
    return result.Ok;
  } else {
    throw new Error('Payment verification failed');
  }
};

export const getPaymentHistory = async (userId: string) => {
  return await backend.payment_get_history(userId);
};

export const getInvoices = async (userId: string) => {
  return await backend.payment_get_invoices(userId);
};
```

### Payment Button Component

```tsx
// components/UpgradeButton.tsx
import React, { useState } from 'react';
import { initializePayment } from '../services/paymentService';

export const UpgradeButton: React.FC<{
  userEmail: string;
  period: 'monthly' | 'yearly';
}> = ({ userEmail, period }) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await initializePayment(userEmail, 'Pro', period);
      // User will be redirected to Paystack
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="bg-blue-500 text-white px-6 py-2 rounded"
    >
      {loading ? 'Processing...' : `Upgrade - ${period === 'monthly' ? '₦29,000/mo' : '₦290,000/yr'}`}
    </button>
  );
};
```

### Payment Callback Page

```tsx
// pages/PaymentCallback.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../services/paymentService';

export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    const reference = searchParams.get('reference');
    
    if (!reference) {
      setStatus('failed');
      return;
    }

    verifyPayment(reference)
      .then((details) => {
        if (details.status === 'Success') {
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 3000);
        } else {
          setStatus('failed');
        }
      })
      .catch(() => {
        setStatus('failed');
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'verifying' && <p>Verifying payment...</p>}
      {status === 'success' && (
        <div className="text-center">
          <h1 className="text-2xl text-green-600">Payment Successful!</h1>
          <p>Your Pro subscription is now active.</p>
          <p className="text-sm">Redirecting to dashboard...</p>
        </div>
      )}
      {status === 'failed' && (
        <div className="text-center">
          <h1 className="text-2xl text-red-600">Payment Failed</h1>
          <p>Please try again or contact support.</p>
          <button onClick={() => navigate('/pricing')}>Back to Pricing</button>
        </div>
      )}
    </div>
  );
};
```

---

## 🔍 Debugging

### Check Payment Records

```bash
# Get all payments for a user
dfx canister call backend payment_get_history '("user-id-here")'

# Get specific payment
dfx canister call backend payment_get '("INF-test-use-1234")'

# Get invoices
dfx canister call backend payment_get_invoices '("user-id-here")'
```

### Check User Subscription

```bash
# Check current user tier
dfx canister call backend api_get_user_tier '("user-id-here")'

# Get usage stats
dfx canister call backend api_get_usage_stats '("user-id-here")'
```

---

## 📊 Payment Status Flow

```
1. PENDING    → User initiated payment
2. SUCCESS    → Payment verified and successful
3. FAILED     → Payment attempt failed
4. ABANDONED  → User closed payment page
5. REVERSED   → Payment was refunded
```

---

## 🌍 Going Live

### 1. Get Live API Keys

Go to Paystack Dashboard and switch to Live mode, copy:
- Live Secret Key (`sk_live_...`)
- Live Public Key (`pk_live_...`)

### 2. Update Configuration

```bash
dfx canister call backend payment_set_config '(
  record {
    secret_key = "sk_live_YOUR_LIVE_SECRET_KEY";
    public_key = "pk_live_YOUR_LIVE_PUBLIC_KEY";
    environment = variant { Live };
  }
)'
```

### 3. Test with Real Card

Use a real card with small amount first (₦100) to verify everything works.

### 4. Monitor

- Check Paystack dashboard for transactions
- Monitor canister logs for errors
- Set up alerts for failed payments

---

## 💡 Pro Tips

1. **Always verify on backend**: Never trust frontend verification alone
2. **Handle webhooks**: Set up webhooks for real-time payment updates
3. **Test thoroughly**: Test all payment scenarios before going live
4. **Monitor cycles**: Ensure canister has enough cycles for HTTP outcalls
5. **Error handling**: Implement proper error handling and user feedback
6. **Logging**: Add logging for debugging payment issues

---

## 🔐 Security Best Practices

1. ✅ Never expose secret keys to frontend
2. ✅ Always verify webhook signatures
3. ✅ Validate amounts on backend
4. ✅ Use HTTPS for callback URLs
5. ✅ Implement rate limiting for payment endpoints
6. ✅ Log all payment attempts
7. ✅ Monitor for suspicious activity

---

## 📞 Need Help?

- **Paystack Support**: support@paystack.com
- **Paystack Docs**: https://paystack.com/docs
- **IC Forum**: https://forum.dfinity.org

---

## ✅ Quick Checklist

- [ ] Deployed updated backend canister
- [ ] Set Paystack test keys
- [ ] Tested payment initialization
- [ ] Tested with test card
- [ ] Tested M-Pesa flow (if applicable)
- [ ] Verified payment verification works
- [ ] Checked subscription upgrade works
- [ ] Frontend integration complete
- [ ] Tested callback page
- [ ] Error handling implemented
- [ ] Ready for production testing

---

**You're all set! Start accepting payments! 💰**

