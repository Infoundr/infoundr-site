use crate::models::stable_principal::StablePrincipal;
use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::{BoundedStorable, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum Role {
    SuperAdmin,
    Admin,
    ProgramManager,
    Viewer,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum MemberStatus {
    Active,
    Pending,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TeamMember {
    pub email: String,
    pub role: Role,
    pub status: MemberStatus,
    pub token: Option<String>,
    pub principal: Option<Principal>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Accelerator {
    pub id: StablePrincipal,
    pub name: String,
    pub website: String,
    pub email: String,
    pub email_verified: bool,
    pub logo: Option<Vec<Vec<u8>>>,
    pub total_startups: u32,
    pub invites_sent: u32,
    pub active_startups: u32,
    pub graduated_startups: u32,
    pub recent_activity: Vec<Activity>,
    pub team_members: Vec<TeamMember>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Activity {
    pub timestamp: u64,
    pub description: String,
    pub activity_type: ActivityType,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ActivityType {
    Joined,
    UpdatedPitchDeck,
    SentInvite,
    Graduated,
    MissedMilestone,
    Other(String),
}

impl Storable for Accelerator {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for Accelerator {
    const MAX_SIZE: u32 = 8192; // Adjust as needed for blob data
    const IS_FIXED_SIZE: bool = false;
} 