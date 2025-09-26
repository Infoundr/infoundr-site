use crate::models::stable_principal::StablePrincipal;
use crate::models::user::User;
use crate::models::waitlist::WaitlistEntry;
use crate::models::accelerator::Accelerator;
use crate::models::api_message::ApiMessage;
use crate::models::usage_service::{UsageStats, UserTier, UserSubscription};
use crate::services::slack_service::get_registered_slack_users;
use crate::services::discord_service::get_registered_discord_users;
use crate::services::account_service::{UserIdentifier as AccountUserIdentifier};
use crate::services::api_service::{get_api_message_history, get_api_messages_by_bot, get_recent_api_messages, UserIdentifier as ApiUserIdentifier};
use crate::services::pricing_services::{get_usage_stats, get_user_tier, get_user_subscription, get_user_daily_requests, can_make_request};
use crate::storage::memory::{USERS, WAITLIST, ACCELERATORS, ADMINS, SLACK_USERS, DISCORD_USERS, OPENCHAT_USERS, USER_SUBSCRIPTIONS, USER_DAILY_USAGE};
use candid::Principal;
use ic_cdk::{caller, query, update};
use crate::models::admin::PlaygroundStats;

// Admin callers
#[query]
pub fn is_allowed_principal() -> bool {
    let allowed_principals = vec![
        Principal::from_text("b3sqw-op7sx-26m67-mieei-h5cg4-qagvd-tpwkw-r2up5-dvtna-yp6dt-oqe")
            .unwrap(),
        Principal::from_text("hicyl-bvh4m-2x5wf-ozwt3-4kegq-nx5qh-neq7r-t46dn-e4ygv-kgf2r-6qe")
            .unwrap(),
        Principal::from_text("vgsl4-yf65u-gceur-wws44-arng2-vzjja-ozb5k-vs2cq-3cpay-3y3er-qqe")
            .unwrap(),
        Principal::from_text("kw5dl-qema7-52m2b-gbwaa-7sixr-gcty6-x5237-b4veb-vwabc-bahd3-dqe")
            .unwrap(),
    ];

    let caller_principal = caller();
    ic_cdk::println!("Caller Principal: {}", caller_principal.to_string());
    ic_cdk::println!("Allowed Principals:");
    for principal in &allowed_principals {
        ic_cdk::println!("  {}", principal.to_string());
    }
    let is_allowed = allowed_principals.contains(&caller_principal);
    ic_cdk::println!("Is Allowed: {}", is_allowed);
    is_allowed
}

// Function to get total number of registered users
#[query]
pub fn get_registered_users() -> Result<Vec<User>, String> {
    // Get all registered users without admin check
    let users = USERS.with(|u| {
        u.borrow()
            .iter()
            .map(|(_, user)| user.clone())
            .collect::<Vec<User>>()
    });

    Ok(users)
}

#[query]
pub fn is_admin() -> bool {
    ic_cdk::println!("Checking admin status for: {}", caller().to_string());
    let result = is_allowed_principal();
    ic_cdk::println!("Admin check result: {}", result);
    result
}

#[query]
pub fn get_waitlist() -> Result<Vec<WaitlistEntry>, String> {
    // if !is_allowed_principal() {
    //     return Err("Unauthorized: Caller is not an admin".to_string());
    // }

    let entries = WAITLIST.with(|w| {
        w.borrow()
            .iter()
            .map(|(_, entry)| entry)
            .collect::<Vec<WaitlistEntry>>()
    });

    Ok(entries)
}

#[query]
pub fn get_users() -> Result<Vec<User>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let users = USERS.with(|u| {
        u.borrow()
            .iter()
            .map(|(_, user)| user)
            .collect::<Vec<User>>()
    });

    Ok(users)
}

