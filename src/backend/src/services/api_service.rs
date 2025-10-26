use crate::models::api_message::{ApiMessage, ApiMetadata};
use crate::models::stable_string::StableString;
use crate::services::openchat_service::ensure_openchat_user;
use crate::services::slack_service::ensure_slack_user;
use crate::services::discord_service::ensure_discord_user;
use crate::services::main_site_service::ensure_main_site_user;
use crate::storage::memory::{API_MESSAGES, OPENCHAT_USERS, SLACK_USERS, DISCORD_USERS, MAIN_SITE_USERS};
use candid::Principal;
use ic_cdk::{query, update};
use crate::services::pricing_services::{
    get_usage_stats, get_user_tier, can_make_request, increment_user_requests, upgrade_user_tier, get_user_subscription,
};
use crate::services::analytics_service::update_user_analytics;
use crate::services::token_service::generate_dashboard_token;
use crate::models::usage_service::{UsageStats,UserTier,UserSubscription};


// API Message Storage Management
#[update]
pub fn store_api_message(
    identifier: UserIdentifier,
    message: String,
    response: String,
    bot_name: String,
    metadata: Option<ApiMetadata>,
)  -> Result<ApiMessage, String>{
    let _store_principal = match &identifier {
        UserIdentifier::Principal(principal) => *principal,
        UserIdentifier::OpenChatId(openchat_id) => {
            // Ensure OpenChat user exists
            ensure_openchat_user(openchat_id.clone());

            // Try to get linked principal, otherwise derive from openchat_id
            OPENCHAT_USERS.with(|users| {
                users
                    .borrow()
                    .get(&StableString::from(openchat_id.clone()))
                    .and_then(|user| user.site_principal.map(|p| p.get()))
                    .unwrap_or_else(|| {
                        Principal::from_text(openchat_id).unwrap_or_else(|_| Principal::anonymous())
                    })
            })
        }
        UserIdentifier::SlackId(slack_id) => {
            ensure_slack_user(slack_id.clone());

            // Try to get linked principal, otherwise use a special Slack principal
            SLACK_USERS.with(|users| {
                users
                    .borrow()
                    .get(&StableString::from(slack_id.clone()))
                    .and_then(|user| user.site_principal.map(|p| p.get()))
                    .unwrap_or_else(|| {
                        // Create a special principal for Slack messages
                        // This is a deterministic way to create a principal from a Slack ID
                        let mut bytes = [0u8; 29];
                        bytes[0] = 5; // Special type for Slack
                        // Use the first 28 bytes of the Slack ID
                        let slack_bytes = slack_id.as_bytes();
                        let len = std::cmp::min(slack_bytes.len(), 28);
                        bytes[1..1+len].copy_from_slice(&slack_bytes[..len]);
                        Principal::from_slice(&bytes)
                    })
            })
        }
        UserIdentifier::DiscordId(discord_id) => {
            ensure_discord_user(discord_id.clone());

            // Try to get linked principal, otherwise use a special Discord principal
            DISCORD_USERS.with(|users| {
                users
                    .borrow()
                    .get(&StableString::from(discord_id.clone()))
                    .and_then(|user| user.site_principal.map(|p| p.get()))
                    .unwrap_or_else(|| {
                        // Create a special principal for Discord messages
                        // This is a deterministic way to create a principal from a Discord ID
                        let mut bytes = [0u8; 29];
                        bytes[0] = 6; // Special type for Discord
                        // Use the first 28 bytes of the Discord ID
                        let discord_bytes = discord_id.as_bytes();
                        let len = std::cmp::min(discord_bytes.len(), 28);
                        bytes[1..1+len].copy_from_slice(&discord_bytes[..len]);
                        Principal::from_slice(&bytes)
                    })
            })
        }
        UserIdentifier::PlaygroundId(playground_id) => {
            // Create a special principal for Playground messages
            // This is a deterministic way to create a principal from a Playground ID
            let mut bytes = [0u8; 29];
            bytes[0] = 7; // Special type for Playground
            // Use the first 28 bytes of the Playground ID
            let playground_bytes = playground_id.as_bytes();
            let len = std::cmp::min(playground_bytes.len(), 28);
            bytes[1..1+len].copy_from_slice(&playground_bytes[..len]);
            Principal::from_slice(&bytes)
        }
        UserIdentifier::MainSiteId(main_site_id) => {
            ensure_main_site_user(main_site_id.clone());

            // Try to get linked principal, otherwise use a special MainSite principal
            MAIN_SITE_USERS.with(|users| {
                users
                    .borrow()
                    .get(&StableString::from(main_site_id.clone()))
                    .and_then(|user| user.site_principal.map(|p| p.get()))
                    .unwrap_or_else(|| {
                        // Create a special principal for MainSite messages
                        // This is a deterministic way to create a principal from a MainSite ID
                        let mut bytes = [0u8; 29];
                        bytes[0] = 8; // Special type for MainSite
                        // Use the first 28 bytes of the MainSite ID
                        let main_site_bytes = main_site_id.as_bytes();
                        let len = std::cmp::min(main_site_bytes.len(), 28);
                        bytes[1..1+len].copy_from_slice(&main_site_bytes[..len]);
                        Principal::from_slice(&bytes)
                    })
            })
        }
    };

    let timestamp = ic_cdk::api::time();
    let user_id = match &identifier {
        UserIdentifier::Principal(principal) => principal.to_string(),
        UserIdentifier::OpenChatId(openchat_id) => openchat_id.clone(),
        UserIdentifier::SlackId(slack_id) => slack_id.clone(),
        UserIdentifier::DiscordId(discord_id) => discord_id.clone(),
        UserIdentifier::PlaygroundId(playground_id) => playground_id.clone(),
        UserIdentifier::MainSiteId(main_site_id) => main_site_id.clone(),
    };
    
    
    // ✅ Usage validation before storing the request
    if !can_make_request(&user_id) {
        return Err(format!(
            "Daily limit reached. Upgrade to Pro for unlimited access. \
             Usage: {:?}",
            get_usage_stats(&user_id)
        ));
    }

    if let Err(err) = increment_user_requests(&user_id) {
        return Err(err);
    }

    // Update analytics data for dashboard tracking
    if let Err(err) = update_user_analytics(&user_id) {
        // Log error but don't fail the request - analytics is not critical
        ic_cdk::println!("Failed to update analytics for user {}: {}", user_id, err);
    }


    // Create unique message ID
    let message_id = format!("{}_{}", user_id, timestamp);

    let api_message = ApiMessage {
        id: message_id.clone(),
        user_id,
        message,
        response,
        bot_name,
        metadata,
        timestamp,
    };

    // Store the message under the principal
    API_MESSAGES.with(|messages| {
        let mut messages = messages.borrow_mut();
        messages.insert((StableString::from(message_id), timestamp), api_message.clone());
    });

    Ok(api_message)

    // Add debug logging
    // ic_cdk::println!("Stored API message with ID {} for principal {:?}", message_id, store_principal);
}

