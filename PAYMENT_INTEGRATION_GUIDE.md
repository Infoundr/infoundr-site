# Paystack Payment Integration Guide

## 🎉 Implementation Complete!

This document provides a complete guide for the Paystack payment integration for Infoundr.

---

## 📁 File Structure

```
src/backend/src/
├── lib.rs                          # Payment API endpoints added
├── models/
│   ├── mod.rs                      # ✅ Updated: exports payment module
│   └── payment.rs                  # ✅ NEW: Payment data models
├── services/
│   ├── mod.rs                      # ✅ Updated: exports payment_service
│   └── payment_service.rs          # ✅ NEW: Core payment business logic
├── payments/                       # ✅ NEW FOLDER
│   ├── mod.rs                      # Payment configuration
│   ├── paystack_client.rs          # HTTP outcalls to Paystack API
│   ├── paystack_models.rs          # Request/Response types
│   └── webhook_handler.rs          # Webhook processing
└── storage/
    └── memory.rs                   # ✅ Updated: Added payment storage
```

---

## 🔧 What Was Implemented

### 1. **Payment Data Models** (`models/payment.rs`)

#### Enums:
- `PaymentChannel`: Card, MobileMoney (M-Pesa), BankTransfer, USSD, QR, BankAccount
- `PaymentStatus`: Pending, Success, Failed, Abandoned, Reversed, Queued
- `Currency`: NGN (Naira), KES (Kenyan Shilling), GHS, ZAR, USD

#### Structures:
- `PaymentRecord`: Main payment record stored in stable memory
- `Invoice`: Invoice record for successful payments
- `TransactionDetails`: Verification response details
- `PaymentMetadata`: Additional customer info (phone for M-Pesa)

### 2. **Storage Layer** (`storage/memory.rs`)

Added two new stable storage maps:
- `PAYMENT_RECORDS`: Stores all payment transactions (Memory ID: 20)
- `INVOICES`: Stores generated invoices (Memory ID: 21)

### 3. **Paystack HTTP Client** (`payments/paystack_client.rs`)

#### Functions:
- `initialize_transaction()`: Creates a new Paystack transaction
- `verify_transaction()`: Verifies payment after completion
- `build_metadata()`: Helper to create metadata JSON
- `get_payment_channels()`: Configure Card/M-Pesa options

Uses **IC HTTP outcalls** to communicate with Paystack API directly from the canister.

### 4. **Payment Service** (`services/payment_service.rs`)

#### Core Functions:
- `initialize_payment()`: Start a new payment flow
- `verify_payment()`: Verify and upgrade subscription
- `get_payment_history()`: Fetch user's payment history
- `get_payment()`: Get specific payment by reference
- `get_user_invoices()`: Get all invoices for a user

#### Pricing:
```rust
// Nigerian Naira (NGN) - 1 NGN = 100 kobo
PRO_MONTHLY_NGN = 2,900,000 kobo (₦29,000 ≈ $19 USD)
PRO_YEARLY_NGN = 29,000,000 kobo (₦290,000 ≈ $190 USD)

// Kenyan Shilling (KES) - For M-Pesa
PRO_MONTHLY_KES = 290,000 cents (KES 2,900 ≈ $19 USD)
PRO_YEARLY_KES = 2,900,000 cents (KES 29,000 ≈ $190 USD)
```

### 5. **Webhook Handler** (`payments/webhook_handler.rs`)

- Verifies Paystack webhook signatures using HMAC SHA512
- Processes webhook events: `charge.success`, `charge.failed`, etc.
- Automatically updates payment status and subscription

### 6. **API Endpoints** (added to `lib.rs`)

```rust
// Payment Operations
payment_initialize(request)       // Initialize payment
payment_verify(reference)          // Verify payment
payment_get_history(user_id)       // Get payment history
payment_get(reference)             // Get specific payment
payment_get_invoices(user_id)      // Get user invoices

// Configuration (Admin)
payment_set_config(config)         // Set Paystack keys
payment_get_config()               // Get config (secret hidden)

// Webhooks
payment_webhook(payload, signature) // Process Paystack webhooks
```

---

## 🚀 How to Use

### Step 1: Configure Paystack

First, set your Paystack API keys (use test keys for development):

```typescript
// From your admin panel or setup script
const config = {
  secret_key: "sk_test_xxxxxxxxxxxxx",  // From Paystack dashboard
  public_key: "pk_test_xxxxxxxxxxxxx",  // From Paystack dashboard
  environment: { Test: null }            // or { Live: null } for production
};

await backend.payment_set_config(config);
```

### Step 2: Initialize a Payment

