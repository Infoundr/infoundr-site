use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{BoundedStorable, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct WaitlistEntry {
    pub email: String,
    pub name: String,
    pub created_at: u64,
    pub status: WaitlistStatus,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum WaitlistStatus {
    Pending,
    Approved,
    Rejected,
}

impl Storable for WaitlistEntry {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for WaitlistEntry {
    const MAX_SIZE: u32 = 1024;
    const IS_FIXED_SIZE: bool = false;
} 