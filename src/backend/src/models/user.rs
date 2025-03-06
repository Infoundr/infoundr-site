use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{BoundedStorable, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use crate::models::stable_principal::StablePrincipal;

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct User {
    pub principal: StablePrincipal,
    pub email: String,
    pub name: String,
    pub created_at: u64,
    pub subscription_tier: SubscriptionTier,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum SubscriptionTier {
    Free,
    Professional,
    Enterprise,
}

impl Storable for User {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for User {
    const MAX_SIZE: u32 = 1024;
    const IS_FIXED_SIZE: bool = false;
} 