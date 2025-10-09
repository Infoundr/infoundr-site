use candid::CandidType;
use serde::{Deserialize, Serialize};
use crate::models::payment::PaymentChannel;

/// Request to initialize a Paystack transaction
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct InitializeTransactionRequest {
    pub email: String,
    pub amount: String,  // Amount in kobo/smallest unit (e.g., "29000" for ₦290)
    pub currency: String,
    pub reference: String,
    pub callback_url: String,
    pub channels: Vec<String>,  // ["card", "mobile_money", "bank"]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<String>,  // JSON string instead of Value
}

/// Response from Paystack transaction initialization
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct InitializeTransactionResponse {
    pub status: bool,
    pub message: String,
    pub data: Option<TransactionData>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TransactionData {
    pub authorization_url: String,
    pub access_code: String,
    pub reference: String,
}

/// Response from Paystack transaction verification
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct VerifyTransactionResponse {
    pub status: bool,
    pub message: String,
    pub data: Option<VerificationData>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct VerificationData {
    pub id: u64,
    pub domain: String,
    pub status: String,  // "success", "failed", "abandoned"
    pub reference: String,
    pub amount: u64,
    pub message: Option<String>,
    pub gateway_response: String,
    pub paid_at: Option<String>,
    pub created_at: String,
    pub channel: String,  // "card", "mobile_money", etc.
    pub currency: String,
    pub ip_address: Option<String>,
    pub metadata: Option<String>,  // JSON string instead of Value
    pub fees: Option<u64>,
    pub customer: CustomerData,
    pub authorization: Option<AuthorizationData>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CustomerData {
    pub id: u64,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub email: String,
    pub customer_code: String,
    pub phone: Option<String>,
    pub metadata: Option<String>,  // JSON string instead of Value
    pub risk_action: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct AuthorizationData {
    pub authorization_code: String,
    pub bin: String,
    pub last4: String,
    pub exp_month: String,
    pub exp_year: String,
    pub channel: String,
    pub card_type: String,
    pub bank: String,
    pub country_code: String,
    pub brand: String,
    pub reusable: bool,
    pub signature: String,
    pub account_name: Option<String>,
}

/// Webhook event from Paystack
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct PaystackWebhookEvent {
    pub event: String,  // "charge.success", "charge.failed", etc.
    pub data: String,   // JSON string instead of Value
}

/// Helper to convert channel string to enum
pub fn parse_payment_channel(channel: &str) -> Option<PaymentChannel> {
    match channel.to_lowercase().as_str() {
        "card" => Some(PaymentChannel::Card),
        "mobile_money" | "mpesa" => Some(PaymentChannel::MobileMoney),
        "bank_transfer" => Some(PaymentChannel::BankTransfer),
        "ussd" => Some(PaymentChannel::Ussd),
        "qr" => Some(PaymentChannel::Qr),
        "bank_account" => Some(PaymentChannel::BankAccount),
        _ => None,
    }
}

/// Helper to convert status string to enum
pub fn parse_payment_status(status: &str) -> crate::models::payment::PaymentStatus {
    match status.to_lowercase().as_str() {
        "success" => crate::models::payment::PaymentStatus::Success,
        "failed" => crate::models::payment::PaymentStatus::Failed,
        "abandoned" => crate::models::payment::PaymentStatus::Abandoned,
        "reversed" => crate::models::payment::PaymentStatus::Reversed,
        "queued" => crate::models::payment::PaymentStatus::Queued,
        _ => crate::models::payment::PaymentStatus::Pending,
    }
}

