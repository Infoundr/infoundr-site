pub mod api;
pub mod paystack_client;
pub mod paystack_models;
pub mod webhook_handler;

use std::cell::RefCell;
use candid::CandidType;
use serde::{Deserialize, Serialize};

thread_local! {
    /// Paystack configuration stored in canister
    static PAYSTACK_CONFIG: RefCell<PaystackConfig> = RefCell::new(PaystackConfig::default());
}

/// Paystack configuration
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct PaystackConfig {
    pub secret_key: String,
    pub public_key: String,
    pub environment: PaystackEnvironment,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum PaystackEnvironment {
    Test,
    Live,
}

impl Default for PaystackConfig {
    fn default() -> Self {
        Self {
            secret_key: String::new(),
            public_key: String::new(),
            environment: PaystackEnvironment::Test,
        }
    }
}

/// Set Paystack configuration (admin only)
pub fn set_paystack_config(config: PaystackConfig) {
    PAYSTACK_CONFIG.with(|c| {
        *c.borrow_mut() = config;
    });
}

/// Get Paystack configuration
pub fn get_paystack_config() -> PaystackConfig {
    PAYSTACK_CONFIG.with(|c| c.borrow().clone())
}

/// Get Paystack secret key
pub fn get_secret_key() -> String {
    PAYSTACK_CONFIG.with(|c| c.borrow().secret_key.clone())
}

/// Get Paystack public key
pub fn get_public_key() -> String {
    PAYSTACK_CONFIG.with(|c| c.borrow().public_key.clone())
}

/// Check if Paystack is configured
pub fn is_configured() -> bool {
    PAYSTACK_CONFIG.with(|c| {
        let config = c.borrow();
        !config.secret_key.is_empty() && !config.public_key.is_empty()
    })
}

