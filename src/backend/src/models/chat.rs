use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::{BoundedStorable, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::fmt;
// use crate::models::stable_principal::StablePrincipal;
// use ic_cdk::export::candid::Principal;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum MessageRole {
    User,
    Assistant,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ChatMessage {
    pub id: Principal,
    pub role: MessageRole,
    pub content: String,
    pub question_asked: Option<String>, // Store the original question when role is assistant
    pub timestamp: u64,
    pub bot_name: Option<String>, // Which bot responded (Benny, Felix, etc)
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum BotType {
    Benny, // Strategic thinking
    Uncle, // Startup guidance
    Dean,  // Innovation specialist
}

// Add Display implementation for BotType
impl fmt::Display for BotType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BotType::Benny => write!(f, "Benny"),
            BotType::Uncle => write!(f, "Uncle"),
            BotType::Dean => write!(f, "Dean"),
        }
    }
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
