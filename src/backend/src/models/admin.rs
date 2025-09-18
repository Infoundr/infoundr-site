use candid::{CandidType, Deserialize};
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Admin {
    pub principal_id: String,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct PlaygroundStats {
    pub total_messages: u32,
    pub unique_users: u32,
    pub bot_usage: std::collections::HashMap<String, u32>,
}

impl Storable for Admin {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        let mut bytes = vec![];
        bytes.extend_from_slice(&self.principal_id.as_bytes());
        bytes.extend_from_slice(&self.created_at.to_le_bytes());
        Cow::Owned(bytes)
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        let principal_id = String::from_utf8(bytes[..bytes.len() - 8].to_vec()).unwrap();
        let created_at = u64::from_le_bytes(bytes[bytes.len() - 8..].try_into().unwrap());
        Admin {
            principal_id,
            created_at,
        }
    }
}

// Add BoundedStorable implementation
impl BoundedStorable for Admin {
    const MAX_SIZE: u32 = 1024; // Adjust this value based on your needs
    const IS_FIXED_SIZE: bool = false;
}
