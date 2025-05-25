use crate::models::dashboard_token::DashboardToken;
use crate::models::stable_string::StableString;
use crate::storage::memory::DASHBOARD_TOKENS;
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use ic_cdk::api::management_canister::main::raw_rand;
// use ic_cdk::api::time;
use ic_cdk::{query, update};

// 2 minutes in nanoseconds
const TOKEN_EXPIRY_NANOS: u64 = 2 * 60 * 1_000_000_000;

#[update]
pub async fn generate_dashboard_token(platform_id: String) -> String {
    // Generate random bytes using IC's random number generator
    let random_bytes = raw_rand().await.unwrap().0;
    let token: Vec<u8> = random_bytes.into_iter().take(32).collect();

    // Create base64 encoded token
    let token_string = BASE64.encode(&token);

    // Log the generated token for debugging
    ic_cdk::println!("Generated dashboard token (base64): {}", token_string);

    let now = ic_cdk::api::time();

    // Create token record
    let token_record = DashboardToken {
        token: token.clone(),
        openchat_id: platform_id.clone(), // We'll use this field for all platform IDs
        created_at: now,
        expires_at: now + TOKEN_EXPIRY_NANOS,
    };

    // Store token
    DASHBOARD_TOKENS.with(|tokens| {
        let mut tokens = tokens.borrow_mut();

        // Clean up expired tokens while we're here
        let expired_keys: Vec<StableString> = tokens
            .iter()
            .filter(|(_, t)| t.expires_at < now)
            .map(|(k, _)| k)
            .collect();

        for key in expired_keys {
            tokens.remove(&key);
        }

        // Store new token
        tokens.insert(StableString::from(token_string.clone()), token_record);
    });

    token_string
}

#[query]
pub fn validate_dashboard_token(token: Vec<u8>) -> Option<String> {
    let token_key = BASE64.encode(&token);
    let now = ic_cdk::api::time();
    ic_cdk::println!("validate_dashboard_token called with token bytes: {:?}", token);
    ic_cdk::println!("Base64-encoded token key: {}", token_key);

    DASHBOARD_TOKENS.with(|tokens| {
        let tokens = tokens.borrow();
        if let Some(token_record) = tokens.get(&StableString::from(token_key.clone())) {
            ic_cdk::println!("Token found. Expires at: {}, Current time: {}", token_record.expires_at, now);
            if token_record.expires_at > now {
                Some(token_record.openchat_id.clone())
            } else {
                ic_cdk::println!("Token expired.");
                None
            }
        } else {
            ic_cdk::println!("Token not found in storage.");
            None
        }
    })
} 