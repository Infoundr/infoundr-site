use ic_cdk::api::time;
use chrono::{DateTime, Utc, TimeZone};

use crate::models::analytics::{
    AnalyticsDataPoint, UserAnalytics, AnalyticsChartData, ChartDataset, AnalyticsSummary
};
use crate::models::stable_string::StableString;
use crate::models::chat::MessageRole;
use crate::storage::memory::{USER_ANALYTICS, USER_DAILY_USAGE, CHAT_HISTORY, TASKS};

const NANOS_PER_DAY: u64 = 86_400 * 1_000_000_000;

/// Get current day bucket timestamp
fn get_current_day_timestamp() -> u64 {
    time() / NANOS_PER_DAY
}

/// Convert timestamp to date string (YYYY-MM-DD)
fn timestamp_to_date_string(timestamp_ns: u64) -> String {
    let secs = timestamp_ns / 1_000_000_000;
    let dt: DateTime<Utc> = Utc.timestamp_opt(secs as i64, 0).unwrap();
    dt.format("%Y-%m-%d").to_string()
}

/// Get date string for a day bucket
fn day_bucket_to_date_string(day_bucket: u64) -> String {
    let timestamp_ns = day_bucket * NANOS_PER_DAY;
    timestamp_to_date_string(timestamp_ns)
}

/// Record analytics data for a user
pub fn record_analytics_data(
    user_id: &str,
    requests_made: u32,
    lines_of_code_edited: u32,
    ai_interactions: u32,
    tasks_completed: u32,
) -> Result<(), String> {
    let now = time();
    let day_bucket = get_current_day_timestamp();
    let date = day_bucket_to_date_string(day_bucket);
    
    let data_point = AnalyticsDataPoint {
        date: date.clone(),
        requests_made,
        lines_of_code_edited,
        ai_interactions,
        tasks_completed,
        timestamp_ns: now,
    };

    USER_ANALYTICS.with(|analytics| {
        let mut map = analytics.borrow_mut();
        let key = (StableString::from(user_id.to_string()), day_bucket);
        map.insert(key, data_point);
    });

    Ok(())
}

/// Get user analytics for a specific period
pub fn get_user_analytics(
    user_id: &str,
    days: u32,
) -> Result<UserAnalytics, String> {
    let current_day = get_current_day_timestamp();
    let start_day = current_day.saturating_sub(days as u64);
    
    let mut daily_data = Vec::new();
    let mut total_requests = 0;
    let mut total_lines_edited = 0;
    let mut total_ai_interactions = 0;
    let mut total_tasks_completed = 0;

    // Get analytics data for the period
    USER_ANALYTICS.with(|analytics| {
        let map = analytics.borrow();
        for day in start_day..=current_day {
            let key = (StableString::from(user_id.to_string()), day);
            if let Some(data_point) = map.get(&key) {
                total_requests += data_point.requests_made;
                total_lines_edited += data_point.lines_of_code_edited;
                total_ai_interactions += data_point.ai_interactions;
                total_tasks_completed += data_point.tasks_completed;
                daily_data.push(data_point);
            }
        }
    });

    // Sort by date
    daily_data.sort_by(|a, b| a.date.cmp(&b.date));

    let period_start = day_bucket_to_date_string(start_day);
    let period_end = day_bucket_to_date_string(current_day);

    Ok(UserAnalytics {
        user_id: user_id.to_string(),
        total_requests,
        total_lines_edited,
        total_ai_interactions,
        total_tasks_completed,
        daily_data,
        period_start,
        period_end,
    })
}

