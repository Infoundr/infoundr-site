use candid::{CandidType, Deserialize, Encode, Decode};
use serde::Serialize;
use ic_stable_structures::storable::{Storable, BoundedStorable};
use std::borrow::Cow;
use crate::models::stable_principal::StablePrincipal;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct SlackUser {
    pub slack_id: String,
    pub site_principal: Option<StablePrincipal>,
    pub display_name: Option<String>,
    pub team_id: Option<String>,
}

impl Storable for SlackUser {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for SlackUser {
    const MAX_SIZE: u32 = 1024;
    const IS_FIXED_SIZE: bool = false;
} 