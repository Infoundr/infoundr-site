use crate::models::stable_principal::StablePrincipal;
use candid::{CandidType, Deserialize};
use candid::{Decode, Encode};
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct OpenChatUser {
    pub openchat_id: String,
    pub site_principal: Option<StablePrincipal>,
    pub first_interaction: u64,
    pub last_interaction: u64,
}

impl Storable for OpenChatUser {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for OpenChatUser {
    const MAX_SIZE: u32 = 1024;
    const IS_FIXED_SIZE: bool = false;
}
