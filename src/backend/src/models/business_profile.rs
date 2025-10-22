use candid::{CandidType, Deserialize};
use serde::Serialize;
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;
use crate::models::stable_principal::StablePrincipal;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct BusinessProfile {
    pub id: String,
    pub user_principal: StablePrincipal,

    // Basic Information
    pub business_name: String,
    pub tagline: Option<String>,
    pub industry: String,
    pub sub_industry: Option<String>,
    pub business_model: Option<BusinessModel>,
    pub founded_date: Option<u64>,
    pub location: Option<String>,
    pub website: Option<String>,

    // Team Information
    pub team_size: Option<TeamSize>,
    pub founders_count: Option<u32>,
    pub key_roles_filled: Vec<String>,
    pub hiring_priorities: Vec<String>,

    // Business Stage & Metrics
    pub stage: BusinessStage,
    pub revenue_stage: Option<RevenueStage>,
    pub monthly_revenue: Option<RevenueRange>,
    pub funding_raised: Option<String>,
    pub funding_goal: Option<String>,
    pub runway_months: Option<u32>,

    // Product/Service
    pub product_description: String,
    pub target_market: String,
    pub customer_segments: Vec<String>,
    pub unique_value_proposition: Option<String>,
    pub key_features: Vec<String>,

    // Market & Competition
    pub market_size: Option<String>,
    pub competitors: Vec<Competitor>,
    pub competitive_advantage: Option<String>,

    // Goals & Challenges
    pub short_term_goals: Vec<String>,
    pub long_term_goals: Vec<String>,
    pub current_challenges: Vec<String>,
    pub help_needed: Vec<String>,

    // Additional Context
    pub previous_experience: Option<String>,
    pub mentorship_interests: Vec<String>,
    pub technologies_used: Vec<String>,

    // Metadata
    pub created_at: u64,
    pub updated_at: u64,
    pub is_complete: bool,
    pub completion_percentage: u8,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum BusinessStage {
    Idea,
    Validation,
    MVP,
    EarlyTraction,
    Growth,
    Scaling,
    Mature,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum BusinessModel {
    B2B,
    B2C,
    B2B2C,
    Marketplace,
    SaaS,
    Ecommerce,
    Subscription,
    Freemium,
    Other(String),
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum RevenueStage {
    PreRevenue,
    FirstDollar,
    ConsistentRevenue,
    ProfitableUnit,
    Profitable,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum RevenueRange {
    None,
    Under1K,
    K1to10,
    K10to50,
    K50to100,
    K100to500,
    K500to1M,
    M1to5,
    M5to10,
    M10Plus,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum TeamSize {
    Solo,
    Size2to5,
    Size6to10,
    Size11to20,
    Size21to50,
    Size50Plus,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Competitor {
    pub name: String,
    pub description: Option<String>,
    pub differentiation: Option<String>,
}

impl Storable for BusinessProfile {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).expect("Failed to encode BusinessProfile"))
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).expect("Failed to decode BusinessProfile")
    }
}

impl BoundedStorable for BusinessProfile {
    const MAX_SIZE: u32 = 8192; // adjust if your struct can be larger
    const IS_FIXED_SIZE: bool = false;
}