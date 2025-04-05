use candid::{CandidType, Decode, Encode, Deserialize};
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct AsanaAccount {
    pub token: String,
    pub workspace_id: String,
    pub project_ids: Vec<(String, String)>, // (project_name, project_id)
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct GitHubAccount {
    pub token: String,
    pub selected_repo: Option<String>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ConnectedAccounts {
    pub asana: Option<AsanaAccount>,
    pub github: Option<GitHubAccount>,
}

// Implement Storable for ConnectedAccounts
impl Storable for ConnectedAccounts {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

// Implement BoundedStorable for ConnectedAccounts
impl BoundedStorable for ConnectedAccounts {
    const MAX_SIZE: u32 = 100000; // Adjust this value based on your needs
    const IS_FIXED_SIZE: bool = false;
} 