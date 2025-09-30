use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{BoundedStorable, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ApiMessage {
    pub id: String, // Unique identifier for the message
    pub user_id: String, // User identifier from the API
    pub message: String, // The original message sent to the API
    pub response: String, // The response received from the API
    pub bot_name: String, // The bot name from the API response (e.g., "GitHub Agent", "Gmail Agent", etc.)
    pub metadata: Option<ApiMetadata>, // Optional metadata from the API response
    pub timestamp: u64, // Timestamp when the message was stored
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ApiMetadata {
    pub has_token: Option<bool>,
    pub session_active: Option<bool>,
    pub needs_token: Option<bool>,
    pub oauth_url: Option<String>,
    pub oauth_state: Option<String>,
    pub direct_auth: Option<bool>,
}

impl Storable for ApiMessage {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for ApiMessage {
    const MAX_SIZE: u32 = 4096; // Larger than ChatMessage since API responses can be longer
    const IS_FIXED_SIZE: bool = false;
} 