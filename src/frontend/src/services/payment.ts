import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { createActor } from "../../../declarations/backend";
import { CANISTER_ID } from '../config';
import type { InitializePaymentRequest, InitializePaymentResponse } from "../../../declarations/backend/backend.did.d.ts";

/**
 * Payment Service
 * Handles all payment-related operations with Paystack integration
 */

export interface PaymentInitRequest {
    tier: 'Pro';
    billingPeriod: 'monthly' | 'yearly';
    currency: 'KES' | 'NGN';
    email: string;
    phoneNumber?: string;
    enableMpesa?: boolean;
    enableCard?: boolean;
}

export interface PaymentResponse {
    success: boolean;
    authorizationUrl?: string;
    reference: string;
    amount: bigint;
    message: string;
}

/**
 * Initialize a payment for the Pro tier
 */
export const initializePayment = async (request: PaymentInitRequest): Promise<PaymentResponse> => {
    try {
        const authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();
        
        if (!isAuthenticated) {
            throw new Error("User must be authenticated to make a payment");
        }

        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        
        // Get user principal for user_id
        const principal = identity.getPrincipal().toString();
        
        // Build callback URL based on environment
        const baseUrl = window.location.origin;
        const callbackUrl = `${baseUrl}/payment/callback`;
        
        // Create payment initialization request
        const paymentRequest: InitializePaymentRequest = {
            user_id: principal,
            email: request.email,
            tier: request.tier,
            billing_period: request.billingPeriod,
            currency: request.currency,
            callback_url: callbackUrl,
            phone_number: request.phoneNumber ? [request.phoneNumber] : [],
            enable_mpesa: request.enableMpesa ?? (request.currency === 'KES'),
            enable_card: request.enableCard ?? true,
        };

        console.log("Initializing payment:", paymentRequest);

        const result = await actor.payment_initialize(paymentRequest);
        
        if ('Err' in result) {
            throw new Error(result.Err);
        }

        const response = result.Ok;
        
        return {
            success: response.success,
            authorizationUrl: response.authorization_url[0],
            reference: response.reference,
            amount: response.amount,
            message: response.message,
        };
    } catch (error) {
        console.error('Payment initialization error:', error);
        throw error;
    }
};

/**
 * Verify a payment after user returns from checkout
 */
export const verifyPayment = async (reference: string): Promise<boolean> => {
    try {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        
        const result = await actor.payment_verify(reference);
        
        if ('Err' in result) {
            console.error('Payment verification failed:', result.Err);
            return false;
        }

        const transactionDetails = result.Ok;
        console.log('Payment verified:', transactionDetails);
        
        // PaymentStatus is a variant type: { 'Success': null } | { 'Failed': null } etc.
        return 'Success' in transactionDetails.status;
    } catch (error) {
        console.error('Payment verification error:', error);
        return false;
    }
};

/**
 * Get payment history for current user
 */
export const getPaymentHistory = async () => {
    try {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        const principal = identity.getPrincipal().toString();
        
        return await actor.payment_get_history(principal);
    } catch (error) {
        console.error('Error fetching payment history:', error);
        return [];
    }
};

/**
 * Get Paystack public key (for frontend display if needed)
 */
export const getPaystackConfig = async () => {
    try {
        const agent = new HttpAgent({});
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        
        return await actor.payment_get_config();
    } catch (error) {
        console.error('Error fetching Paystack config:', error);
        return null;
    }
};

