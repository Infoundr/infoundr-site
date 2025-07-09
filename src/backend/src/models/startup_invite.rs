use crate::models::stable_principal::StablePrincipal;
use candid::{CandidType, Deserialize, Principal, Decode, Encode};
use serde::Serialize;
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;

#[derive(Clone, Debug, CandidType, Serialize, Deserialize, PartialEq, Eq)]
pub enum InviteType {
    Link,
    Code,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize, PartialEq, Eq)]
pub enum InviteStatus {
    Pending,
    Used,
    Expired,
    Revoked,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct StartupInvite {
    pub invite_id: String,                
    pub startup_name: String,             
    pub accelerator_id: StablePrincipal,  
    pub program_name: String,             
    pub invite_type: InviteType,          
    pub invite_code: String,              
    pub expiry: u64,                      
    pub status: InviteStatus,             
    pub created_at: u64,                  
    pub used_at: Option<u64>,             
    pub email: Option<String>,            
    pub registered_principal: Option<Principal>,
    pub registered_at: Option<u64>,
}

impl Storable for StartupInvite {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for StartupInvite {
    const MAX_SIZE: u32 = 2048;
    const IS_FIXED_SIZE: bool = false;
}