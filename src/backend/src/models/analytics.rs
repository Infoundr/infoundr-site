use candid::CandidType;
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use ic_stable_structures::storable::{Storable, BoundedStorable};

/// Analytics data point for a specific day
#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
pub struct AnalyticsDataPoint {
    pub date: String, // YYYY-MM-DD format
    pub requests_made: u32,
    pub lines_of_code_edited: u32,
    pub ai_interactions: u32,
    pub tasks_completed: u32,
    pub timestamp_ns: u64,
}

/// User analytics summary
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct UserAnalytics {
    pub user_id: String,
    pub total_requests: u32,
    pub total_lines_edited: u32,
    pub total_ai_interactions: u32,
    pub total_tasks_completed: u32,
    pub daily_data: Vec<AnalyticsDataPoint>,
    pub period_start: String,
    pub period_end: String,
}

/// Analytics chart data for frontend
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct AnalyticsChartData {
    pub labels: Vec<String>, // Dates
    pub datasets: Vec<ChartDataset>,
}

/// Chart dataset for analytics
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ChartDataset {
    pub label: String,
    pub data: Vec<u32>,
    pub border_color: String,
    pub background_color: String,
}

/// Analytics summary for dashboard
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct AnalyticsSummary {
    pub requests_made: u32,
    pub lines_of_agent_edits: u32,
    pub ai_interactions: u32,
    pub tasks_completed: u32,
    pub chart_data: AnalyticsChartData,
}

impl Storable for AnalyticsDataPoint {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let bytes = candid::encode_one(self).expect("Failed to encode AnalyticsDataPoint");
        Cow::Owned(bytes)
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        candid::decode_one(&bytes).expect("Failed to decode AnalyticsDataPoint")
    }
}

impl BoundedStorable for AnalyticsDataPoint {
    const MAX_SIZE: u32 = 1024; // Adjust based on your needs
    const IS_FIXED_SIZE: bool = false;
}
