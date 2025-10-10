use ic_cdk::api::time;
use crate::models::payment::{PaymentRecord, PaymentStatus, Currency, Invoice, TransactionDetails, PaymentMetadata};
use crate::models::usage_service::{UserTier, UserSubscription};
use crate::models::stable_string::StableString;
use crate::storage::memory::{PAYMENT_RECORDS, INVOICES, USER_SUBSCRIPTIONS};
use crate::payments::paystack_client::{
    initialize_transaction as paystack_initialize,
    verify_transaction as paystack_verify,
    build_metadata,
    get_payment_channels,
};
use crate::payments::paystack_models::{InitializeTransactionRequest, parse_payment_status, parse_payment_channel};
use crate::payments::is_configured;

const NANOS_PER_MONTH: u64 = 30 * 24 * 60 * 60 * 1_000_000_000; // ~30 days
const NANOS_PER_YEAR: u64 = 365 * 24 * 60 * 60 * 1_000_000_000; // ~365 days

/// Pricing in kobo (Nigerian currency, smallest unit)
/// 1 NGN = 100 kobo
const PRO_MONTHLY_NGN: u64 = 2_900_000; // ₦29,000 = $19 USD approx
const PRO_YEARLY_NGN: u64 = 29_000_000; // ₦290,000 = $190 USD approx (save ~17%)

/// Pricing in Kenyan Shillings (for M-Pesa)
/// 1 KES = 100 cents
// const PRO_MONTHLY_KES: u64 = 290_000; // KES 2,900 = ~$19 USD
const PRO_MONTHLY_KES: u64 = 1_000; // KES 1 for testing
const PRO_YEARLY_KES: u64 = 2_900_000; // KES 29,000 = ~$190 USD

/// Request to initialize a payment
#[derive(candid::CandidType, serde::Deserialize, Clone, Debug)]
pub struct InitializePaymentRequest {
    pub user_id: String,
    pub email: String,
    pub tier: String,              // "Pro"
    pub billing_period: String,    // "monthly" or "yearly"
    pub currency: String,          // "NGN" or "KES"
    pub callback_url: String,      // Where to redirect after payment
    pub phone_number: Option<String>, // For M-Pesa
    pub enable_mpesa: bool,        // Enable M-Pesa payment
    pub enable_card: bool,         // Enable card payment
}

/// Response from payment initialization
#[derive(candid::CandidType, serde::Deserialize, Clone, Debug)]
pub struct InitializePaymentResponse {
    pub success: bool,
    pub message: String,
    pub authorization_url: Option<String>,
    pub access_code: Option<String>,
    pub reference: String,
    pub amount: u64,
    pub currency: String,
}