#[query]
pub fn get_admins() -> Vec<StablePrincipal> {
    // Return hardcoded admins
    vec![
        Principal::from_text("b3sqw-op7sx-26m67-mieei-h5cg4-qagvd-tpwkw-r2up5-dvtna-yp6dt-oqe")
            .unwrap(),
        Principal::from_text("hicyl-bvh4m-2x5wf-ozwt3-4kegq-nx5qh-neq7r-t46dn-e4ygv-kgf2r-6qe")
            .unwrap(),
        Principal::from_text("vgsl4-yf65u-gceur-wws44-arng2-vzjja-ozb5k-vs2cq-3cpay-3y3er-qqe")
            .unwrap(),
    ]
    .into_iter()
    .map(StablePrincipal::from)
    .collect()
}

#[update]
pub fn add_admin(admin_principal: Principal) -> Result<(), String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let stable_principal = StablePrincipal::new(admin_principal);
    
    // Check if admin already exists
    let exists = ADMINS.with(|admins| admins.borrow().contains_key(&stable_principal));
    if exists {
        return Err("Admin already exists".to_string());
    }

    // Create new admin
    let admin = crate::models::admin::Admin {
        principal_id: admin_principal.to_string(),
        created_at: ic_cdk::api::time(),
    };

    // Add new admin
    ADMINS.with(|admins| {
        admins.borrow_mut().insert(stable_principal, admin);
    });

    Ok(())
}

#[update]
pub fn remove_admin(admin_principal: Principal) -> Result<(), String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let stable_principal = StablePrincipal::new(admin_principal);
    
    // Check if admin exists
    let exists = ADMINS.with(|admins| admins.borrow().contains_key(&stable_principal));
    if !exists {
        return Err("Admin not found".to_string());
    }

    // Remove admin
    ADMINS.with(|admins| {
        admins.borrow_mut().remove(&stable_principal);
    });

    Ok(())
}

#[query]
pub fn get_admin_details() -> Vec<(StablePrincipal, crate::models::admin::Admin)> {
    if !is_allowed_principal() {
        return vec![];
    }

    ADMINS.with(|admins| {
        admins.borrow()
            .iter()
            .map(|(principal, admin)| (principal.clone(), admin.clone()))
            .collect()
    })
}

#[query]
pub fn get_all_accelerators() -> Result<Vec<Accelerator>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let accelerators = ACCELERATORS.with(|accs| {
        accs.borrow()
            .iter()
            .map(|(_, accelerator)| accelerator.clone())
            .collect::<Vec<Accelerator>>()
    });

    Ok(accelerators)
}

#[update]
pub fn delete_accelerator(accelerator_id: Principal) -> Result<(), String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let stable_id = StablePrincipal::new(accelerator_id);
    
    // Check if accelerator exists
    let exists = ACCELERATORS.with(|accs| accs.borrow().contains_key(&stable_id));
    if !exists {
        return Err("Accelerator not found".to_string());
    }

    // Delete the accelerator
    ACCELERATORS.with(|accs| accs.borrow_mut().remove(&stable_id));
    Ok(())
}

#[update]
pub fn admin_update_accelerator(accelerator_id: Principal, updates: crate::services::accelerator_service::AcceleratorUpdate) -> Result<(), String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let stable_id = StablePrincipal::new(accelerator_id);
    
    // Get the current accelerator
    let mut accelerator = ACCELERATORS.with(|accs| accs.borrow().get(&stable_id))
        .ok_or("Accelerator not found")?;

    // Apply updates
    if let Some(name) = updates.name {
        accelerator.name = name;
    }
    if let Some(website) = updates.website {
        accelerator.website = website;
    }
    if let Some(email) = updates.email {
        accelerator.email = email;
    }
    if let Some(email_verified) = updates.email_verified {
        accelerator.email_verified = email_verified;
    }
    if let Some(logo) = updates.logo {
        accelerator.logo = logo;
    }
    if let Some(total_startups) = updates.total_startups {
        accelerator.total_startups = total_startups;
    }
    if let Some(invites_sent) = updates.invites_sent {
        accelerator.invites_sent = invites_sent;
    }
    if let Some(active_startups) = updates.active_startups {
        accelerator.active_startups = active_startups;
    }
    if let Some(graduated_startups) = updates.graduated_startups {
        accelerator.graduated_startups = graduated_startups;
    }

    // Save the updated accelerator
    ACCELERATORS.with(|accs| accs.borrow_mut().insert(stable_id, accelerator));
    Ok(())
}

