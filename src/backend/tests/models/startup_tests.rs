use crate::models::stable_principal::StablePrincipal;
use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

// Type definitions for testing - copied from backend/src/models/startup.rs
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StartupInput {
    pub accelerator_id: String,
    pub name: String,
    pub description: Option<String>,
    pub industry: Option<String>,
    pub contact_email: String,
    pub status_id: Option<String>,
    pub cohort_id: Option<String>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StartupUpdate {
    pub name: Option<String>,
    pub description: Option<String>,
    pub industry: Option<String>,
    pub contact_email: Option<String>,
    pub status_id: Option<String>,
    pub cohort_id: Option<String>,
    pub engagement_score: Option<u32>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Startup {
    pub id: String,
    pub accelerator_id: StablePrincipal,
    pub name: String,
    pub description: Option<String>,
    pub industry: Option<String>,
    pub contact_email: String,
    pub founder_principal: StablePrincipal,
    pub date_joined: u64,
    pub status_id: String,
    pub cohort_id: String,
    pub engagement_score: u32,
    pub total_logins: u32,
    pub documents_submitted: u32,
    pub tasks_completed: u32,
    pub last_activity: u64,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StartupStatus {
    pub id: String,
    pub accelerator_id: StablePrincipal,
    pub name: String,
    pub color: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub sort_order: u32,
    pub created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StartupCohort {
    pub id: String,
    pub accelerator_id: StablePrincipal,
    pub name: String,
    pub description: Option<String>,
    pub start_date: Option<u64>,
    pub end_date: Option<u64>,
    pub is_active: bool,
    pub created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StartupActivity {
    pub id: String,
    pub startup_id: String,
    pub activity_type: StartupActivityType,
    pub description: String,
    pub timestamp: u64,
    pub metadata: Option<String>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum StartupActivityType {
    StatusChanged,
    CohortChanged,
    DocumentSubmitted,
    TaskCompleted,
    Login,
    EngagementScoreUpdated,
    Other(String),
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StartupStatusInput {
    pub name: String,
    pub color: String,
    pub description: Option<String>,
    pub sort_order: Option<u32>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StartupCohortInput {
    pub name: String,
    pub description: Option<String>,
    pub start_date: Option<u64>,
    pub end_date: Option<u64>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StartupFilter {
    pub status_ids: Option<Vec<String>>,
    pub cohort_ids: Option<Vec<String>>,
    pub search_term: Option<String>,
    pub min_engagement_score: Option<u32>,
    pub max_engagement_score: Option<u32>,
    pub date_from: Option<u64>,
    pub date_to: Option<u64>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StartupStats {
    pub total_startups: u32,
    pub active_startups: u32,
    pub graduated_startups: u32,
    pub average_engagement_score: u32,
    pub startups_by_status: Vec<(String, u32)>,
    pub startups_by_cohort: Vec<(String, u32)>,
    pub recent_activities: Vec<StartupActivity>,
}