/// Get analytics summary for dashboard
pub fn get_analytics_summary(user_id: &str, days: u32) -> Result<AnalyticsSummary, String> {
    let analytics = get_user_analytics(user_id, days)?;
    
    // Generate chart data based on period
    let (labels, requests_data) = match days {
        1 => {
            // 1 day - show today's data only (most recent day)
            if let Some(latest_day) = analytics.daily_data.last() {
                (vec![latest_day.date.clone()], vec![latest_day.requests_made])
            } else {
                (vec!["Today".to_string()], vec![0])
            }
        },
        7 => {
            // 7 days - daily data
            let labels: Vec<String> = analytics.daily_data.iter()
                .map(|d| d.date.clone())
                .collect();
            let requests_data: Vec<u32> = analytics.daily_data.iter()
                .map(|d| d.requests_made)
                .collect();
            (labels, requests_data)
        },
        30 => {
            // 30 days - weekly data (group daily data into weeks)
            let mut weekly_data: std::collections::HashMap<String, u32> = std::collections::HashMap::new();
            let mut week_labels = Vec::new();
            
            // Group data into weeks
            for (index, data_point) in analytics.daily_data.iter().enumerate() {
                let week_num = (index / 7) + 1;
                let week_label = format!("Week {}", week_num);
                *weekly_data.entry(week_label.clone()).or_insert(0) += data_point.requests_made;
                if !week_labels.contains(&week_label) {
                    week_labels.push(week_label);
                }
            }
            
            let labels = week_labels;
            let requests_data: Vec<u32> = labels.iter()
                .map(|label| weekly_data.get(label).copied().unwrap_or(0))
                .collect();
            (labels, requests_data)
        },
        _ => {
            // Default to daily data
            let labels: Vec<String> = analytics.daily_data.iter()
                .map(|d| d.date.clone())
                .collect();
            let requests_data: Vec<u32> = analytics.daily_data.iter()
                .map(|d| d.requests_made)
                .collect();
            (labels, requests_data)
        }
    };

    let datasets = vec![
        ChartDataset {
            label: "Requests Made".to_string(),
            data: requests_data,
            border_color: "#3B82F6".to_string(), // Blue
            background_color: "rgba(59, 130, 246, 0.1)".to_string(),
        },
    ];

    let chart_data = AnalyticsChartData {
        labels,
        datasets,
    };

    Ok(AnalyticsSummary {
        requests_made: analytics.total_requests,
        lines_of_agent_edits: analytics.total_lines_edited,
        ai_interactions: analytics.total_ai_interactions,
        tasks_completed: analytics.total_tasks_completed,
        chart_data,
    })
}

/// Calculate lines of code edited from chat history
pub fn calculate_lines_from_chat_history(_user_id: &str, days: u32) -> u32 {
    let current_day = get_current_day_timestamp();
    let start_day = current_day.saturating_sub(days as u64);
    let start_timestamp = start_day * NANOS_PER_DAY;
    
    let mut total_lines = 0;
    
    CHAT_HISTORY.with(|history| {
        let map = history.borrow();
        for (_, message) in map.iter() {
            // Check if message is from the user and within the time range
            if matches!(message.role, MessageRole::User) && message.timestamp >= start_timestamp {
                // Simple heuristic: count lines in the content
                // This is a basic implementation - you might want to improve this
                let lines = message.content.split('\n').count() as u32;
                total_lines += lines;
            }
        }
    });
    
    total_lines
}

/// Calculate AI interactions from chat history
pub fn calculate_ai_interactions(_user_id: &str, days: u32) -> u32 {
    let current_day = get_current_day_timestamp();
    let start_day = current_day.saturating_sub(days as u64);
    let start_timestamp = start_day * NANOS_PER_DAY;
    
    let mut interactions = 0;
    
    CHAT_HISTORY.with(|history| {
        let map = history.borrow();
        for (_, message) in map.iter() {
            // Count all messages within the time range as AI interactions
            if message.timestamp >= start_timestamp {
                interactions += 1;
            }
        }
    });
    
    interactions
}

/// Calculate completed tasks
pub fn calculate_completed_tasks(_user_id: &str, days: u32) -> u32 {
    let current_day = get_current_day_timestamp();
    let start_day = current_day.saturating_sub(days as u64);
    let start_timestamp = start_day * NANOS_PER_DAY;
    
    let mut completed = 0;
    
    TASKS.with(|tasks| {
        let map = tasks.borrow();
        for (_, task) in map.iter() {
            if task.status == "completed" 
                && task.created_at >= start_timestamp {
                completed += 1;
            }
        }
    });
    
    completed
}

/// Get daily usage count for a user
pub fn get_daily_usage_count(user_id: &str, days: u32) -> u32 {
    let current_day = get_current_day_timestamp();
    let start_day = current_day.saturating_sub(days as u64);
    
    let mut total_requests = 0;
    
    USER_DAILY_USAGE.with(|usage| {
        let map = usage.borrow();
        for day in start_day..=current_day {
            let key = (StableString::from(user_id.to_string()), day);
            if let Some(count) = map.get(&key) {
                total_requests += count;
            }
        }
    });
    
    total_requests
}

/// Update analytics data for a user (call this when user makes requests)
pub fn update_user_analytics(user_id: &str) -> Result<(), String> {
    let days = 7; // Get last 7 days of data
    let requests_made = get_daily_usage_count(user_id, days);
    let lines_of_code_edited = calculate_lines_from_chat_history(user_id, days);
    let ai_interactions = calculate_ai_interactions(user_id, days);
    let tasks_completed = calculate_completed_tasks(user_id, days);
    
    record_analytics_data(
        user_id,
        requests_made,
        lines_of_code_edited,
        ai_interactions,
        tasks_completed,
    )
}

