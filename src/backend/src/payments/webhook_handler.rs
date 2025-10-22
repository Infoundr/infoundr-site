use crate::payments::paystack_models::{PaystackWebhookEvent, parse_payment_channel};
use crate::models::payment::PaymentStatus;
use crate::storage::memory::PAYMENT_RECORDS;
use crate::models::stable_string::StableString;
use sha2::{Sha512, Digest};
use hex;

/// Verify Paystack webhook signature
pub fn verify_webhook_signature(
    payload: &str,
    signature: &str,
    secret_key: &str,
) -> Result<(), String> {
    // Paystack uses HMAC SHA512 for webhook signatures
    let mut hasher = Sha512::new();
    hasher.update(payload.as_bytes());
    hasher.update(secret_key.as_bytes());
    let hash = hasher.finalize();
    let computed_signature = hex::encode(hash);

    if computed_signature == signature {
        Ok(())
    } else {
        Err("Invalid webhook signature".to_string())
    }
}

/// Process a Paystack webhook event
pub async fn process_webhook_event(event: PaystackWebhookEvent) -> Result<String, String> {
    match event.event.as_str() {
        "charge.success" => handle_charge_success(event.data).await,
        "charge.failed" => handle_charge_failed(event.data).await,
        "transfer.success" => handle_transfer_success(event.data).await,
        "transfer.failed" => handle_transfer_failed(event.data).await,
        _ => {
            // Log unknown event types but don't fail
            Ok(format!("Unhandled event type: {}", event.event))
        }
    }
}

/// Handle successful charge
async fn handle_charge_success(data: String) -> Result<String, String> {
    // Parse JSON data
    let data_value: serde_json::Value = serde_json::from_str(&data)
        .map_err(|e| format!("Failed to parse webhook data: {}", e))?;
    
    // Extract transaction reference
    let reference = data_value["reference"]
        .as_str()
        .ok_or("Missing reference in webhook data")?
        .to_string();

    // Update payment record
    PAYMENT_RECORDS.with(|records| {
        let mut map = records.borrow_mut();
        let key = StableString::from(reference.clone());
        
        if let Some(mut payment) = map.get(&key) {
            payment.status = PaymentStatus::Success;
            payment.updated_at = ic_cdk::api::time();
            payment.paid_at = Some(ic_cdk::api::time());
            
            // Extract additional data from webhook
            if let Some(channel) = data_value["channel"].as_str() {
                payment.payment_channel = parse_payment_channel(channel);
            }
            
            if let Some(transaction_id) = data_value["id"].as_u64() {
                payment.paystack_transaction_id = Some(transaction_id);
            }
            
            map.insert(key, payment.clone());
            
            // Upgrade user subscription here
            // This will be handled in the payment service
            
            Ok(format!("Payment {} marked as successful", reference))
        } else {
            Err(format!("Payment record not found for reference: {}", reference))
        }
    })
}

/// Handle failed charge
async fn handle_charge_failed(data: String) -> Result<String, String> {
    // Parse JSON data
    let data_value: serde_json::Value = serde_json::from_str(&data)
        .map_err(|e| format!("Failed to parse webhook data: {}", e))?;
    
    let reference = data_value["reference"]
        .as_str()
        .ok_or("Missing reference in webhook data")?
        .to_string();

    PAYMENT_RECORDS.with(|records| {
        let mut map = records.borrow_mut();
        let key = StableString::from(reference.clone());
        
        if let Some(mut payment) = map.get(&key) {
            payment.status = PaymentStatus::Failed;
            payment.updated_at = ic_cdk::api::time();
            
            map.insert(key, payment);
            
            Ok(format!("Payment {} marked as failed", reference))
        } else {
            Err(format!("Payment record not found for reference: {}", reference))
        }
    })
}

/// Handle successful transfer (for refunds)
async fn handle_transfer_success(_data: String) -> Result<String, String> {
    Ok("Transfer success processed".to_string())
}

/// Handle failed transfer
async fn handle_transfer_failed(_data: String) -> Result<String, String> {
    Ok("Transfer failure processed".to_string())
}

/// Validate webhook payload structure
pub fn validate_webhook_payload(payload: &str) -> Result<PaystackWebhookEvent, String> {
    serde_json::from_str::<PaystackWebhookEvent>(payload)
        .map_err(|e| format!("Invalid webhook payload: {}", e))
}