#[query]
pub fn get_accelerator_by_id(accelerator_id: Principal) -> Result<Option<Accelerator>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let stable_id = StablePrincipal::new(accelerator_id);
    let accelerator = ACCELERATORS.with(|accs| accs.borrow().get(&stable_id));
    Ok(accelerator)
}

// Admin functions for platform user management

#[query]
pub fn get_registered_slack_users_admin() -> Result<Vec<crate::models::slack_user::SlackUser>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let users = SLACK_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .map(|(_, user)| user.clone())
            .collect()
    });

    Ok(users)
}

#[query]
pub fn get_registered_discord_users_admin() -> Result<Vec<crate::models::discord_user::DiscordUser>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let users = DISCORD_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .map(|(_, user)| user.clone())
            .collect()
    });

    Ok(users)
}

#[query]
pub fn get_registered_openchat_users_admin() -> Result<Vec<crate::models::openchat_user::OpenChatUser>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let users = OPENCHAT_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .map(|(_, user)| user.clone())
            .collect()
    });

    Ok(users)
}

#[query]
pub fn get_user_activity_admin(identifier: crate::services::account_service::UserIdentifier) -> Result<crate::services::account_service::UserActivity, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let activity = crate::services::account_service::get_user_activity(identifier);
    Ok(activity)
}

#[query]
pub fn admin_get_all_api_messages() -> Result<Vec<ApiMessage>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    
    let mut all_api_messages = Vec::new();
    
    // Get all Slack users and their API messages
    let slack_users = get_registered_slack_users();
    for user in slack_users {
        let messages = get_api_message_history(ApiUserIdentifier::SlackId(user.slack_id));
        all_api_messages.extend(messages);
    }
    
    // Get all Discord users and their API messages
    let discord_users = get_registered_discord_users();
    for user in discord_users {
        let messages = get_api_message_history(ApiUserIdentifier::DiscordId(user.discord_id));
        all_api_messages.extend(messages);
    }
    
    // Sort by timestamp (newest first)
    all_api_messages.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    
    Ok(all_api_messages)
}

#[query]
pub fn admin_get_api_messages_by_bot(bot_name: String) -> Result<Vec<ApiMessage>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    
    let mut all_api_messages = Vec::new();
    
    // Get all Slack users and their API messages for the specified bot
    let slack_users = get_registered_slack_users();
    for user in slack_users {
        let messages = get_api_messages_by_bot(ApiUserIdentifier::SlackId(user.slack_id), bot_name.clone());
        all_api_messages.extend(messages);
    }
    
    // Get all Discord users and their API messages for the specified bot
    let discord_users = get_registered_discord_users();
    for user in discord_users {
        let messages = get_api_messages_by_bot(ApiUserIdentifier::DiscordId(user.discord_id), bot_name.clone());
        all_api_messages.extend(messages);
    }
    
    // Sort by timestamp (newest first)
    all_api_messages.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    
    Ok(all_api_messages)
}

#[query]
pub fn admin_get_recent_api_messages(limit: u32) -> Result<Vec<ApiMessage>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    
    let mut all_api_messages = Vec::new();
    
    // Get all Slack users and their recent API messages
    let slack_users = get_registered_slack_users();
    for user in slack_users {
        let messages = get_recent_api_messages(ApiUserIdentifier::SlackId(user.slack_id), limit);
        all_api_messages.extend(messages);
    }
    
    // Get all Discord users and their recent API messages
    let discord_users = get_registered_discord_users();
    for user in discord_users {
        let messages = get_recent_api_messages(ApiUserIdentifier::DiscordId(user.discord_id), limit);
        all_api_messages.extend(messages);
    }
    
    // Sort by timestamp (newest first)
    all_api_messages.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    
    // Apply global limit
    all_api_messages.truncate(limit as usize);
    
    Ok(all_api_messages)
}