/// Initialize a new payment
pub async fn initialize_payment(
    request: InitializePaymentRequest,
) -> Result<InitializePaymentResponse, String> {
    // Validate that Paystack is configured
    if !is_configured() {
        return Err("Payment system not configured".to_string());
    }

    // Determine amount based on tier and billing period
    let (amount, currency_enum) = calculate_amount(&request.tier, &request.billing_period, &request.currency)?;
    ic_cdk::println!("Amount: {}, Currency: {:?}", amount, currency_enum);

    // Generate unique reference
    let reference = generate_payment_reference(&request.user_id);
    ic_cdk::println!("Reference: {}", reference);

    // Build metadata
    let metadata = build_metadata(
        &request.user_id,
        &request.tier,
        &request.billing_period,
        request.phone_number.clone(),
    );
    ic_cdk::println!("Metadata: {}", metadata);

    // Determine payment channels
    let channels = get_payment_channels(request.enable_mpesa, request.enable_card);
    ic_cdk::println!("Channels: {:?}", channels);

    // Create Paystack request
    let paystack_request = InitializeTransactionRequest {
        email: request.email.clone(),
        amount: amount.to_string(),
        currency: request.currency.clone(),
        reference: reference.clone(),
        callback_url: request.callback_url.clone(),
        channels,
        metadata: Some(metadata),  // metadata is now String
        phone: request.phone_number.clone(),  // Pass phone to Paystack
    };
    ic_cdk::println!("Paystack request: {:?}", paystack_request);
    
    ic_cdk::println!("Calling Paystack API");
    // Call Paystack API
    match paystack_initialize(paystack_request).await {
        Ok(response) => {
            if response.status {
                ic_cdk::println!("Paystack API returned success");
                println!("Response is: {:?}", response);
                if let Some(data) = response.data {
                    // Store payment record
                    let payment_record = PaymentRecord {
                        id: reference.clone(),
                        user_id: request.user_id.clone(),
                        paystack_reference: reference.clone(),
                        amount,
                        currency: currency_enum,
                        email: request.email.clone(),
                        status: PaymentStatus::Pending,
                        payment_channel: None,
                        authorization_url: Some(data.authorization_url.clone()),
                        access_code: Some(data.access_code.clone()),
                        tier: request.tier.clone(),
                        billing_period: request.billing_period.clone(),
                        created_at: time(),
                        updated_at: time(),
                        paid_at: None,
                        paystack_transaction_id: None,
                        metadata: PaymentMetadata {
                            customer_name: None,
                            phone_number: request.phone_number.clone(),
                            custom_fields: vec![],
                        },
                    };
                    ic_cdk::println!("Payment record: {:?}", payment_record);

                    store_payment_record(payment_record)?;
                    ic_cdk::println!("Payment record stored");

                    Ok(InitializePaymentResponse {
                        success: true,
                        message: "Payment initialized successfully".to_string(),
                        authorization_url: Some(data.authorization_url),
                        access_code: Some(data.access_code),
                        reference: reference.clone(),
                        amount,
                        currency: request.currency,
                    })
                } else {
                    ic_cdk::println!("Paystack returned success but no data");
                    Err("Paystack returned success but no data".to_string())
                }
            } else {
                Err(format!("Paystack error: {}", response.message))
            }
        }
        Err(e) => Err(format!("Failed to initialize payment: {}", e)),
    }
}

/// Verify a payment and upgrade subscription if successful
pub async fn verify_payment(reference: String) -> Result<TransactionDetails, String> {
    // Call Paystack API to verify
    match paystack_verify(reference.clone()).await {
        Ok(response) => {
            if response.status {
                if let Some(data) = response.data {
                    // Update payment record
                    let status = parse_payment_status(&data.status);
                    let channel = parse_payment_channel(&data.channel);

                    PAYMENT_RECORDS.with(|records| {
                        let mut map = records.borrow_mut();
                        let key = StableString::from(reference.clone());

                        if let Some(mut payment) = map.get(&key) {
                            payment.status = status.clone();
                            payment.payment_channel = channel.clone();
                            payment.updated_at = time();
                            payment.paystack_transaction_id = Some(data.id);

                            if status == PaymentStatus::Success {
                                payment.paid_at = Some(time());

                                // Upgrade user subscription
                                let tier = match payment.tier.as_str() {
                                    "Pro" => UserTier::Pro,
                                    _ => UserTier::Free,
                                };

                                let expiry = calculate_expiry(&payment.billing_period);
                                upgrade_user_subscription(&payment.user_id, tier, expiry)?;

                                // Generate invoice
                                generate_invoice(&payment)?;
                            }

                            map.insert(key, payment);
                            
                            Ok(TransactionDetails {
                                reference: data.reference,
                                amount: data.amount,
                                currency: parse_currency(&data.currency),
                                status,
                                channel,
                                paid_at: data.paid_at,
                                transaction_id: Some(data.id),
                                customer_email: data.customer.email,
                                customer_name: data.customer.first_name,
                                fees: data.fees,
                            })
                        } else {
                            Err("Payment record not found".to_string())
                        }
                    })
                } else {
                    Err("Verification successful but no data returned".to_string())
                }
            } else {
                Err(format!("Verification failed: {}", response.message))
            }
        }
        Err(e) => Err(format!("Failed to verify payment: {}", e)),
    }
}

/// Get payment history for a user
pub fn get_payment_history(user_id: String) -> Vec<PaymentRecord> {
    PAYMENT_RECORDS.with(|records| {
        records
            .borrow()
            .iter()
            .filter(|(_, payment)| payment.user_id == user_id)
            .map(|(_, payment)| payment)
            .collect()
    })
}

/// Get a specific payment by reference
pub fn get_payment(reference: String) -> Option<PaymentRecord> {
    PAYMENT_RECORDS.with(|records| {
        records.borrow().get(&StableString::from(reference))
    })
}

