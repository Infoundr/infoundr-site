/**
 * Payment Intent Utilities
 * Manages the payment flow state across authentication
 */

const PAYMENT_INTENT_KEY = 'payment_intent';
const PAYMENT_INTENT_TIMESTAMP_KEY = 'payment_intent_timestamp';
const INTENT_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export type PaymentIntentType = 'pro_upgrade' | null;

/**
 * Set a payment intent to persist across authentication flow
 */
export const setPaymentIntent = (intent: PaymentIntentType): void => {
    if (intent) {
        sessionStorage.setItem(PAYMENT_INTENT_KEY, intent);
        sessionStorage.setItem(PAYMENT_INTENT_TIMESTAMP_KEY, Date.now().toString());
        console.log(`Payment intent set: ${intent}`);
    }
};

/**
 * Get the current payment intent if it exists and hasn't expired
 */
export const getPaymentIntent = (): PaymentIntentType => {
    const intent = sessionStorage.getItem(PAYMENT_INTENT_KEY) as PaymentIntentType;
    const timestamp = sessionStorage.getItem(PAYMENT_INTENT_TIMESTAMP_KEY);
    
    if (!intent || !timestamp) {
        return null;
    }
    
    // Check if intent has expired
    const age = Date.now() - parseInt(timestamp);
    if (age > INTENT_EXPIRY_MS) {
        console.log('Payment intent expired, clearing...');
        clearPaymentIntent();
        return null;
    }
    
    return intent;
};

/**
 * Clear the payment intent from storage
 */
export const clearPaymentIntent = (): void => {
    sessionStorage.removeItem(PAYMENT_INTENT_KEY);
    sessionStorage.removeItem(PAYMENT_INTENT_TIMESTAMP_KEY);
    console.log('Payment intent cleared');
};

/**
 * Check if there is an active payment intent
 */
export const hasPaymentIntent = (): boolean => {
    return getPaymentIntent() !== null;
};

/**
 * Get the redirect path based on the payment intent
 */
export const getPaymentRedirectPath = (): string | null => {
    const intent = getPaymentIntent();
    
    switch (intent) {
        case 'pro_upgrade':
            return '/payment/checkout';
        default:
            return null;
    }
};