#[query]
pub fn admin_get_api_messages_for_user(identifier: AccountUserIdentifier) -> Result<Vec<ApiMessage>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    
    // Convert AccountUserIdentifier to ApiUserIdentifier
    let api_identifier = match identifier {
        AccountUserIdentifier::Principal(principal) => ApiUserIdentifier::Principal(principal),
        AccountUserIdentifier::OpenChatId(openchat_id) => ApiUserIdentifier::OpenChatId(openchat_id),
        AccountUserIdentifier::SlackId(slack_id) => ApiUserIdentifier::SlackId(slack_id),
        AccountUserIdentifier::DiscordId(discord_id) => ApiUserIdentifier::DiscordId(discord_id),
        AccountUserIdentifier::PlaygroundId(playground_id) => ApiUserIdentifier::PlaygroundId(playground_id),
    };
    
    let messages = get_api_message_history(api_identifier);
    Ok(messages)
}

#[query]
pub fn admin_get_api_messages_for_user_by_bot(identifier: AccountUserIdentifier, bot_name: String) -> Result<Vec<ApiMessage>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    
    // Convert AccountUserIdentifier to ApiUserIdentifier
    let api_identifier = match identifier {
        AccountUserIdentifier::Principal(principal) => ApiUserIdentifier::Principal(principal),
        AccountUserIdentifier::OpenChatId(openchat_id) => ApiUserIdentifier::OpenChatId(openchat_id),
        AccountUserIdentifier::SlackId(slack_id) => ApiUserIdentifier::SlackId(slack_id),
        AccountUserIdentifier::DiscordId(discord_id) => ApiUserIdentifier::DiscordId(discord_id),
        AccountUserIdentifier::PlaygroundId(playground_id) => ApiUserIdentifier::PlaygroundId(playground_id),
    };
    
    let messages = get_api_messages_by_bot(api_identifier, bot_name);
    Ok(messages)
}

#[query]
pub fn admin_get_recent_api_messages_for_user(identifier: AccountUserIdentifier, limit: u32) -> Result<Vec<ApiMessage>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    
    // Convert AccountUserIdentifier to ApiUserIdentifier
    let api_identifier = match identifier {
        AccountUserIdentifier::Principal(principal) => ApiUserIdentifier::Principal(principal),
        AccountUserIdentifier::OpenChatId(openchat_id) => ApiUserIdentifier::OpenChatId(openchat_id),
        AccountUserIdentifier::SlackId(slack_id) => ApiUserIdentifier::SlackId(slack_id),
        AccountUserIdentifier::DiscordId(discord_id) => ApiUserIdentifier::DiscordId(discord_id),
        AccountUserIdentifier::PlaygroundId(playground_id) => ApiUserIdentifier::PlaygroundId(playground_id),
    };
    
    let messages = get_recent_api_messages(api_identifier, limit);
    Ok(messages)
}

// ================================
// USER USAGE & REQUEST MONITORING
// ================================

/// Get usage statistics for all users with subscriptions
#[query]
pub fn admin_get_all_user_usage_stats() -> Result<Vec<UsageStats>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let mut all_usage_stats = Vec::new();
    
    // Get all users with subscriptions
    USER_SUBSCRIPTIONS.with(|subs| {
        for (user_id_key, _) in subs.borrow().iter() {
            let user_id = user_id_key.to_string();
            let usage_stats = get_usage_stats(&user_id);
            all_usage_stats.push(usage_stats);
        }
    });

    // Sort by requests used (highest first)
    all_usage_stats.sort_by(|a, b| b.requests_used.cmp(&a.requests_used));
    
    Ok(all_usage_stats)
}