// Get API message history for a user

#[query]
pub fn get_api_message_history(identifier: UserIdentifier) -> Vec<ApiMessage> {
    let principals_to_check = match &identifier {
        UserIdentifier::Principal(principal) => {
            // Check if this principal is linked to any platform account
            let mut principals = vec![*principal];

            // Check OpenChat
            OPENCHAT_USERS.with(|users| {
                let users = users.borrow();
                // Find any OpenChat user linked to this principal
                for (_, user) in users.iter() {
                    if let Some(p) = &user.site_principal {
                        if p.get() == *principal {
                            // If found, also derive principal from OpenChat ID
                            if let Ok(derived_principal) = Principal::from_text(&user.openchat_id) {
                                principals.push(derived_principal);
                            }
                            break;
                        }
                    }
                }
            });

            // Check Slack
            SLACK_USERS.with(|users| {
                let users = users.borrow();
                for (_, user) in users.iter() {
                    if let Some(p) = &user.site_principal {
                        if p.get() == *principal {
                            // If found, also create special Slack principal
                            let mut bytes = [0u8; 29];
                            bytes[0] = 5; // Special type for Slack
                            let slack_bytes = user.slack_id.as_bytes();
                            let len = std::cmp::min(slack_bytes.len(), 28);
                            bytes[1..1+len].copy_from_slice(&slack_bytes[..len]);
                            principals.push(Principal::from_slice(&bytes));
                            break;
                        }
                    }
                }
            });

            // Check Discord
            DISCORD_USERS.with(|users| {
                let users = users.borrow();
                for (_, user) in users.iter() {
                    if let Some(p) = &user.site_principal {
                        if p.get() == *principal {
                            // If found, also create special Discord principal
                            let mut bytes = [0u8; 29];
                            bytes[0] = 6; // Special type for Discord
                            let discord_bytes = user.discord_id.as_bytes();
                            let len = std::cmp::min(discord_bytes.len(), 28);
                            bytes[1..1+len].copy_from_slice(&discord_bytes[..len]);
                            principals.push(Principal::from_slice(&bytes));
                            break;
                        }
                    }
                }
            });

            principals
        }
        UserIdentifier::OpenChatId(openchat_id) => {
            let mut principals = vec![];

            // Try to get linked principal
            OPENCHAT_USERS.with(|users| {
                let users = users.borrow();
                if let Some(user) = users.get(&StableString::from(openchat_id.clone())) {
                    if let Some(p) = &user.site_principal {
                        principals.push(p.get());
                    }
                }
            });

            // Also include derived principal from OpenChat ID
            if let Ok(derived_principal) = Principal::from_text(openchat_id) {
                principals.push(derived_principal);
            }
            principals
        }
        UserIdentifier::SlackId(slack_id) => {
            let mut principals = vec![];

            // Try to get linked principal
            SLACK_USERS.with(|users| {
                let users = users.borrow();
                if let Some(user) = users.get(&StableString::from(slack_id.clone())) {
                    if let Some(p) = &user.site_principal {
                        principals.push(p.get());
                    }
                }
            });

            // Also include special Slack principal
            let mut bytes = [0u8; 29];
            bytes[0] = 5; // Special type for Slack
            let slack_bytes = slack_id.as_bytes();
            let len = std::cmp::min(slack_bytes.len(), 28);
            bytes[1..1+len].copy_from_slice(&slack_bytes[..len]);
            principals.push(Principal::from_slice(&bytes));

            principals
        }
        UserIdentifier::DiscordId(discord_id) => {
            let mut principals = vec![];

            // Try to get linked principal
            DISCORD_USERS.with(|users| {
                let users = users.borrow();
                if let Some(user) = users.get(&StableString::from(discord_id.clone())) {
                    if let Some(p) = &user.site_principal {
                        principals.push(p.get());
                    }
                }
            });

            // Also include special Discord principal
            let mut bytes = [0u8; 29];
            bytes[0] = 6; // Special type for Discord
            let discord_bytes = discord_id.as_bytes();
            let len = std::cmp::min(discord_bytes.len(), 28);
            bytes[1..1+len].copy_from_slice(&discord_bytes[..len]);
            principals.push(Principal::from_slice(&bytes));

            principals
        }
        UserIdentifier::PlaygroundId(playground_id) => {
            let mut principals = vec![];

            // Create special Playground principal
            let mut bytes = [0u8; 29];
            bytes[0] = 7; // Special type for Playground
            let playground_bytes = playground_id.as_bytes();
            let len = std::cmp::min(playground_bytes.len(), 28);
            bytes[1..1+len].copy_from_slice(&playground_bytes[..len]);
            principals.push(Principal::from_slice(&bytes));

            principals
        }
        UserIdentifier::MainSiteId(main_site_id) => {
            let mut principals = vec![];

            // Try to get linked principal
            MAIN_SITE_USERS.with(|users| {
                let users = users.borrow();
                if let Some(user) = users.get(&StableString::from(main_site_id.clone())) {
                    if let Some(p) = &user.site_principal {
                        principals.push(p.get());
                    }
                }
            });

            // Also include special MainSite principal
            let mut bytes = [0u8; 29];
            bytes[0] = 8; // Special type for MainSite
            let main_site_bytes = main_site_id.as_bytes();
            let len = std::cmp::min(main_site_bytes.len(), 28);
            bytes[1..1+len].copy_from_slice(&main_site_bytes[..len]);
            principals.push(Principal::from_slice(&bytes));

            principals
        }
    };

    // Collect all API messages across all relevant principals
    let mut all_api_messages = vec![];

    for principal in principals_to_check {
        // Get API messages by checking the user_id field in stored messages
        API_MESSAGES.with(|messages| {
            let messages = messages.borrow();
            let user_principal_str = principal.to_string();
            
            let api_messages: Vec<ApiMessage> = messages
                .iter()
                .filter(|(_, api_message)| api_message.user_id == user_principal_str)
                .map(|(_, message)| message.clone())
                .collect();
            
            all_api_messages.extend(api_messages);
        });
    }

    // Also check for messages stored with platform-specific user IDs
    let platform_user_id = match &identifier {
        UserIdentifier::Principal(principal) => principal.to_string(),
        UserIdentifier::OpenChatId(openchat_id) => openchat_id.clone(),
        UserIdentifier::SlackId(slack_id) => slack_id.clone(),
        UserIdentifier::DiscordId(discord_id) => discord_id.clone(),
        UserIdentifier::PlaygroundId(playground_id) => playground_id.clone(),
        UserIdentifier::MainSiteId(main_site_id) => main_site_id.clone(),
    };

    API_MESSAGES.with(|messages| {
        let messages = messages.borrow();
        let platform_messages: Vec<ApiMessage> = messages
            .iter()
            .filter(|(_, api_message)| api_message.user_id == platform_user_id)
            .map(|(_, message)| message.clone())
            .collect();
        
        all_api_messages.extend(platform_messages);
    });

    // Sort by timestamp (newest first)
    all_api_messages.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    // Remove duplicates based on message ID
    let mut unique_messages = vec![];
    let mut seen_ids = std::collections::HashSet::new();
    
    for message in all_api_messages {
        if !seen_ids.contains(&message.id) {
            seen_ids.insert(message.id.clone());
            unique_messages.push(message);
        }
    }

    unique_messages
}

