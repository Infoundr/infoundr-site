use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;
use serde::{Deserialize, Serialize};
use std::string::String;
use std::fmt;

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct StableString(String);

impl StableString {
    pub fn new(s: impl Into<String>) -> Self {
        Self(s.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl From<String> for StableString {
    fn from(s: String) -> Self {
        Self(s)
    }
}

impl From<&str> for StableString {
    fn from(s: &str) -> Self {
        Self(s.to_string())
    }
}

impl Default for StableString {
    fn default() -> Self {
        Self(String::new())
    }
}

impl Storable for StableString {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for StableString {
    const MAX_SIZE: u32 = 1024; // Maximum string length
    const IS_FIXED_SIZE: bool = false;
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

impl fmt::Display for StableString {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
} 