// Playground-specific admin functions

// Get all playground users and their activity
#[query]
pub fn admin_get_playground_users() -> Result<Vec<String>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    // Get all playground user IDs from API messages
    let playground_users = crate::storage::memory::API_MESSAGES.with(|messages| {
        let messages = messages.borrow();
        let mut playground_user_ids = std::collections::HashSet::new();
        
        for (_, api_message) in messages.iter() {
            // Check if this is a playground user (user_id starts with "playground_")
            if api_message.user_id.starts_with("playground_") {
                playground_user_ids.insert(api_message.user_id.clone());
            }
        }
        
        playground_user_ids.into_iter().collect::<Vec<String>>()
    });

    Ok(playground_users)
}

/// Get usage statistics for a specific user
#[query]
pub fn admin_get_user_usage_stats(user_id: String) -> Result<UsageStats, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let usage_stats = get_usage_stats(&user_id);
    Ok(usage_stats)
}

// Get all playground API messages
#[query]
pub fn admin_get_playground_messages() -> Result<Vec<ApiMessage>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    // Get all API messages from playground users
    let playground_messages = crate::storage::memory::API_MESSAGES.with(|messages| {
        let messages = messages.borrow();
        messages
            .iter()
            .filter(|(_, api_message)| api_message.user_id.starts_with("playground_"))
            .map(|(_, message)| message.clone())
            .collect::<Vec<ApiMessage>>()
    });

    Ok(playground_messages)
}

/// Get subscription details for all users
#[query]
pub fn admin_get_all_user_subscriptions() -> Result<Vec<(String, UserSubscription)>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let mut subscriptions = Vec::new();
    
    USER_SUBSCRIPTIONS.with(|subs| {
        for (user_id_key, subscription) in subs.borrow().iter() {
            let user_id = user_id_key.to_string();
            subscriptions.push((user_id, subscription.clone()));
        }
    });

    // Sort by tier (Pro first), then by user_id
    subscriptions.sort_by(|a, b| {
        match (&a.1.tier, &b.1.tier) {
            (UserTier::Pro, UserTier::Free) => std::cmp::Ordering::Less,
            (UserTier::Free, UserTier::Pro) => std::cmp::Ordering::Greater,
            _ => a.0.cmp(&b.0),
        }
    });
    
    Ok(subscriptions)
}

/// Get subscription details for a specific user
#[query]
pub fn admin_get_user_subscription(user_id: String) -> Result<Option<UserSubscription>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let subscription = get_user_subscription(&user_id);
    Ok(subscription)
}

// Get playground messages by bot
#[query]
pub fn admin_get_playground_messages_by_bot(bot_name: String) -> Result<Vec<ApiMessage>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    // Get all API messages from playground users for a specific bot
    let playground_messages = crate::storage::memory::API_MESSAGES.with(|messages| {
        let messages = messages.borrow();
        messages
            .iter()
            .filter(|(_, api_message)| 
                api_message.user_id.starts_with("playground_") && 
                api_message.bot_name == bot_name
            )
            .map(|(_, message)| message.clone())
            .collect::<Vec<ApiMessage>>()
    });

    Ok(playground_messages)
}

/// Get daily usage summary - users who have made requests today
#[query]
pub fn admin_get_daily_usage_summary() -> Result<Vec<(String, u32, UserTier)>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let mut daily_usage = Vec::new();
    
    // Get all users with daily usage data
    USER_DAILY_USAGE.with(|usage| {
        for ((user_id_key, _), requests_count) in usage.borrow().iter() {
            let user_id = user_id_key.to_string();
            let tier = get_user_tier(&user_id);
            daily_usage.push((user_id, requests_count, tier));
        }
    });

    // Sort by requests made (highest first)
    daily_usage.sort_by(|a, b| b.1.cmp(&a.1));
    
    Ok(daily_usage)
}

