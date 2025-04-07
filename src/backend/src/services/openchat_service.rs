use crate::models::dashboard_token::DashboardToken;
use crate::models::openchat_user::OpenChatUser;
use crate::models::stable_principal::StablePrincipal;
use crate::models::stable_string::StableString;
use crate::storage::memory::{DASHBOARD_TOKENS, OPENCHAT_USERS};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use candid::Principal;
use ic_cdk::api::management_canister::main::raw_rand;
use ic_cdk::api::time;
use ic_cdk::{query, update};

// 2 minutes in nanoseconds
const TOKEN_EXPIRY_NANOS: u64 = 2 * 60 * 1_000_000_000; // 2 minutes in nanoseconds

#[update]
pub fn ensure_openchat_user(openchat_id: String) {
    OPENCHAT_USERS.with(|users| {
        let mut users = users.borrow_mut();
        if !users.contains_key(&StableString::from(openchat_id.clone())) {
            let user = OpenChatUser {
                openchat_id: openchat_id.clone(),
                site_principal: None,
                first_interaction: time(),
                last_interaction: time(),
            };
            users.insert(StableString::from(openchat_id), user);
        } else {
            // Update last interaction time
            if let Some(mut user) = users.get(&StableString::from(openchat_id.clone())) {
                user.last_interaction = time();
                users.insert(StableString::from(openchat_id), user);
            }
        }
    });
}

#[update]
pub async fn generate_dashboard_token(openchat_id: String) -> String {
    // First ensure user exists
    ensure_openchat_user(openchat_id.clone());

    // Generate random bytes using IC's random number generator
    let random_bytes = raw_rand().await.unwrap().0;
    let token: Vec<u8> = random_bytes.into_iter().take(32).collect();

    // Create base64 encoded token
    let token_string = BASE64.encode(&token);

    let now = ic_cdk::api::time();

    // Create token record
    let token_record = DashboardToken {
        token: token.clone(),
        openchat_id: openchat_id.clone(),
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

// Add helper function to validate tokens
#[query]
pub fn validate_dashboard_token(token: Vec<u8>) -> Option<String> {
    let token_key = BASE64.encode(&token);
    let now = ic_cdk::api::time();

    DASHBOARD_TOKENS.with(|tokens| {
        let tokens = tokens.borrow();
        if let Some(token_record) = tokens.get(&StableString::from(token_key)) {
            if token_record.expires_at > now {
                Some(token_record.openchat_id)
            } else {
                None
            }
        } else {
            None
        }
    })
}

#[update]
pub fn link_accounts(site_principal: Principal, openchat_id: String) -> Result<(), String> {
    OPENCHAT_USERS.with(|users| {
        let mut users = users.borrow_mut();
        if let Some(mut user) = users.get(&StableString::from(openchat_id.clone())) {
            if user.site_principal.is_some() {
                return Err("Account already linked".to_string());
            }
            user.site_principal = Some(StablePrincipal::new(site_principal));
            users.insert(StableString::from(openchat_id), user);
            Ok(())
        } else {
            Err("OpenChat user not found".to_string())
        }
    })
}

#[query]
pub fn get_registered_openchat_users() -> Vec<OpenChatUser> {
    OPENCHAT_USERS.with(|users| {
        let users = users.borrow();
        users.iter().map(|(_, user)| user).collect()
    })
}

// Optional: Add a filtered version that only returns users who have interacted within a certain timeframe
#[query]
pub fn get_active_openchat_users(since_timestamp: u64) -> Vec<OpenChatUser> {
    OPENCHAT_USERS.with(|users| {
        let users = users.borrow();
        users
            .iter()
            .map(|(_, user)| user)
            .filter(|user| user.last_interaction >= since_timestamp)
            .collect()
    })
}

// Optional: Add a function to get a specific user by their OpenChat ID
#[query]
pub fn get_openchat_user(openchat_id: String) -> Option<OpenChatUser> {
    OPENCHAT_USERS.with(|users| {
        let users = users.borrow();
        users.get(&StableString::from(openchat_id))
    })
}

#[query]
pub fn get_openchat_user_by_principal(principal: Principal) -> Option<OpenChatUser> {
    OPENCHAT_USERS.with(|users| {
        let users = users.borrow();
        users
            .iter()
            .find(|(_, user)| {
                user.site_principal
                    .as_ref()
                    .map(|p| p.get() == principal)
                    .unwrap_or(false)
            })
            .map(|(_, user)| user.clone())
    })
}
