use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use serde::Serialize;
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: String,
    pub created_at: u64,
    pub platform: String,    // "asana" or "github"
    pub platform_id: String, // ID of the task in the respective platform
    pub creator: Principal,
}

// Implement Storable for Task
impl Storable for Task {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

// Implement BoundedStorable for Task
impl BoundedStorable for Task {
    const MAX_SIZE: u32 = 2048; // Adjust this value
    const IS_FIXED_SIZE: bool = false;
}
