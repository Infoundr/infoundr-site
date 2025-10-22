/// Payment API endpoints
/// 
/// This module contains all the canister endpoints for payment operations

use crate::services::payment_service::{
    initialize_payment, verify_payment, get_payment_history, get_payment, get_user_invoices,
    InitializePaymentRequest, InitializePaymentResponse,
};
use crate::models::payment::{PaymentRecord, Invoice, TransactionDetails};
use crate::payments::{set_paystack_config, get_paystack_config, PaystackConfig};

/// Initialize a new payment (creates Paystack transaction)
#[ic_cdk::update]
pub async fn payment_initialize(request: InitializePaymentRequest) -> Result<InitializePaymentResponse, String> {
    initialize_payment(request).await
}

/// Verify a payment after user completes it on Paystack
#[ic_cdk::update]
pub async fn payment_verify(reference: String) -> Result<TransactionDetails, String> {
    verify_payment(reference).await
}

/// Get payment history for a user
#[ic_cdk::query]
pub fn payment_get_history(user_id: String) -> Vec<PaymentRecord> {
    get_payment_history(user_id)
}

/// Get a specific payment by reference
#[ic_cdk::query]
pub fn payment_get(reference: String) -> Option<PaymentRecord> {
    get_payment(reference)
}

/// Get all invoices for a user
#[ic_cdk::query]
pub fn payment_get_invoices(user_id: String) -> Vec<Invoice> {
    get_user_invoices(user_id)
}

/// Set Paystack configuration (admin only)
#[ic_cdk::update]
pub fn payment_set_config(config: PaystackConfig) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let authorized_principal = candid::Principal::from_text("5mqc2-eelsb-rpsbu-tvroe-paiy3-c4wo3-4xl6q-7nelg-gprk3-rkq46-mqe")
        .expect("Invalid authorized principal");
    
    if caller != authorized_principal {
        return Err("Unauthorized: Only the authorized principal can update payment configuration".to_string());
    }
    
    set_paystack_config(config);
    Ok("Paystack configuration updated successfully".to_string())
}

/// Get Paystack configuration (returns public key only for security)
#[ic_cdk::query]
pub fn payment_get_config() -> PaystackConfig {
    let mut config = get_paystack_config();
    // Don't expose secret key to clients
    config.secret_key = "***HIDDEN***".to_string();
    config
}

/// Process webhook from Paystack (called by Paystack)
#[ic_cdk::update]
pub async fn payment_webhook(payload: String, signature: String) -> Result<String, String> {
    use crate::payments::webhook_handler::{verify_webhook_signature, validate_webhook_payload, process_webhook_event};
    use crate::payments::get_secret_key;
    
    // Verify webhook signature
    verify_webhook_signature(&payload, &signature, &get_secret_key())?;
    
    // Parse payload
    let event = validate_webhook_payload(&payload)?;
    
    // Process event
    process_webhook_event(event).await
}

/// Transform function for payment HTTP responses (required by IC HTTP outcalls)
/// This is called by the IC to transform the response before consensus
#[ic_cdk::query]
pub fn transform_payment_http_response(args: ic_cdk::api::management_canister::http_request::TransformArgs) -> ic_cdk::api::management_canister::http_request::HttpResponse {
    use ic_cdk::api::management_canister::http_request::HttpResponse;
    
    HttpResponse {
        status: args.response.status,
        headers: vec![],  // Remove headers for consensus
        body: args.response.body,
    }
}

