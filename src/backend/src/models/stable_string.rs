use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StableString(String);

impl StableString {
    pub fn new(s: String) -> Self {
        Self(s)
    }

    pub fn get(&self) -> &str {
        &self.0
    }
}

impl Storable for StableString {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), String).unwrap())
    }
}

impl BoundedStorable for StableString {
    const MAX_SIZE: u32 = 1024; // Maximum string length
    const IS_FIXED_SIZE: bool = false;
}

impl From<String> for StableString {
    fn from(s: String) -> Self {
        Self(s)
    }
}

impl PartialEq for StableString {
    fn eq(&self, other: &Self) -> bool {
        self.0 == other.0
    }
}

impl Eq for StableString {}

impl Ord for StableString {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.0.cmp(&other.0)
    }
}

impl PartialOrd for StableString {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
} 