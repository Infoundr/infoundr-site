use crate::models::dashboard_token::DashboardToken;
use crate::models::stable_principal::StablePrincipal;
use crate::models::stable_string::StableString;
use crate::storage::memory::{DASHBOARD_TOKENS, OPENCHAT_USERS, SLACK_USERS, DISCORD_USERS};
use candid::Principal;
use ic_cdk::{query, update};

#[update]
pub fn verify_token(token: String) -> Result<(), String> {
    ic_cdk::println!("Verifying token: {}", token);
    DASHBOARD_TOKENS.with(|tokens| {
        let tokens = tokens.borrow();
        if let Some(token_record) = tokens.get(&StableString::from(token.clone())) {
            ic_cdk::println!("Token found. Expires at: {}, Current time: {}", token_record.expires_at, ic_cdk::api::time());
            if token_record.expires_at < ic_cdk::api::time() {
                ic_cdk::println!("Token expired.");
                return Err("Token expired".to_string());
            }
            Ok(())
        } else {
            ic_cdk::println!("Token not found in storage.");
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
        ic_cdk::println!("Linking token to principal: {}", token);
        if let Some(token_record) = tokens.get(&StableString::from(token.clone())) {
            // Link the account using the centralized function
            ic_cdk::println!("Linking account to principal: {}", principal);
            ic_cdk::println!("Token record platform_id: {}", token_record.openchat_id);
            
            // Decode the platform the user is coming from
            let platform_id = token_record.openchat_id.clone();
            let platform = if platform_id.starts_with('U') {
                Platform::Slack
            } else if platform_id.chars().all(|c| c.is_numeric()) {
                Platform::Discord
            } else {
                Platform::OpenChat
            };
            
            ic_cdk::println!("Detected platform: {:?}", platform);
            
            // Ensure user exists before linking
            match platform {
                Platform::Slack => {
                    crate::services::slack_service::ensure_slack_user(platform_id.clone());
                }
                Platform::Discord => {
                    crate::services::discord_service::ensure_discord_user(platform_id.clone());
                }
                Platform::OpenChat => {
                    crate::services::openchat_service::ensure_openchat_user(platform_id.clone());
                }
            }
            
            let result = link_accounts(principal, platform_id);
            ic_cdk::println!("Link result: {:?}", result);
            // Remove the token after linking
            tokens.remove(&StableString::from(token));
            ic_cdk::println!("Token removed successfully");
            result
        } else {
            ic_cdk::println!("Token not found in storage.");
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

// Debug function to list all tokens (remove this before production)
#[query]
pub fn list_all_tokens() -> Vec<(String, DashboardToken)> {
    DASHBOARD_TOKENS.with(|tokens| {
        let tokens = tokens.borrow();
        let mut result = Vec::new();
        for (key, token_record) in tokens.iter() {
            result.push((key.to_string(), token_record.clone()));
        }
        result
    })
}

#[derive(Debug)]
pub enum Platform {
    OpenChat,
    Slack,
    Discord,
}

#[update]
pub fn unlink_accounts(platform_id: String) -> Result<(), String> {
    // Determine platform based on ID format
    let platform = if platform_id.starts_with('U') {
        Platform::Slack
    } else if platform_id.chars().all(|c| c.is_numeric()) {
        Platform::Discord
    } else {
        Platform::OpenChat
    };

    match platform {
        Platform::OpenChat => {
            OPENCHAT_USERS.with(|users| {
                let mut users = users.borrow_mut();
                if let Some(mut user) = users.get(&StableString::from(platform_id.clone())) {
                    user.site_principal = None;
                    users.insert(StableString::from(platform_id), user);
                    Ok(())
                } else {
                    Err("OpenChat user not found".to_string())
                }
            })
        }
        Platform::Slack => {
            SLACK_USERS.with(|users| {
                let mut users = users.borrow_mut();
                if let Some(mut user) = users.get(&StableString::from(platform_id.clone())) {
                    user.site_principal = None;
                    users.insert(StableString::from(platform_id), user);
                    Ok(())
                } else {
                    Err("Slack user not found".to_string())
                }
            })
        }
        Platform::Discord => {
            DISCORD_USERS.with(|users| {
                let mut users = users.borrow_mut();
                if let Some(mut user) = users.get(&StableString::from(platform_id.clone())) {
                    user.site_principal = None;
                    users.insert(StableString::from(platform_id), user);
                    Ok(())
                } else {
                    Err("Discord user not found".to_string())
                }
            })
        }
    }
}

#[update]
pub fn link_accounts(site_principal: Principal, platform_id: String) -> Result<(), String> {
    // Determine platform based on ID format
    let platform = if platform_id.starts_with('U') {
        Platform::Slack
    } else if platform_id.chars().all(|c| c.is_numeric()) {
        Platform::Discord
    } else {
        Platform::OpenChat
    };

    match platform {
        Platform::OpenChat => {
            OPENCHAT_USERS.with(|users| {
                let mut users = users.borrow_mut();
                if let Some(mut user) = users.get(&StableString::from(platform_id.clone())) {
                    ic_cdk::println!("[link_accounts] OpenChat: platform_id={}, current site_principal={:?}, new principal={:?}", platform_id, user.site_principal, site_principal);
                    // If already linked, unlink first
                    if user.site_principal.is_some() {
                        user.site_principal = None;
                    }
                    user.site_principal = Some(StablePrincipal::new(site_principal));
                    users.insert(StableString::from(platform_id), user);
                    Ok(())
                } else {
                    Err("OpenChat user not found".to_string())
                }
            })
        }
        Platform::Slack => {
            SLACK_USERS.with(|users| {
                let mut users = users.borrow_mut();
                if let Some(mut user) = users.get(&StableString::from(platform_id.clone())) {
                    ic_cdk::println!("[link_accounts] Slack: platform_id={}, current site_principal={:?}, new principal={:?}", platform_id, user.site_principal, site_principal);
                    // If already linked, unlink first
                    if user.site_principal.is_some() {
                        user.site_principal = None;
                    }
                    user.site_principal = Some(StablePrincipal::new(site_principal));
                    users.insert(StableString::from(platform_id), user);
                    Ok(())
                } else {
                    Err("Slack user not found".to_string())
                }
            })
        }
        Platform::Discord => {
            DISCORD_USERS.with(|users| {
                let mut users = users.borrow_mut();
                if let Some(mut user) = users.get(&StableString::from(platform_id.clone())) {
                    ic_cdk::println!("[link_accounts] Discord: platform_id={}, current site_principal={:?}, new principal={:?}", platform_id, user.site_principal, site_principal);
                    // If already linked, unlink first
                    if user.site_principal.is_some() {
                        user.site_principal = None;
                    }
                    user.site_principal = Some(StablePrincipal::new(site_principal));
                    users.insert(StableString::from(platform_id), user);
                    Ok(())
                } else {
                    Err("Discord user not found".to_string())
                }
            })
        }
    }
} 