// Get API messages by bot name

#[query]
pub fn get_api_messages_by_bot(identifier: UserIdentifier, bot_name: String) -> Vec<ApiMessage> {
    let all_messages = get_api_message_history(identifier);
    all_messages
        .into_iter()
        .filter(|message| message.bot_name == bot_name)
        .collect()
}

// Get recent API messages (last N messages)
#[query]    
pub fn get_recent_api_messages(identifier: UserIdentifier, limit: u32) -> Vec<ApiMessage> {
    let mut all_messages = get_api_message_history(identifier);
    all_messages.truncate(limit.min(all_messages.len() as u32)as usize);
    all_messages
}

// Helper enum for user identification (same as in account_service.rs)
#[derive(candid::CandidType, serde::Deserialize, Clone, Debug)]
pub enum UserIdentifier {
    Principal(Principal),
    OpenChatId(String),
    SlackId(String),
    DiscordId(String),
    PlaygroundId(String),
    MainSiteId(String),
} 

// -------------------- USAGE & PRICING API --------------------

// Get current usage stats for a user
#[query]
pub fn api_get_usage_stats(user_id: String) -> UsageStats {
    get_usage_stats(&user_id)
}

// Get current tier for a user
#[query]
pub fn api_get_user_tier(user_id: String) -> UserTier {
    get_user_tier(&user_id)
}

