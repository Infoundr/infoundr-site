use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct DashboardToken {
    pub token: Vec<u8>,
    pub openchat_id: String,
    pub created_at: u64,
    pub expires_at: u64,
}

impl Storable for DashboardToken {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for DashboardToken {
    const MAX_SIZE: u32 = 2048;
    const IS_FIXED_SIZE: bool = false;
}
