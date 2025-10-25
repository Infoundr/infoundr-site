use crate::models::analytics::{AnalyticsSummary, UserAnalytics};
use ic_cdk::caller;
use candid::Principal;
use crate::services::analytics_service::{
    get_analytics_summary as analytics_get_summary,
    get_user_analytics as analytics_get_user_data,
    update_user_analytics as analytics_update_user,
    record_analytics_data as analytics_record_data
};
use crate::storage::memory::{OPENCHAT_USERS, SLACK_USERS, DISCORD_USERS};

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
}

/// Get analytics summary for a user
#[ic_cdk::query]
pub fn get_user_analytics_summary(days: u32) -> Result<AnalyticsSummary, String> {
    let caller_principal = caller();

    ic_cdk::println!("Getting analytics summary for principal: {:?}", caller_principal.to_string());
    
    // Get the platform user ID for this principal
    let platform_user_id = get_platform_user_id_for_principal(caller_principal)
        .ok_or_else(|| "User not linked to any platform account".to_string())?;
    ic_cdk::println!("Platform user ID: {:?}", platform_user_id);
    
    analytics_get_summary(&platform_user_id, days)
}

/// Get detailed analytics for a user
#[ic_cdk::query]
pub fn get_user_analytics(days: u32) -> Result<UserAnalytics, String> {
    let caller_principal = caller();

    ic_cdk::println!("Getting analytics summary for principal: {:?}", caller_principal.to_string());
    
    // Get the platform user ID for this principal
    let platform_user_id = get_platform_user_id_for_principal(caller_principal)
        .ok_or_else(|| "User not linked to any platform account".to_string())?;

    ic_cdk::println!("Platform user ID: {:?}", platform_user_id);
    
    analytics_get_user_data(&platform_user_id, days)
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