// Check if user can make a request
#[query]
pub fn api_can_make_request(user_id: String) -> bool {
    can_make_request(&user_id)
}

// Increment requests counter for a user
#[update]
pub fn api_increment_user_requests(user_id: String) -> Result<(), String> {
    increment_user_requests(&user_id)?;
    
    // Update analytics data for dashboard tracking
    if let Err(err) = update_user_analytics(&user_id) {
        // Log error but don't fail the request - analytics is not critical
        ic_cdk::println!("Failed to update analytics for user {}: {}", user_id, err);
    }
    
    Ok(())
}

// Upgrade user tier (Free -> Pro)
#[update]
pub fn api_upgrade_user_tier(user_id: String, tier: UserTier, expires_at_ns: Option<u64>) -> Result<(), String> {
    upgrade_user_tier(&user_id, tier, expires_at_ns)
}

// Get full subscription details (tier, expiry, active status, etc.)
#[query]
pub fn api_get_user_subscription(user_id: String) -> Option<UserSubscription> {
    get_user_subscription(&user_id)
}

// -------------------- WORKSPACE LINKING LOGIC --------------------

// Check if a specific platform ID is linked to any principal
#[update]
pub async fn api_is_platform_id_linked(platform: String, platform_id: String) -> Result<bool, String> {
    if has_platform_id_linked(&platform, &platform_id) {
        Ok(true)
    } else {
        // Generate auth token for workspace linking
        let auth_token = generate_dashboard_token(platform_id).await;
        Err(auth_token)
    }
}