/// Get all invoices for a user
pub fn get_user_invoices(user_id: String) -> Vec<Invoice> {
    INVOICES.with(|invoices| {
        invoices
            .borrow()
            .iter()
            .filter(|(_, invoice)| invoice.user_id == user_id)
            .map(|(_, invoice)| invoice)
            .collect()
    })
}

// ============= HELPER FUNCTIONS =============

/// Calculate amount based on tier, billing period, and currency
fn calculate_amount(tier: &str, billing_period: &str, currency: &str) -> Result<(u64, Currency), String> {
    let currency_enum = parse_currency(currency);
    
    let amount = match (tier, billing_period, currency_enum.clone()) {
        ("Pro", "monthly", Currency::NGN) => PRO_MONTHLY_NGN,
        ("Pro", "yearly", Currency::NGN) => PRO_YEARLY_NGN,
        ("Pro", "monthly", Currency::KES) => PRO_MONTHLY_KES,
        ("Pro", "yearly", Currency::KES) => PRO_YEARLY_KES,
        _ => return Err(format!("Invalid tier/billing period combination: {} {}", tier, billing_period)),
    };

    Ok((amount, currency_enum))
}

/// Generate unique payment reference
fn generate_payment_reference(user_id: &str) -> String {
    let timestamp = time();
    let random_suffix = timestamp % 10000;
    format!("INF-{}-{}", user_id.chars().take(8).collect::<String>(), random_suffix)
}

/// Store payment record
fn store_payment_record(payment: PaymentRecord) -> Result<(), String> {
    PAYMENT_RECORDS.with(|records| {
        let mut map = records.borrow_mut();
        let key = StableString::from(payment.paystack_reference.clone());
        map.insert(key, payment);
        Ok(())
    })
}

/// Upgrade user subscription
fn upgrade_user_subscription(user_id: &str, tier: UserTier, expires_at: Option<u64>) -> Result<(), String> {
    USER_SUBSCRIPTIONS.with(|subs| {
        let mut map = subs.borrow_mut();
        let key = StableString::from(user_id.to_string());

        let mut subscription = map.get(&key).unwrap_or(UserSubscription {
            user_id: user_id.to_string(),
            tier: UserTier::Free,
            is_active: true,
            started_at_ns: Some(time()),
            renewed_at_ns: None,
            expires_at_ns: None,
        });

        subscription.tier = tier;
        subscription.is_active = true;
        subscription.renewed_at_ns = Some(time());
        subscription.expires_at_ns = expires_at;

        if subscription.started_at_ns.is_none() {
            subscription.started_at_ns = Some(time());
        }

        map.insert(key, subscription);
        Ok(())
    })
}

/// Calculate subscription expiry time
fn calculate_expiry(billing_period: &str) -> Option<u64> {
    let now = time();
    match billing_period {
        "monthly" => Some(now + NANOS_PER_MONTH),
        "yearly" => Some(now + NANOS_PER_YEAR),
        _ => None,
    }
}

/// Generate invoice for successful payment
fn generate_invoice(payment: &PaymentRecord) -> Result<(), String> {
    let invoice_id = format!("INV-{}", payment.id);
    let now = time();

    let (period_start, period_end) = match payment.billing_period.as_str() {
        "monthly" => (now, now + NANOS_PER_MONTH),
        "yearly" => (now, now + NANOS_PER_YEAR),
        _ => (now, now),
    };

    let invoice = Invoice {
        id: invoice_id.clone(),
        user_id: payment.user_id.clone(),
        payment_id: payment.id.clone(),
        amount: payment.amount,
        currency: payment.currency.clone(),
        billing_period_start: period_start,
        billing_period_end: period_end,
        invoice_number: format!("INF-{}", now / 1_000_000_000), // Unix timestamp
        paid: true,
        created_at: now,
    };

    INVOICES.with(|invoices| {
        let mut map = invoices.borrow_mut();
        map.insert(StableString::from(invoice_id), invoice);
        Ok(())
    })
}

/// Parse currency string to enum
fn parse_currency(currency: &str) -> Currency {
    match currency.to_uppercase().as_str() {
        "NGN" => Currency::NGN,
        "KES" => Currency::KES,
        "GHS" => Currency::GHS,
        "ZAR" => Currency::ZAR,
        "USD" => Currency::USD,
        _ => Currency::NGN, // Default
    }
}