/// Get users who have reached their daily limit
#[query]
pub fn admin_get_users_at_limit() -> Result<Vec<(String, u32, UserTier)>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let mut users_at_limit = Vec::new();
    
    // First, collect all user data without calling functions that might cause borrow conflicts
    let daily_usage_data: Vec<(String, u32)> = USER_DAILY_USAGE.with(|usage| {
        usage.borrow()
            .iter()
            .map(|((user_id_key, _), requests_count)| (user_id_key.to_string(), requests_count))
            .collect()
    });
    
    // Then process each user
    for (user_id, requests_count) in daily_usage_data {
        let tier = get_user_tier(&user_id);
        
        // Only check Free tier users (Pro users have unlimited)
        if matches!(tier, UserTier::Free) {
            // Check if user can make more requests without causing borrow conflicts
            let daily_limit = match tier {
                UserTier::Free => Some(20), // FREE_DAILY_LIMIT
                UserTier::Pro => None,
            };
            
            let can_make_more = match daily_limit {
                None => true, // Pro users have unlimited
                Some(limit) => requests_count < limit,
            };
            
            if !can_make_more {
                users_at_limit.push((user_id, requests_count, tier));
            }
        }
    }

    // Sort by requests made (highest first)
    users_at_limit.sort_by(|a, b| b.1.cmp(&a.1));
    
    Ok(users_at_limit)
}

// Get recent playground messages
#[query]
pub fn admin_get_recent_playground_messages(limit: u32) -> Result<Vec<ApiMessage>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    // Get recent API messages from playground users
    let mut playground_messages = crate::storage::memory::API_MESSAGES.with(|messages| {
        let messages = messages.borrow();
        messages
            .iter()
            .filter(|(_, api_message)| api_message.user_id.starts_with("playground_"))
            .map(|(_, message)| message.clone())
            .collect::<Vec<ApiMessage>>()
    });

    // Sort by timestamp (newest first) and limit
    playground_messages.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    playground_messages.truncate(limit as usize);

    Ok(playground_messages)
}

/// Get usage statistics grouped by tier
#[query]
pub fn admin_get_usage_by_tier() -> Result<Vec<(UserTier, u32, u32)>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let mut free_users = 0;
    let mut pro_users = 0;
    let mut free_requests = 0;
    let mut pro_requests = 0;
    
    // Count users and requests by tier
    USER_SUBSCRIPTIONS.with(|subs| {
        for (user_id_key, subscription) in subs.borrow().iter() {
            let user_id = user_id_key.to_string();
            let requests_made = get_user_daily_requests(&user_id);
            
            match subscription.tier {
                UserTier::Free => {
                    free_users += 1;
                    free_requests += requests_made;
                },
                UserTier::Pro => {
                    pro_users += 1;
                    pro_requests += requests_made;
                },
            }
        }
    });

    let mut result = Vec::new();
    result.push((UserTier::Free, free_users, free_requests));
    result.push((UserTier::Pro, pro_users, pro_requests));
    
    Ok(result)
}

/// Get total users across all platforms (Discord, Slack, Playground)
#[query]
pub fn admin_get_total_users_count() -> Result<u32, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let mut total_users = 0;
    
    // Count Discord users
    total_users += DISCORD_USERS.with(|users| users.borrow().len()) as u32;
    
    // Count Slack users
    total_users += SLACK_USERS.with(|users| users.borrow().len()) as u32;
    
    // Count Playground users (from API messages)
    let playground_users = crate::storage::memory::API_MESSAGES.with(|messages| {
        let messages = messages.borrow();
        let mut playground_user_ids = std::collections::HashSet::new();
        
        for (_, api_message) in messages.iter() {
            if api_message.user_id.starts_with("playground_") {
                playground_user_ids.insert(api_message.user_id.clone());
            }
        }
        
        playground_user_ids.len() as u32
    });
    total_users += playground_users;
    
    Ok(total_users)
}