// Independent function to check if a user identifier has linked workspace
// pub async fn check_workspace_linking(identifier: &UserIdentifier) -> Result<(), String> {
//     let platform_linked = match identifier {
//         UserIdentifier::Principal(_) => {
//             // For principal-based requests, we don't require workspace linking
//             // as the principal itself is the authentication
//             true
//         }
//         UserIdentifier::SlackId(slack_id) => {
//             has_platform_id_linked("slack", slack_id)
//         }
//         UserIdentifier::DiscordId(discord_id) => {
//             has_platform_id_linked("discord", discord_id)
//         }
//         UserIdentifier::OpenChatId(openchat_id) => {
//             has_platform_id_linked("openchat", openchat_id)
//         }
//         UserIdentifier::PlaygroundId(_) => {
//             // Playground requests don't require workspace linking
//             true
//         }
//     };
    
//     if !platform_linked {
//         // Generate auth token for workspace linking
//         let platform_id = match identifier {
//             UserIdentifier::SlackId(id) => id.clone(),
//             UserIdentifier::DiscordId(id) => id.clone(),
//             UserIdentifier::OpenChatId(id) => id.clone(),
//             _ => return Err("Invalid identifier for workspace linking".to_string()),
//         };
        
//         let auth_token = generate_dashboard_token(platform_id).await;
        
//         return Err(auth_token);
//     }
    
//     Ok(())
// }

/// Check if a specific platform ID has been linked to any principal
pub fn has_platform_id_linked(platform: &str, platform_id: &str) -> bool {
    match platform {
        "slack" => {
            SLACK_USERS.with(|users| {
                let users = users.borrow();
                if let Some(user) = users.get(&StableString::from(platform_id.to_string())) {
                    user.site_principal.is_some()
                } else {
                    false
                }
            })
        }
        "discord" => {
            DISCORD_USERS.with(|users| {
                let users = users.borrow();
                if let Some(user) = users.get(&StableString::from(platform_id.to_string())) {
                    user.site_principal.is_some()
                } else {
                    false
                }
            })
        }
        "openchat" => {
            OPENCHAT_USERS.with(|users| {
                let users = users.borrow();
                if let Some(user) = users.get(&StableString::from(platform_id.to_string())) {
                    user.site_principal.is_some()
                } else {
                    false
                }
            })
        }
        "mainsite" => {
            MAIN_SITE_USERS.with(|users| {
                let users = users.borrow();
                if let Some(user) = users.get(&StableString::from(platform_id.to_string())) {
                    user.site_principal.is_some()
                } else {
                    false
                }
            })
        }
        _ => false,
    }
}
