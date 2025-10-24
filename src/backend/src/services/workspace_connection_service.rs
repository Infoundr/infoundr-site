use crate::storage::memory::{OPENCHAT_USERS, SLACK_USERS, DISCORD_USERS};
use ic_cdk::{query, caller};

#[query]
pub fn has_linked_workspace_accounts() -> bool {
    let caller_principal = caller();    

    // Check if the principal has linked any workspace accounts
    let has_slack = SLACK_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| {
            user.site_principal.as_ref().map(|p| p.get()) == Some(caller_principal)
        })
    });
    
    let has_discord = DISCORD_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| {
            user.site_principal.as_ref().map(|p| p.get()) == Some(caller_principal)
        })
    });
    
    let has_openchat = OPENCHAT_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| {
            user.site_principal.as_ref().map(|p| p.get()) == Some(caller_principal)
        })
    });
    
    has_slack || has_discord || has_openchat
}

#[query]
pub fn get_linked_workspace_accounts() -> Vec<String> {
    let caller_principal = caller();    

    let mut linked_platforms = Vec::new();
    
    // Check Slack
    let has_slack = SLACK_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| {
            user.site_principal.as_ref().map(|p| p.get()) == Some(caller_principal)
        })
    });
    if has_slack {
        linked_platforms.push("slack".to_string());
    }
    
    // Check Discord
    let has_discord = DISCORD_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| {
            user.site_principal.as_ref().map(|p| p.get()) == Some(caller_principal)
        })
    });
    if has_discord {
        linked_platforms.push("discord".to_string());
    }
    
    // Check OpenChat
    let has_openchat = OPENCHAT_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| {
            user.site_principal.as_ref().map(|p| p.get()) == Some(caller_principal)
        })
    });
    if has_openchat {
        linked_platforms.push("openchat".to_string());
    }
    
    linked_platforms
}
