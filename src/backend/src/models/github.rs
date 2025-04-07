use candid::{CandidType, Deserialize};
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Issue {
    pub id: String,
    pub title: String,
    pub body: String,
    pub repository: String,
    pub created_at: u64,
    pub status: IssueStatus,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum IssueStatus {
    Open,
    Closed,
}

impl Storable for Issue {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

impl BoundedStorable for Issue {
    const MAX_SIZE: u32 = 2048;
    const IS_FIXED_SIZE: bool = false;
}
