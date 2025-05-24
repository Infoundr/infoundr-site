use crate::models::dashboard_token::DashboardToken;
use crate::models::stable_string::StableString;
use crate::services::openchat_service::link_accounts as link_openchat_accounts;
use crate::services::slack_service::link_accounts as link_slack_accounts;
use crate::services::discord_service::link_accounts as link_discord_accounts;
use crate::storage::memory::DASHBOARD_TOKENS;
use candid::Principal;
use ic_cdk::{query, update};

#[update]
pub fn verify_token(token: String) -> Result<(), String> {
    DASHBOARD_TOKENS.with(|tokens| {
        let tokens = tokens.borrow();
        if let Some(token_record) = tokens.get(&StableString::from(token.clone())) {
            if token_record.expires_at < ic_cdk::api::time() {
                return Err("Token expired".to_string());
            }
            Ok(())
        } else {
            Err("Invalid token".to_string())
        }
    })
}

#[update]
pub fn link_token_to_principal(token: String, principal: Principal) -> Result<(), String> {
    // First verify the token
    verify_token(token.clone())?;

    DASHBOARD_TOKENS.with(|tokens| {
        let mut tokens = tokens.borrow_mut();
        if let Some(token_record) = tokens.get(&StableString::from(token.clone())) {
            // Try to link based on the platform ID
            let result = if token_record.openchat_id.starts_with("U") {
                // Slack ID format
                link_slack_accounts(principal, token_record.openchat_id.clone())
            } else if token_record.openchat_id.parse::<u64>().is_ok() {
                // Discord ID format (numeric)
                link_discord_accounts(principal, token_record.openchat_id.clone())
            } else {
                // Assume OpenChat ID
                link_openchat_accounts(principal, token_record.openchat_id.clone())
            };

            // Remove the token after linking
            tokens.remove(&StableString::from(token));
            result
        } else {
            Err("Invalid token".to_string())
        }
    })
}

#[query]
pub fn get_token_info(token: String) -> Option<DashboardToken> {
    DASHBOARD_TOKENS.with(|tokens| {
        let tokens = tokens.borrow();
        tokens.get(&StableString::from(token))
    })
} 