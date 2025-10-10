use candid::CandidType;
use serde::{Deserialize, Serialize, Deserializer};
use crate::models::payment::PaymentChannel;
use serde_json::Value;

/// Custom deserializer that accepts both objects and strings, converting objects to JSON strings
fn deserialize_flexible_json<'de, D>(deserializer: D) -> Result<Option<String>, D::Error>
where
    D: Deserializer<'de>,
{
    let value = Option::<Value>::deserialize(deserializer)?;
    Ok(value.map(|v| match v {
        Value::String(s) => s,
        Value::Null => String::new(),
        other => serde_json::to_string(&other).unwrap_or_default(),
    }))
}


/// Request to initialize a Paystack transaction
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct InitializeTransactionRequest {
    pub email: String,
    pub amount: String,  // Amount in kobo/smallest unit (e.g., "29000" for ₦290)
    pub currency: String,
    pub reference: String,
    pub callback_url: String,
    pub channels: Vec<String>,  // ["card", "mobile_money", "bank"]
    pub metadata: Option<String>,  // JSON string instead of Value
    pub phone: Option<String>,  // Customer phone number
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
    
    // Use custom deserializer to handle both objects and strings
    #[serde(deserialize_with = "deserialize_flexible_json", default)]
    pub metadata: Option<String>,
    
    pub fees: Option<u64>,
    pub customer: CustomerData,
    pub authorization: AuthorizationData,
    pub receipt_number: Option<String>,
    
    #[serde(rename = "paidAt")]
    pub paid_at_camel: Option<String>,
    
    #[serde(rename = "createdAt")]
    pub created_at_camel: Option<String>,
    
    pub requested_amount: Option<u64>,
    pub transaction_date: Option<String>,
    pub order_id: Option<String>,
    
    // All complex fields use the custom deserializer
    #[serde(deserialize_with = "deserialize_flexible_json", default)]
    pub pos_transaction_data: Option<String>,
    
    #[serde(deserialize_with = "deserialize_flexible_json", default)]
    pub source: Option<String>,
    
    #[serde(deserialize_with = "deserialize_flexible_json", default)]
    pub fees_breakdown: Option<String>,
    
    #[serde(deserialize_with = "deserialize_flexible_json", default)]
    pub connect: Option<String>,
    
    #[serde(deserialize_with = "deserialize_flexible_json", default)]
    pub log: Option<String>,
    
    #[serde(deserialize_with = "deserialize_flexible_json", default)]
    pub split: Option<String>,
    
    #[serde(deserialize_with = "deserialize_flexible_json", default)]
    pub plan: Option<String>,
    
    #[serde(deserialize_with = "deserialize_flexible_json", default)]
    pub plan_object: Option<String>,
    
    #[serde(deserialize_with = "deserialize_flexible_json", default)]
    pub subaccount: Option<String>,
    
    #[serde(deserialize_with = "deserialize_flexible_json", default)]
    pub fees_split: Option<String>,
}

impl Default for VerificationData {
    fn default() -> Self {
        Self {
            id: 0,
            domain: String::new(),
            status: String::new(),
            reference: String::new(),
            amount: 0,
            message: None,
            gateway_response: String::new(),
            paid_at: None,
            created_at: String::new(),
            channel: String::new(),
            currency: String::new(),
            ip_address: None,
            metadata: None,
            fees: None,
            customer: CustomerData::default(),
            authorization: AuthorizationData::default(),
            receipt_number: None,
            paid_at_camel: None,
            created_at_camel: None,
            requested_amount: None,
            transaction_date: None,
            order_id: None,
            pos_transaction_data: None,
            source: None,
            fees_breakdown: None,
            connect: None,
            log: None,
            split: None,
            plan: None,
            plan_object: None,
            subaccount: None,
            fees_split: None,
        }
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Default)]
pub struct CustomerData {
    pub id: u64,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub email: String,
    pub customer_code: String,
    pub phone: Option<String>,
    
    #[serde(deserialize_with = "deserialize_flexible_json", default)]
    pub metadata: Option<String>,
    
    pub risk_action: String,
    pub international_format_phone: Option<String>,
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
    pub signature: Option<String>,  // Can be null for mobile money
    pub account_name: Option<String>,
    pub mobile_money_number: Option<String>,  // For M-Pesa payments
    pub receiver_bank_account_number: Option<String>,
    pub receiver_bank: Option<String>,
}

impl Default for AuthorizationData {
    fn default() -> Self {
        Self {
            authorization_code: String::new(),
            bin: String::new(),
            last4: String::new(),
            exp_month: String::new(),
            exp_year: String::new(),
            channel: String::new(),
            card_type: String::new(),
            bank: String::new(),
            country_code: String::new(),
            brand: String::new(),
            reusable: false,
            signature: None,
            account_name: None,
            mobile_money_number: None,
            receiver_bank_account_number: None,
            receiver_bank: None,
        }
    }
}

// Helper functions to extract metadata values
impl VerificationData {
    /// Parse metadata JSON string and get a field value
    pub fn get_metadata_string(&self, key: &str) -> Option<String> {
        let metadata_str = self.metadata.as_ref()?;
        let metadata: Value = serde_json::from_str(metadata_str).ok()?;
        metadata.get(key)?.as_str().map(|s| s.to_string())
    }
    
    /// Get user_id from metadata
    pub fn get_user_id(&self) -> Option<String> {
        self.get_metadata_string("user_id")
    }
    
    /// Get tier from metadata
    pub fn get_tier(&self) -> Option<String> {
        self.get_metadata_string("tier")
    }
    
    /// Get billing_period from metadata
    pub fn get_billing_period(&self) -> Option<String> {
        self.get_metadata_string("billing_period")
    }
    
    /// Get phone from metadata
    pub fn get_metadata_phone(&self) -> Option<String> {
        self.get_metadata_string("phone")
    }
    
    /// Get source from metadata
    pub fn get_source(&self) -> Option<String> {
        self.get_metadata_string("source")
    }
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