/// Get top users by request count (today) - includes all users who made requests
#[query]
pub fn admin_get_top_users_by_requests(limit: u32) -> Result<Vec<(String, u32, UserTier)>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    // First, collect all user data without calling functions that might cause borrow conflicts
    let daily_usage_data: Vec<(String, u32)> = USER_DAILY_USAGE.with(|usage| {
        usage.borrow()
            .iter()
            .map(|((user_id_key, _), requests_count)| (user_id_key.to_string(), requests_count))
            .collect()
    });
    
    let mut all_users = Vec::new();
    
    // Then process each user
    for (user_id, requests_count) in daily_usage_data {
        let tier = get_user_tier(&user_id);
        all_users.push((user_id, requests_count, tier));
    }

    // Sort by requests made (highest first)
    all_users.sort_by(|a, b| b.1.cmp(&a.1));
    
    // Take only the requested limit
    all_users.truncate(limit as usize);
    
    Ok(all_users)
}

/// Admin function to manually upgrade a user's tier
#[update]
pub fn admin_upgrade_user_tier(user_id: String, tier: UserTier, expires_at_ns: Option<u64>) -> Result<(), String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    // Use the existing upgrade function from pricing_services
    crate::services::pricing_services::upgrade_user_tier(&user_id, tier, expires_at_ns)
}

/// Get comprehensive user activity report
#[query]
pub fn admin_get_user_activity_report(user_id: String) -> Result<UserActivityReport, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let usage_stats = get_usage_stats(&user_id);
    let subscription = get_user_subscription(&user_id);
    let can_make_more_requests = can_make_request(&user_id);
    
    // Get API message count for this user
    let api_messages = get_api_message_history(ApiUserIdentifier::Principal(
        Principal::from_text(&user_id).unwrap_or_else(|_| Principal::anonymous())
    ));
    
    let report = UserActivityReport {
        user_id: user_id.clone(),
        usage_stats,
        subscription,
        can_make_more_requests,
        total_api_messages: api_messages.len() as u32,
        last_activity: api_messages.first().map(|msg| msg.timestamp).unwrap_or(0),
    };
    
    Ok(report)
}

/// Comprehensive user activity report structure
#[derive(candid::CandidType, serde::Deserialize, Clone, Debug)]
pub struct UserActivityReport {
    pub user_id: String,
    pub usage_stats: UsageStats,
    pub subscription: Option<UserSubscription>,
    pub can_make_more_requests: bool,
    pub total_api_messages: u32,
    pub last_activity: u64,
}

// Get playground activity for a specific user
#[query]
pub fn admin_get_playground_user_activity(playground_id: String) -> Result<crate::services::account_service::UserActivity, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let identifier = AccountUserIdentifier::PlaygroundId(playground_id);
    let activity = crate::services::account_service::get_user_activity(identifier);
    Ok(activity)
}

// Get playground statistics
#[query]
pub fn admin_get_playground_stats() -> Result<PlaygroundStats, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let stats = crate::storage::memory::API_MESSAGES.with(|messages| {
        let messages = messages.borrow();
        let mut total_messages = 0;
        let mut unique_users = std::collections::HashSet::new();
        let mut bot_usage = std::collections::HashMap::new();
        
        for (_, api_message) in messages.iter() {
            if api_message.user_id.starts_with("playground_") {
                total_messages += 1;
                unique_users.insert(api_message.user_id.clone());
                
                // Count bot usage
                let count = bot_usage.entry(api_message.bot_name.clone()).or_insert(0);
                *count += 1;
            }
        }

        PlaygroundStats {
            total_messages,
            unique_users: unique_users.len() as u32,
            bot_usage,
        }
    });

    Ok(stats)
}