use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;
use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StablePrincipal(Principal);

impl StablePrincipal {
    pub fn new(principal: Principal) -> Self {
        Self(principal)
    }

    // pub fn get(&self) -> Principal {
    //     self.0
    // }
}

impl Default for StablePrincipal {
    fn default() -> Self {
        Self(Principal::anonymous())
    }
}

impl Storable for StablePrincipal {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), Principal).unwrap())
    }
}

impl BoundedStorable for StablePrincipal {
    const MAX_SIZE: u32 = 29; // Principal max size
    const IS_FIXED_SIZE: bool = false;
}

impl From<Principal> for StablePrincipal {
    fn from(principal: Principal) -> Self {
        Self(principal)
    }
}

impl PartialEq for StablePrincipal {
    fn eq(&self, other: &Self) -> bool {
        self.0 == other.0
    }
}

impl Eq for StablePrincipal {}

impl Ord for StablePrincipal {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.0.as_slice().cmp(other.0.as_slice())
    }
}

impl PartialOrd for StablePrincipal {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl fmt::Display for StablePrincipal {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", Principal::from_slice(&self.0.as_slice()).to_string())
    }
} 