```typescript
// Frontend example
const initializePayment = async () => {
  const request = {
    user_id: userPrincipal.toString(),
    email: "user@example.com",
    tier: "Pro",
    billing_period: "monthly",  // or "yearly"
    currency: "NGN",            // or "KES" for M-Pesa
    callback_url: `${window.location.origin}/payment/callback`,
    phone_number: "+254712345678",  // Required for M-Pesa
    enable_mpesa: true,         // Enable M-Pesa option
    enable_card: true,          // Enable card payment
  };

  try {
    const response = await backend.payment_initialize(request);
    
    if (response.Ok && response.Ok.success) {
      // Redirect user to Paystack payment page
      window.location.href = response.Ok.authorization_url;
    }
  } catch (error) {
    console.error("Payment initialization failed:", error);
  }
};
```

### Step 3: Verify Payment (After Redirect Back)

```typescript
// On your callback page (e.g., /payment/callback)
const verifyPayment = async (reference: string) => {
  try {
    const result = await backend.payment_verify(reference);
    
    if (result.Ok && result.Ok.status === "Success") {
      // Payment successful!
      // User subscription has been automatically upgraded
      console.log("Payment successful!", result.Ok);
      // Redirect to dashboard
      navigate("/dashboard");
    } else {
      console.error("Payment failed or pending");
    }
  } catch (error) {
    console.error("Verification error:", error);
  }
};

// Get reference from URL query params
const params = new URLSearchParams(window.location.search);
const reference = params.get("reference");
if (reference) {
  verifyPayment(reference);
}
```

### Step 4: Display Payment History

```typescript
const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  
  useEffect(() => {
    const loadHistory = async () => {
      const history = await backend.payment_get_history(userId);
      setPayments(history);
    };
    loadHistory();
  }, [userId]);

  return (
    <div>
      {payments.map(payment => (
        <div key={payment.id}>
          <p>Amount: {payment.amount / 100} {payment.currency}</p>
          <p>Status: {payment.status}</p>
          <p>Date: {new Date(payment.created_at / 1000000).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## 💳 Payment Flow Diagram

```
┌─────────────┐
│   User      │
│  Dashboard  │
└──────┬──────┘
       │ Clicks "Upgrade to Pro"
       ▼
┌─────────────────────────────────┐
│  Frontend                       │
│  • Collects email, phone        │
│  • Calls payment_initialize()   │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Backend Canister               │
│  • Generates unique reference   │
│  • HTTP outcall to Paystack     │
│  • Stores payment record        │
│  • Returns authorization_url    │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Paystack Payment Page          │
│  • User selects Card or M-Pesa  │
│  • Completes payment            │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Redirect to callback_url       │
│  with ?reference=INF-xxx-1234   │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Frontend Callback Page         │
│  • Extracts reference           │
│  • Calls payment_verify()       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Backend Canister               │
│  • HTTP outcall to verify       │
│  • Updates payment status       │
│  • Upgrades user subscription   │
│  • Generates invoice            │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────┐
│   User Pro  │
│  Activated! │
└─────────────┘
```

---

## 🔐 Security Features

1. **Webhook Signature Verification**: HMAC SHA512 verification
2. **Secret Key Protection**: Never exposed to frontend
3. **HTTP Outcalls**: Direct from canister (no proxy needed)
4. **Reference Validation**: Unique references prevent replay attacks
5. **Amount Verification**: Backend validates amounts match expected pricing

---

## 🧪 Testing

### Test Mode Setup

1. Get test keys from: https://dashboard.paystack.com/#/settings/developers
2. Set environment to `Test` in config
3. Use test card numbers from: https://paystack.com/docs/payments/test-payments

```typescript
// Test card for successful payment
Card Number: 4084084084084081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456
```

### Test M-Pesa

```typescript
// Use test phone number from Paystack docs
Phone: +254712345678
```

---

## 📊 Pricing Configuration

Current pricing (can be adjusted in `payment_service.rs`):

```rust
// Monthly Pro
NGN: ₦29,000 (~$19 USD)
KES: KES 2,900 (~$19 USD)

