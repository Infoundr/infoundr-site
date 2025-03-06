use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{BoundedStorable, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use crate::models::stable_principal::StablePrincipal;

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub user_principal: StablePrincipal,
    pub content: String,
    pub timestamp: u64,
    pub bot_type: BotType,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum BotType {
    Benny,    // Strategic thinking
    Uncle,    // Startup guidance
    Dean,     // Innovation specialist
}

impl Storable for ChatMessage {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for ChatMessage {
    const MAX_SIZE: u32 = 2048;
    const IS_FIXED_SIZE: bool = false;
} 