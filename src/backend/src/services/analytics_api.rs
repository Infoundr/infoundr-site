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
pub fn get_user_analytics_summary(user_id: String, days: u32) -> Result<AnalyticsSummary, String> {
    // Get the caller's principal and convert to string for comparison
    let caller_principal = caller();
    let caller_user_id = caller_principal.to_string();
    
    // Ensure user can only access their own analytics
    if caller_user_id != user_id {
        return Err("Unauthorized: You can only access your own analytics data".to_string());
    }
    
    analytics_get_summary(&user_id, days)
}

/// Get detailed analytics for a user
#[ic_cdk::query]
pub fn get_user_analytics(user_id: String, days: u32) -> Result<UserAnalytics, String> {
    // Get the caller's principal and convert to string for comparison
    let caller_principal = caller();
    let caller_user_id = caller_principal.to_string();
    
    // Ensure user can only access their own analytics
    if caller_user_id != user_id {
        return Err("Unauthorized: You can only access your own analytics data".to_string());
    }
    
    analytics_get_user_data(&user_id, days)
}

/// Update analytics data for a user (call this when user makes requests)
#[ic_cdk::update]
pub fn update_user_analytics(user_id: String) -> Result<(), String> {
    // Get the caller's principal and convert to string for comparison
    let caller_principal = caller();
    let caller_user_id = caller_principal.to_string();
    
    // Ensure user can only update their own analytics
    if caller_user_id != user_id {
        return Err("Unauthorized: You can only update your own analytics data".to_string());
    }
    
    analytics_update_user(&user_id)
}

/// Record analytics data for a user
#[ic_cdk::update]
pub fn record_analytics_data(
    user_id: String,
    requests_made: u32,
    lines_of_code_edited: u32,
    ai_interactions: u32,
    tasks_completed: u32,
) -> Result<(), String> {
    // Get the caller's principal and convert to string for comparison
    let caller_principal = caller();
    let caller_user_id = caller_principal.to_string();
    
    // Ensure user can only record their own analytics
    if caller_user_id != user_id {
        return Err("Unauthorized: You can only record your own analytics data".to_string());
    }
    
    analytics_record_data(
        &user_id,
        requests_made,
        lines_of_code_edited,
        ai_interactions,
        tasks_completed,
    )
}