// Yearly Pro (save ~17%)
NGN: ₦290,000 (~$190 USD)
KES: KES 29,000 (~$190 USD)
```

To change pricing, update these constants in `services/payment_service.rs`:
```rust
const PRO_MONTHLY_NGN: u64 = 2_900_000;  // Amount in kobo
const PRO_YEARLY_NGN: u64 = 29_000_000;
const PRO_MONTHLY_KES: u64 = 290_000;
const PRO_YEARLY_KES: u64 = 2_900_000;
```

---

## 🌐 Webhook Setup (Optional but Recommended)

Paystack can send webhooks to notify you of payment events in real-time.

### Setup:
1. Go to Paystack Dashboard → Settings → Webhooks
2. Add your canister webhook URL:
   ```
   https://<canister-id>.ic0.app/payment_webhook
   ```
3. Paystack will call this endpoint when payments succeed/fail

### Events Handled:
- `charge.success`: Payment successful
- `charge.failed`: Payment failed
- `transfer.success`: Refund successful
- `transfer.failed`: Refund failed

---

## 📝 Next Steps

### Frontend Integration

Create these pages/components:

1. **PricingPage.tsx**
   - Show Free vs Pro comparison
   - Call `payment_initialize()` on upgrade

2. **PaymentCallback.tsx**
   - Extract reference from URL
   - Call `payment_verify()`
   - Show success/error message

3. **BillingDashboard.tsx**
   - Display current subscription
   - Show payment history
   - Download invoices

4. **PaymentMethodSelector.tsx**
   - Toggle between Card and M-Pesa
   - Collect phone number for M-Pesa

### Example React Component

```typescript
// PricingPage.tsx
import { useState } from 'react';
import { backend } from '../declarations/backend';

export const PricingPage = () => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (period: 'monthly' | 'yearly') => {
    setLoading(true);
    try {
      const result = await backend.payment_initialize({
        user_id: userPrincipal.toString(),
        email: userEmail,
        tier: "Pro",
        billing_period: period,
        currency: "NGN",  // or "KES"
        callback_url: `${window.location.origin}/payment/callback`,
        phone_number: userPhone,
        enable_mpesa: true,
        enable_card: true,
      });

      if (result.Ok?.authorization_url) {
        window.location.href = result.Ok.authorization_url;
      }
    } catch (error) {
      console.error(error);
      alert("Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upgrade to Pro</h1>
      <button onClick={() => handleUpgrade('monthly')} disabled={loading}>
        Monthly - ₦29,000
      </button>
      <button onClick={() => handleUpgrade('yearly')} disabled={loading}>
        Yearly - ₦290,000 (Save 17%)
      </button>
    </div>
  );
};
```

---

## 🐛 Troubleshooting

### Payment initialization fails

**Error**: "Paystack not configured"
**Solution**: Set Paystack API keys using `payment_set_config()`

### HTTP outcall fails

**Error**: "HTTP request failed: xxx"
**Solutions**:
- Check internet connectivity
- Verify Paystack API is accessible
- Ensure canister has enough cycles (~13B per HTTP call)
- Check Paystack API key is valid

### Webhook signature verification fails

**Error**: "Invalid webhook signature"
**Solutions**:
- Ensure you're using the same secret key in both config and Paystack dashboard
- Check payload is not modified in transit
- Verify webhook is coming from Paystack's IP addresses

### Payment verification returns wrong status

**Issue**: Payment shows as pending even though user paid
**Solutions**:
- Wait a few seconds after payment before verifying
- Check Paystack dashboard for actual payment status
- Retry verification after short delay

---

## 💰 Cost Analysis

### IC Cycles Cost

- HTTP outcall: ~13B cycles per call (~$0.001 USD)
- Storage: Minimal (< 1KB per payment record)
- **Estimated monthly cost**: < $1 USD for 1000 transactions

### Paystack Fees

- Domestic cards: 1.5% capped at ₦2,000
- International cards: 3.9%
- M-Pesa: 1.5%

**Example**:
- ₦29,000 payment
- Paystack fee: ₦435 (1.5%)
- **You receive**: ₦28,565

---

## 📚 Additional Resources

- **Paystack API Docs**: https://paystack.com/docs/api
- **IC HTTP Outcalls**: https://internetcomputer.org/docs/current/developer-docs/integrations/https-outcalls
- **Payment Testing**: https://paystack.com/docs/payments/test-payments

---

## ✅ Checklist for Going Live

- [ ] Replace test API keys with live keys
- [ ] Set environment to `Live` in config
- [ ] Test with real cards/M-Pesa in sandbox
- [ ] Set up webhook URL in Paystack dashboard
- [ ] Add error logging and monitoring
- [ ] Implement refund functionality (if needed)
- [ ] Add email notifications for successful payments
- [ ] Create invoice PDF generation (optional)
- [ ] Add payment retry logic for failed payments
- [ ] Set up alerts for failed payments
- [ ] Test subscription expiry and renewal logic

---

## 🎯 Features Implemented

✅ Card payments via Paystack  
✅ M-Pesa payments  
✅ Multiple currency support (NGN, KES, GHS, ZAR, USD)  
✅ Automatic subscription upgrades  
✅ Payment history tracking  
✅ Invoice generation  
✅ Webhook processing  
✅ Secure API key management  
✅ HTTP outcalls from IC canister  
✅ Stable storage for all payment data  
✅ Monthly and yearly billing cycles  

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review Paystack API docs
3. Check canister logs
4. Contact Paystack support for payment-specific issues

**Happy coding! 🚀**

