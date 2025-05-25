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
        if let Some(token_record) = tokens.get(&StableString::from(token.clone())) {
            // Link the account using the centralized function
            let result = link_accounts(principal, token_record.openchat_id.clone());
            
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

#[derive(Debug)]
pub enum Platform {
    OpenChat,
    Slack,
    Discord,
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
                    if user.site_principal.is_some() {
                        return Err("Account already linked".to_string());
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
                    if user.site_principal.is_some() {
                        return Err("Account already linked".to_string());
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
                    if user.site_principal.is_some() {
                        return Err("Account already linked".to_string());
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