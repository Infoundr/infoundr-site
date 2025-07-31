use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;

#[derive(CandidType, Deserialize, Clone, Debug, serde::Serialize)]
pub struct AgentSession {
    pub user_id: String,
    pub agent_type: AgentType,
    pub token: Option<String>,
    pub project_id: Option<String>,
    pub selected_repo: Option<String>,
    pub created_at: u64,
    pub last_activity: u64,
    pub is_active: bool,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, serde::Serialize)]
pub enum AgentType {
    GitHub,
    Asana,
    Gmail,
    Calendar,
    InFoundr, // Unified agent
}

#[derive(CandidType, Deserialize, Clone, Debug, serde::Serialize)]
pub struct AgentInteraction {
    pub id: String,
    pub user_id: String,
    pub agent_type: AgentType,
    pub message: String,
    pub response: String,
    pub timestamp: u64,
    pub success: bool,
    pub metadata: Option<String>, // JSON string for additional data
}

#[derive(CandidType, Deserialize, Clone, Debug, serde::Serialize)]
pub struct AgentCredentials {
    pub user_id: String,
    pub agent_type: AgentType,
    pub token: String,
    pub token_data: Option<String>, // JSON string for OAuth tokens
    pub workspace_id: Option<String>,
    pub project_ids: Vec<(String, String)>,
    pub selected_repo: Option<String>,
    pub created_at: u64,
    pub expires_at: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone, Debug, serde::Serialize)]
pub struct AgentActivity {
    pub user_id: String,
    pub agent_type: AgentType,
    pub activity_type: AgentActivityType,
    pub description: String,
    pub timestamp: u64,
    pub metadata: Option<String>, // JSON string for additional data
}

#[derive(CandidType, Deserialize, Clone, Debug, serde::Serialize)]
pub enum AgentActivityType {
    SessionCreated,
    SessionEnded,
    TokenStored,
    TokenRefreshed,
    InteractionCompleted,
    ErrorOccurred,
    ConnectionEstablished,
    TaskCreated,
    TaskUpdated,
    EmailSent,
    EmailRead,
    MeetingScheduled,
    IssueCreated,
    PullRequestCreated,
}

// Implement Storable for AgentSession
impl Storable for AgentSession {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for AgentSession {
    const MAX_SIZE: u32 = 4096;
    const IS_FIXED_SIZE: bool = false;
}

// Implement Storable for AgentInteraction
impl Storable for AgentInteraction {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for AgentInteraction {
    const MAX_SIZE: u32 = 8192;
    const IS_FIXED_SIZE: bool = false;
}

// Implement Storable for AgentCredentials
impl Storable for AgentCredentials {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for AgentCredentials {
    const MAX_SIZE: u32 = 4096;
    const IS_FIXED_SIZE: bool = false;
}

// Implement Storable for AgentActivity
impl Storable for AgentActivity {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for AgentActivity {
    const MAX_SIZE: u32 = 2048;
    const IS_FIXED_SIZE: bool = false;
} 