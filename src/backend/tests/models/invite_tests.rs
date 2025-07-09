use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;

// Mock StablePrincipal for testing - matches the backend exactly
#[derive(Clone, Debug, CandidType, Serialize, Deserialize, PartialEq, Eq)]
pub struct StablePrincipal(pub Principal);

// impl StablePrincipal {
//     pub fn new(principal: Principal) -> Self {
//         Self(principal)
//     }

//     pub fn get(&self) -> Principal {
//         self.0
//     }
// }

impl From<Principal> for StablePrincipal {
    fn from(p: Principal) -> Self {
        StablePrincipal(p)
    }
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
pub struct AcceleratorSignUp {
    pub name: String,
    pub website: String,
    pub email: String,
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
pub struct GenerateStartupInviteInput {
    pub startup_name: String,
    pub program_name: String,
    pub accelerator_id: String,
    pub invite_type: InviteType,
    pub email: Option<String>,
    pub expiry_days: Option<u64>,
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
pub struct StartupRegistrationInput {
    pub invite_code: String,
    pub startup_name: String,
    pub founder_name: String,
    pub email: String,
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