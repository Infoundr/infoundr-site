use candid::{CandidType, Deserialize, Encode, Decode};
use serde::Serialize;
use ic_stable_structures::storable::{Storable, BoundedStorable};
use std::borrow::Cow;
use crate::models::stable_principal::StablePrincipal;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct DiscordUser {
    pub discord_id: String,
    pub site_principal: Option<StablePrincipal>,
    pub username: Option<String>,
    pub guild_id: Option<String>,
}


impl Storable for DiscordUser {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for DiscordUser {
    const MAX_SIZE: u32 = 1024;
    const IS_FIXED_SIZE: bool = false;
} 