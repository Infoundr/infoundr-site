use crate::models::stable_principal::StablePrincipal;
use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;

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