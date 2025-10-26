use crate::models::analytics::{AnalyticsSummary, UserAnalytics};
use crate::models::api_message::ApiMessage;
use ic_cdk::caller;
use candid::Principal;
use crate::services::analytics_service::{
    update_user_analytics as analytics_update_user,
    record_analytics_data as analytics_record_data
};
use crate::services::api_service::{get_recent_api_messages, get_api_messages_by_bot, UserIdentifier};
use crate::storage::memory::{OPENCHAT_USERS, SLACK_USERS, DISCORD_USERS, MAIN_SITE_USERS};

// ============================
// Wrapper functions for analytics service
// ============================

/// Wrapper for combined analytics summary
pub fn analytics_get_combined_summary(
    principal_id: &str,
    platform_user_id: Option<&str>,
    days: u32,
) -> Result<AnalyticsSummary, String> {
    crate::services::analytics_service::get_combined_analytics_summary(principal_id, platform_user_id, days)
}

/// Wrapper for combined user analytics
pub fn analytics_get_combined_user_data(
    principal_id: &str,
    platform_user_id: Option<&str>,
    days: u32,
) -> Result<UserAnalytics, String> {
    crate::services::analytics_service::get_combined_user_analytics(principal_id, platform_user_id, days)
}

// ============================
// ANALYTICS API ENDPOINTS
// ============================

/// Get the platform user ID for a given principal
/// This is needed because analytics are stored by platform user ID (e.g., "User124")
/// but retrieved by principal ID (e.g., "rdmx6-jaaaa-aaaaa-aaadq-cai")
fn get_platform_user_id_for_principal(principal: Principal) -> Option<String> {
    ic_cdk::println!("Getting platform user ID for principal: {:?}", principal);
    // Check OpenChat users
    OPENCHAT_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(principal))
            .map(|(_, user)| user.openchat_id.clone())
    })
    .or_else(|| {
        // Check Slack users
        SLACK_USERS.with(|users| {
            users
                .borrow()
                .iter()
                .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(principal))
                .map(|(_, user)| user.slack_id.clone())
        })
    })
    .or_else(|| {
        // Check Discord users
        DISCORD_USERS.with(|users| {
            users
                .borrow()
                .iter()
                .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(principal))
                .map(|(_, user)| user.discord_id.clone())
        })
    })
    .or_else(|| {
        // Check MainSite users
        MAIN_SITE_USERS.with(|users| {
            users
                .borrow()
                .iter()
                .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(principal))
                .map(|(_, user)| user.main_site_id.clone())
        })
    })
}

/// Get analytics summary for a user
#[ic_cdk::query]
pub fn get_user_analytics_summary(days: u32) -> Result<AnalyticsSummary, String> {
    let caller_principal = caller();
    let principal_id = caller_principal.to_string();

    ic_cdk::println!("Getting analytics summary for principal: {:?}", principal_id);
    
    // Get the platform user ID for this principal (if exists)
    let platform_user_id = get_platform_user_id_for_principal(caller_principal);
    ic_cdk::println!("Platform user ID: {:?}", platform_user_id);
    
    // Use combined analytics that includes both principal-based and platform-specific activity
    analytics_get_combined_summary(&principal_id, platform_user_id.as_deref(), days)
}

/// Get detailed analytics for a user
#[ic_cdk::query]
pub fn get_user_analytics(days: u32) -> Result<UserAnalytics, String> {
    let caller_principal = caller();
    let principal_id = caller_principal.to_string();

    ic_cdk::println!("Getting detailed analytics for principal: {:?}", principal_id);
    
    // Get the platform user ID for this principal (if exists)
    let platform_user_id = get_platform_user_id_for_principal(caller_principal);
    ic_cdk::println!("Platform user ID: {:?}", platform_user_id);
    
    // Use combined analytics that includes both principal-based and platform-specific activity
    analytics_get_combined_user_data(&principal_id, platform_user_id.as_deref(), days)
}

/// Update analytics data for a user (call this when user makes requests)
#[ic_cdk::update]
pub fn update_user_analytics() -> Result<(), String> {
    let caller_principal = caller();
    
    // Get the platform user ID for this principal
    let platform_user_id = get_platform_user_id_for_principal(caller_principal)
        .ok_or_else(|| "User not linked to any platform account".to_string())?;
    
    analytics_update_user(&platform_user_id)
}

/// Record analytics data for a user
#[ic_cdk::update]
pub fn record_analytics_data(
    requests_made: u32,
    lines_of_code_edited: u32,
    ai_interactions: u32,
    tasks_completed: u32,
) -> Result<(), String> {
    let caller_principal = caller();
    
    // Get the platform user ID for this principal
    let platform_user_id = get_platform_user_id_for_principal(caller_principal)
        .ok_or_else(|| "User not linked to any platform account".to_string())?;
    
    analytics_record_data(
        &platform_user_id,
        requests_made,
        lines_of_code_edited,
        ai_interactions,
        tasks_completed,
    )
}

/// Get recent messages for the current user
#[ic_cdk::query]
pub fn get_user_recent_messages(limit: u32) -> Result<Vec<ApiMessage>, String> {
    let caller_principal = caller();
    
    // Get the platform user ID for this principal
    let platform_user_id = get_platform_user_id_for_principal(caller_principal)
        .ok_or_else(|| "User not linked to any platform account".to_string())?;
    
    // We need to determine which platform this user belongs to
    let user_identifier = if OPENCHAT_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| user.openchat_id == platform_user_id)
    }) {
        UserIdentifier::OpenChatId(platform_user_id)
    } else if SLACK_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| user.slack_id == platform_user_id)
    }) {
        UserIdentifier::SlackId(platform_user_id)
    } else if DISCORD_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| user.discord_id == platform_user_id)
    }) {
        UserIdentifier::DiscordId(platform_user_id)
    } else if MAIN_SITE_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| user.main_site_id == platform_user_id)
    }) {
        UserIdentifier::MainSiteId(platform_user_id)
    } else {
        return Err("User not found in any platform".to_string());
    };
    
    // Get recent messages for this user
    let messages = get_recent_api_messages(user_identifier, limit);
    Ok(messages)
}

/// Get messages for the current user by bot
#[ic_cdk::query]
pub fn get_user_messages_by_bot(bot_name: String) -> Result<Vec<ApiMessage>, String> {
    let caller_principal = caller();
    
    // Get the platform user ID for this principal
    let platform_user_id = get_platform_user_id_for_principal(caller_principal)
        .ok_or_else(|| "User not linked to any platform account".to_string())?;
    
    // We need to determine which platform this user belongs to
    let user_identifier = if OPENCHAT_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| user.openchat_id == platform_user_id)
    }) {
        UserIdentifier::OpenChatId(platform_user_id)
    } else if SLACK_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| user.slack_id == platform_user_id)
    }) {
        UserIdentifier::SlackId(platform_user_id)
    } else if DISCORD_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| user.discord_id == platform_user_id)
    }) {
        UserIdentifier::DiscordId(platform_user_id)
    } else if MAIN_SITE_USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| user.main_site_id == platform_user_id)
    }) {
        UserIdentifier::MainSiteId(platform_user_id)
    } else {
        return Err("User not found in any platform".to_string());
    };
    
    // Get messages for this user by bot
    let messages = get_api_messages_by_bot(user_identifier, bot_name);
    Ok(messages)
}