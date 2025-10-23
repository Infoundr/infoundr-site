use crate::models::analytics::{AnalyticsSummary, UserAnalytics};
use ic_cdk::caller;
use crate::services::analytics_service::{
    get_analytics_summary as analytics_get_summary,
    get_user_analytics as analytics_get_user_data,
    update_user_analytics as analytics_update_user,
    record_analytics_data as analytics_record_data
};

// ============================
// ANALYTICS API ENDPOINTS
// ============================

/// Get analytics summary for a user
#[ic_cdk::query]
pub fn get_user_analytics_summary(days: u32) -> Result<AnalyticsSummary, String> {
    // Get the caller's principal and convert to string for comparison
    let caller_principal = caller();
    let caller_user_id = caller_principal.to_string();

    let actual_user_id = caller_user_id;
    
    analytics_get_summary(&actual_user_id, days)
}

/// Get detailed analytics for a user
#[ic_cdk::query]
pub fn get_user_analytics(days: u32) -> Result<UserAnalytics, String> {
    // Get the caller's principal and convert to string for comparison
    let caller_principal = caller();
    let caller_user_id = caller_principal.to_string();
    
    // Use the caller's principal directly to ensure we're using the authenticated user's data
    let actual_user_id = caller_user_id;
    
    analytics_get_user_data(&actual_user_id, days)
}

/// Update analytics data for a user (call this when user makes requests)
#[ic_cdk::update]
pub fn update_user_analytics() -> Result<(), String> {
    // Get the caller's principal and convert to string for comparison
    let caller_principal = caller();
    let caller_user_id = caller_principal.to_string();
    
    // Use the caller's principal directly to ensure we're using the authenticated user's data
    let actual_user_id = caller_user_id;
    
    analytics_update_user(&actual_user_id)
}

/// Record analytics data for a user
#[ic_cdk::update]
pub fn record_analytics_data(
    requests_made: u32,
    lines_of_code_edited: u32,
    ai_interactions: u32,
    tasks_completed: u32,
) -> Result<(), String> {
    // Get the caller's principal and convert to string for comparison
    let caller_principal = caller();
    let caller_user_id = caller_principal.to_string();
    
    // Use the caller's principal directly to ensure we're using the authenticated user's data
    let actual_user_id = caller_user_id;
    
    analytics_record_data(
        &actual_user_id,
        requests_made,
        lines_of_code_edited,
        ai_interactions,
        tasks_completed,
    )
}
