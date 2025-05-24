use crate::models::dashboard_token::DashboardToken;
use crate::models::discord_user::DiscordUser;
use crate::models::stable_principal::StablePrincipal;
use crate::models::stable_string::StableString;
use crate::storage::memory::{DASHBOARD_TOKENS, DISCORD_USERS};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use candid::Principal;
use ic_cdk::api::management_canister::main::raw_rand;
use ic_cdk::api::time;
use ic_cdk::{query, update};

// 2 minutes in nanoseconds
const TOKEN_EXPIRY_NANOS: u64 = 2 * 60 * 1_000_000_000;

#[update]
pub fn ensure_discord_user(discord_id: String) {
    DISCORD_USERS.with(|users| {
        let mut users = users.borrow_mut();
        if !users.contains_key(&StableString::from(discord_id.clone())) {
            let user = DiscordUser {
                discord_id: discord_id.clone(),
                site_principal: None,
                username: None,
                guild_id: None,
            };
            users.insert(StableString::from(discord_id), user);
        }
    });
}

#[update]
pub async fn generate_dashboard_token(discord_id: String) -> String {
    // First ensure user exists
    ensure_discord_user(discord_id.clone());

    // Generate random bytes using IC's random number generator
    let random_bytes = raw_rand().await.unwrap().0;
    let token: Vec<u8> = random_bytes.into_iter().take(32).collect();

    // Create base64 encoded token
    let token_string = BASE64.encode(&token);

    let now = ic_cdk::api::time();

    // Create token record
    let token_record = DashboardToken {
        token: token.clone(),
        openchat_id: discord_id.clone(), // We'll use the same field for discord_id
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

#[update]
pub fn link_accounts(site_principal: Principal, discord_id: String) -> Result<(), String> {
    DISCORD_USERS.with(|users| {
        let mut users = users.borrow_mut();
        if let Some(mut user) = users.get(&StableString::from(discord_id.clone())) {
            if user.site_principal.is_some() {
                return Err("Account already linked".to_string());
            }
            user.site_principal = Some(StablePrincipal::new(site_principal));
            users.insert(StableString::from(discord_id), user);
            Ok(())
        } else {
            Err("Discord user not found".to_string())
        }
    })
}

#[query]
pub fn get_discord_user(discord_id: String) -> Option<DiscordUser> {
    DISCORD_USERS.with(|users| {
        let users = users.borrow();
        users.get(&StableString::from(discord_id))
    })
}

#[query]
pub fn get_discord_user_by_principal(principal: Principal) -> Option<DiscordUser> {
    DISCORD_USERS.with(|users| {
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