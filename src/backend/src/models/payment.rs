use candid::CandidType;
use serde::{Deserialize, Serialize};
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;

/// Payment channels supported by Paystack
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum PaymentChannel {
    Card,
    MobileMoney,  // M-Pesa and other mobile money
    BankTransfer,
    Ussd,
    Qr,
    BankAccount,
}

impl Default for PaymentChannel {
    fn default() -> Self {
        PaymentChannel::Card
    }
}

/// Payment status
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum PaymentStatus {
    Pending,        // Payment initiated but not completed
    Success,        // Payment successful and verified
    Failed,         // Payment failed
    Abandoned,      // User abandoned payment
    Reversed,       // Payment was reversed/refunded
    Queued,         // Payment is queued (pending confirmation)
}

impl Default for PaymentStatus {
    fn default() -> Self {
        PaymentStatus::Pending
    }
}

/// Currency support (Paystack supports multiple African currencies)
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum Currency {
    NGN,  // Nigerian Naira
    GHS,  // Ghanaian Cedi
    ZAR,  // South African Rand
    KES,  // Kenyan Shilling (for M-Pesa)
    USD,  // US Dollar
}

impl Default for Currency {
    fn default() -> Self {
        Currency::NGN
    }
}

impl Currency {
    pub fn as_str(&self) -> &str {
        match self {
            Currency::NGN => "NGN",
            Currency::GHS => "GHS",
            Currency::ZAR => "ZAR",
            Currency::KES => "KES",
            Currency::USD => "USD",
        }
    }
}

/// Main payment record stored in stable memory
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Default)]
pub struct PaymentRecord {
    pub id: String,                          // Internal unique ID
    pub user_id: String,                     // User principal or platform ID
    pub paystack_reference: String,          // Paystack transaction reference
    pub amount: u64,                         // Amount in smallest currency unit (kobo/pesewas/cents)
    pub currency: Currency,
    pub email: String,                       // Customer email
    pub status: PaymentStatus,
    pub payment_channel: Option<PaymentChannel>,
    pub authorization_url: Option<String>,   // URL to redirect user for payment
    pub access_code: Option<String>,         // Paystack access code
    pub tier: String,                        // Subscription tier (Free, Pro, Team)
    pub billing_period: String,              // monthly or yearly
    pub created_at: u64,                     // Timestamp in nanoseconds
    pub updated_at: u64,                     // Last update timestamp
    pub paid_at: Option<u64>,                // When payment was completed
    pub paystack_transaction_id: Option<u64>, // Paystack's internal transaction ID
    pub metadata: PaymentMetadata,           // Additional metadata
}

/// Metadata for payments
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Default)]
pub struct PaymentMetadata {
    pub customer_name: Option<String>,
    pub phone_number: Option<String>,        // Important for M-Pesa
    pub custom_fields: Vec<CustomField>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CustomField {
    pub display_name: String,
    pub variable_name: String,
    pub value: String,
}

/// Transaction details for verification
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TransactionDetails {
    pub reference: String,
    pub amount: u64,
    pub currency: Currency,
    pub status: PaymentStatus,
    pub channel: Option<PaymentChannel>,
    pub paid_at: Option<String>,
    pub transaction_id: Option<u64>,
    pub customer_email: String,
    pub customer_name: Option<String>,
    pub fees: Option<u64>,
}

/// Invoice record
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Default)]
pub struct Invoice {
    pub id: String,
    pub user_id: String,
    pub payment_id: String,
    pub amount: u64,
    pub currency: Currency,
    pub billing_period_start: u64,
    pub billing_period_end: u64,
    pub invoice_number: String,
    pub paid: bool,
    pub created_at: u64,
}

// Storable implementations for PaymentRecord
impl Storable for PaymentRecord {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).expect("Failed to encode PaymentRecord"))
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(bytes.as_ref()).expect("Failed to decode PaymentRecord")
    }
}

impl BoundedStorable for PaymentRecord {
    const MAX_SIZE: u32 = 8 * 1024; // 8KB per payment record
    const IS_FIXED_SIZE: bool = false;
}

// Storable implementations for Invoice
impl Storable for Invoice {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).expect("Failed to encode Invoice"))
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(bytes.as_ref()).expect("Failed to decode Invoice")
    }
}

impl BoundedStorable for Invoice {
    const MAX_SIZE: u32 = 4 * 1024; // 4KB per invoice
    const IS_FIXED_SIZE: bool = false;
}

