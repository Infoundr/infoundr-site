use crate::models::accelerator::{Accelerator, Role, TeamMember, MemberStatus, Activity, ActivityType};
use crate::models::stable_principal::StablePrincipal;
use crate::models::stable_string::StableString;
use crate::storage::memory::ACCELERATORS;
use candid::{CandidType, Deserialize};
use serde::Serialize;
use candid::Principal;
use regex::Regex;
use std::collections::HashSet;
use ic_cdk::{caller, update, query};
use rand::RngCore;
use rand::rngs::OsRng;
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use crate::models::startup_invite::{StartupInvite, InviteType, InviteStatus};
use crate::storage::memory::STARTUP_INVITES;
use crate::models::user::{User, SubscriptionTier};
use crate::storage::memory::USERS;
// use crate::services::auth::register_startup;
use ic_cdk::api::time;  

// ==================================================================================================
// Accelerator Sign Up
// ===============================================================================================

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct AcceleratorSignUp {
    pub membername: String,
    pub name: String,
    pub website: String,
    pub email: String,
}

#[update]
pub fn sign_up_accelerator(input: AcceleratorSignUp) -> Result<String, String> {
    let caller_principal = caller();
    let accelerator_id = StablePrincipal::new(caller_principal);

    let exists = ACCELERATORS.with(|accs| accs.borrow().contains_key(&accelerator_id));
    if exists {
        return Err("Accelerator with this principal already exists".to_string());
    }
    let team_members = vec![TeamMember {
        name: input.membername,
        email: input.email.clone(),
        role: Role::SuperAdmin,
        status: MemberStatus::Active,
        token: None,
        principal: Some(caller_principal),
    }];
    
    let recent_activity = vec![Activity {
        timestamp: ic_cdk::api::time(),
        description: "Accelerator created".to_string(),
        activity_type: ActivityType::AcceleratorCreated,
    }];

    let accelerator = Accelerator {
        id: accelerator_id.clone(),
        name: input.name,
        website: input.website,
        email: input.email,
        email_verified: false,
        logo: None,
        total_startups: 0,
        invites_sent: 0,
        active_startups: 0,
        graduated_startups: 0,
        recent_activity,
        team_members,
    };
    
    ACCELERATORS.with(|accs| accs.borrow_mut().insert(accelerator_id.clone(), accelerator));
    Ok(accelerator_id.to_string())
}

pub fn get_accelerator_by_id(id: StablePrincipal) -> Result<Option<Accelerator>, String> {
    let caller_principal = caller();
    
    // Only allow access if caller is the accelerator owner
    if id.get() != caller_principal {
        return Err("Unauthorized: You can only access your own accelerator data".to_string());
    }

    let accelerator = ACCELERATORS.with(|accs| accs.borrow().get(&id));
    Ok(accelerator)
}

#[update]
pub fn get_my_accelerator() -> Result<Option<Accelerator>, String> {
    let caller_principal = caller();
    
    // Search through all accelerators to find one where the caller is an active team member
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(_, acc)| {
            acc.team_members.iter().any(|m| 
                m.principal == Some(caller_principal) && m.status == MemberStatus::Active
            )
        }).map(|(_, v)| v.clone())
    });
    
    match accelerator {
        Some(acc) => {
            let is_member = acc.team_members.iter().any(|m| m.principal == Some(caller_principal) && m.status == MemberStatus::Active);
            if is_member {
                Ok(Some(acc))
            } else {
                Err("Unauthorized: Not a team member".to_string())
            }
        },
        None => Err("Accelerator not found".to_string()),
    }
}

#[update]
pub fn update_accelerator(id: StablePrincipal, updates: AcceleratorUpdate) -> Result<(), String> {
    let caller_principal = caller();
    
    // Only allow updates if caller is the accelerator owner
    if id.get() != caller_principal {
        return Err("Unauthorized: You can only update your own accelerator data".to_string());
    }

    let mut accelerator = get_accelerator_by_id(id.clone())?
        .ok_or("Accelerator not found")?;

    if let Some(name) = updates.name {
        accelerator.name = name;
    }
    if let Some(website) = updates.website {
        accelerator.website = website;
    }
    if let Some(email) = updates.email {
        accelerator.email = email;
    }
    if let Some(email_verified) = updates.email_verified {
        accelerator.email_verified = email_verified;
    }
    if let Some(logo) = updates.logo {
        accelerator.logo = logo;
    }
    if let Some(total_startups) = updates.total_startups {
        accelerator.total_startups = total_startups;
    }
    if let Some(invites_sent) = updates.invites_sent {
        accelerator.invites_sent = invites_sent;
    }
    if let Some(active_startups) = updates.active_startups {
        accelerator.active_startups = active_startups;
    }
    if let Some(graduated_startups) = updates.graduated_startups {
        accelerator.graduated_startups = graduated_startups;
    }

    ACCELERATORS.with(|accs| accs.borrow_mut().insert(id, accelerator));
    Ok(())
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct AcceleratorUpdateWithId {
    pub accelerator_id: String,
    pub updates: AcceleratorUpdate,
}

#[update]
pub fn update_my_accelerator(input: AcceleratorUpdateWithId) -> Result<(), String> {
    let caller_principal = caller();
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == input.accelerator_id).map(|(_, v)| v.clone())
    });
    let mut accelerator = match accelerator {
        Some(acc) => acc,
        None => return Err("Accelerator not found".to_string()),
    };
    // Only allow Admin or SuperAdmin
    let caller_member = accelerator.team_members.iter().find(|m| m.principal == Some(caller_principal) && m.status == MemberStatus::Active);
    let is_admin = caller_member.map(|m| m.role == Role::SuperAdmin || m.role == Role::Admin).unwrap_or(false);
    if !is_admin {
        return Err("Only SuperAdmins or Admins can update accelerator".to_string());
    }
    // Apply updates
    if let Some(name) = input.updates.name {
        accelerator.name = name;
    }
    if let Some(website) = input.updates.website {
        accelerator.website = website;
    }
    if let Some(email) = input.updates.email {
        accelerator.email = email;
    }
    if let Some(email_verified) = input.updates.email_verified {
        accelerator.email_verified = email_verified;
    }
    if let Some(logo) = input.updates.logo {
        accelerator.logo = logo;
    }
    if let Some(total_startups) = input.updates.total_startups {
        accelerator.total_startups = total_startups;
    }
    if let Some(invites_sent) = input.updates.invites_sent {
        accelerator.invites_sent = invites_sent;
    }
    if let Some(active_startups) = input.updates.active_startups {
        accelerator.active_startups = active_startups;
    }
    if let Some(graduated_startups) = input.updates.graduated_startups {
        accelerator.graduated_startups = graduated_startups;
    }
    // Save updated accelerator
    ACCELERATORS.with(|accs| {
        let key = accs.borrow().iter().find(|(k, _)| k.to_string() == input.accelerator_id).map(|(k, _)| k.clone());
        if let Some(key) = key {
            accs.borrow_mut().insert(key, accelerator);
        }
    });
    Ok(())
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct AcceleratorUpdate {
    pub name: Option<String>,
    pub website: Option<String>,
    pub email: Option<String>,
    pub email_verified: Option<bool>,
    pub logo: Option<Option<Vec<Vec<u8>>>>,
    pub total_startups: Option<u32>,
    pub invites_sent: Option<u32>,
    pub active_startups: Option<u32>,
    pub graduated_startups: Option<u32>,
}

// ==================================================================================================
// TEAM MEMBER INVITES
// ==================================================================================================

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct TeamMemberInviteWithId {
    pub email: String,
    pub role: Role,
    pub name: String
}

#[update]
pub fn invite_team_member(input: TeamMemberInviteWithId) -> Result<String, String> {
    let caller_principal = caller();
    let accelerator = get_my_accelerator()?;
    let mut accelerator = match accelerator {
        Some(acc) => acc,
        None => return Err("Accelerator not found".to_string()),
    };
    

    let caller_member = accelerator.team_members.iter().find(|m| m.principal == Some(caller_principal) && m.status == MemberStatus::Active);
    let is_admin = caller_member.map(|m| m.role == Role::SuperAdmin || m.role == Role::Admin).unwrap_or(false);
    if !is_admin {
        return Err("Only SuperAdmins or Admins can invite team members".to_string());
    }

    if input.role == Role::SuperAdmin && caller_member.map(|m| m.role != Role::SuperAdmin).unwrap_or(true) {
        return Err("Only SuperAdmin can invite another SuperAdmin".to_string());
    }

    if accelerator.team_members.iter().any(|m| m.email == input.email) {
        return Err("This email is already a team member or has a pending invite".to_string());
    }

    let mut token_bytes = [0u8; 32];
    OsRng.fill_bytes(&mut token_bytes);
    let token = BASE64.encode(&token_bytes);

    accelerator.team_members.push(TeamMember {
        name: input.name,
        email: input.email,
        role: input.role,
        status: MemberStatus::Pending,
        token: Some(token.clone()),
        principal: None,
    });
    accelerator.invites_sent += 1;

    ACCELERATORS.with(|accs| {
        let key = accs.borrow().iter().find(|(k, _)| k.to_string() == accelerator.id.to_string()).map(|(k, _)| k.clone());
        if let Some(key) = key {
            accs.borrow_mut().insert(key, accelerator);
        }
    });
    Ok(token)
}

#[update]
pub fn accept_invitation(token: String) -> Result<(), String> {
    let caller_principal = caller();
    let mut found = false;

    ACCELERATORS.with(|accs| {
        let mut accs = accs.borrow_mut();
        let keys: Vec<_> = accs.iter().map(|(k, _)| k.clone()).collect();
        for key in keys {
            if let Some(accelerator) = accs.get(&key) {
                let mut accelerator = accelerator.clone();
                if let Some(member) = accelerator.team_members.iter_mut().find(|m| m.token.as_ref() == Some(&token) && m.status == MemberStatus::Pending) {
                    member.status = MemberStatus::Active;
                    member.principal = Some(caller_principal);
                    member.token = None;
                    accs.insert(key, accelerator);
                    found = true;
                    break;
                }
            }
        }
    });

    if found {
        Ok(())
    } else {
        Err("Invalid or already used invitation token".to_string())
    }
}

#[update]
pub fn decline_invitation(token: String) -> Result<(), String> {
    let caller_principal = caller();
    let mut found = false;

    ACCELERATORS.with(|accs| {
        let mut accs = accs.borrow_mut();
        let keys: Vec<_> = accs.iter().map(|(k, _)| k.clone()).collect();
        for key in keys {
            if let Some(accelerator) = accs.get(&key) {
                let mut accelerator = accelerator.clone();
                if let Some(member) = accelerator.team_members.iter_mut().find(|m| m.token.as_ref() == Some(&token) && m.status == MemberStatus::Pending) {
                    member.status = MemberStatus::Declined; // Mark as declined
                    member.principal = Some(caller_principal);
                    member.token = None; // Remove the token so it can't be reused
                    accs.insert(key, accelerator);
                    found = true;
                    break;
                }
            }
        }
    });

    if found {
        Ok(())
    } else {
        Err("Invalid or already used invitation token".to_string())
    }
}

#[query]
pub fn list_team_members() -> Result<Vec<TeamMember>, String> {
    let caller_principal = caller();
    let accelerator = get_my_accelerator()?;
    let accelerator = match accelerator {
        Some(acc) => acc,
        None => return Err("Accelerator not found".to_string()),
    };
    // Check if caller is an active team member
    let is_member = accelerator.team_members.iter().any(|m| m.principal == Some(caller_principal) && m.status == MemberStatus::Active);
    if !is_member {
        return Err("Unauthorized: Not a team member".to_string());
    }
    Ok(accelerator.team_members)
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct UpdateTeamMemberRole {
    pub email: String,
    pub new_role: Role,
}

#[update]
pub fn update_team_member_role(input: UpdateTeamMemberRole) -> Result<(), String> {
    let caller_principal = caller();
    let accelerator = get_my_accelerator()?;
    let mut accelerator = match accelerator {
        Some(acc) => acc,
        None => return Err("Accelerator not found".to_string()),
    };
    
    // Find caller's member record
    let caller_member = accelerator.team_members.iter().find(|m| m.principal == Some(caller_principal) && m.status == MemberStatus::Active);
    let is_admin = caller_member.map(|m| m.role == Role::SuperAdmin || m.role == Role::Admin).unwrap_or(false);
    if !is_admin {
        return Err("Only SuperAdmins or Admins can update team member roles".to_string());
    }

    // Cannot update own role
    if input.email == caller_member.map(|m| m.email.clone()).unwrap_or_default() {
        return Err("You cannot update your own role".to_string());
    }

    // Only SuperAdmin can promote to SuperAdmin
    if input.new_role == Role::SuperAdmin && caller_member.map(|m| m.role != Role::SuperAdmin).unwrap_or(true) {
        return Err("Only SuperAdmin can promote to SuperAdmin".to_string());
    }

    // Find and update the member
    let mut found = false;
    for member in accelerator.team_members.iter_mut() {
        if member.email == input.email && member.status == MemberStatus::Active {
            member.role = input.new_role.clone();
            found = true;
            break;
        }
    }
    if !found {
        return Err("Team member not found or not active".to_string());
    }

    // Prevent demoting last SuperAdmin
    if input.new_role != Role::SuperAdmin {
        let super_admins = accelerator.team_members.iter().filter(|m| m.role == Role::SuperAdmin && m.status == MemberStatus::Active).count();
        if super_admins == 0 {
            return Err("Cannot demote the last SuperAdmin".to_string());
        }
    }
    // Save updated accelerator
    ACCELERATORS.with(|accs| {
        let key = accs.borrow().iter().find(|(k, _)| k.to_string() == accelerator.id.to_string()).map(|(k, _)| k.clone());
        if let Some(key) = key {
            accs.borrow_mut().insert(key, accelerator);
        }
    });
    Ok(())
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct RemoveTeamMember {
    pub email: String,
}

#[update]
pub fn remove_team_member(input: RemoveTeamMember) -> Result<(), String> {
    let caller_principal = caller();
    let accelerator = get_my_accelerator()?;
    let mut accelerator = match accelerator {   
        Some(acc) => acc,
        None => return Err("Accelerator not found".to_string()),
    };
    // Find caller's member record
    let caller_member = accelerator.team_members.iter().find(|m| m.principal == Some(caller_principal) && m.status == MemberStatus::Active);
    let is_admin = caller_member.map(|m| m.role == Role::SuperAdmin || m.role == Role::Admin).unwrap_or(false);
    if !is_admin {
        return Err("Only SuperAdmins or Admins can remove team members".to_string());
    }

    // Cannot remove self
    if input.email == caller_member.map(|m| m.email.clone()).unwrap_or_default() {
        return Err("You cannot remove yourself".to_string());
    }

    // Find and remove the member
    let orig_len = accelerator.team_members.len();
    accelerator.team_members.retain(|m| !(m.email == input.email && m.status == MemberStatus::Active));
    if accelerator.team_members.len() == orig_len {
        return Err("Team member not found or not active".to_string());
    }

    // Prevent removing last SuperAdmin
    let super_admins = accelerator.team_members.iter().filter(|m| m.role == Role::SuperAdmin && m.status == MemberStatus::Active).count();
    if super_admins == 0 {
        return Err("Cannot remove the last SuperAdmin".to_string());
    }
    // Save updated accelerator
    ACCELERATORS.with(|accs| {
        let key = accs.borrow().iter().find(|(k, _)| k.to_string() == accelerator.id.to_string()).map(|(k, _)| k.clone());
        if let Some(key) = key {
            accs.borrow_mut().insert(key, accelerator);
        }
    });
    Ok(())
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct TeamInvite {
    pub name: String,
    pub email: String,
    pub role: Role,
    pub accelerator_name: String,
}

#[query]
pub fn get_team_invite_by_token(token: String) -> Result<Option<TeamInvite>, String> {
    let _now = ic_cdk::api::time();

    ACCELERATORS.with(|accs| {
        for (_, accelerator) in accs.borrow().iter() {
            if let Some(member) = accelerator.team_members.iter().find(|m| {
                m.token.as_ref() == Some(&token) && m.status == MemberStatus::Pending
            }) {
                // No explicit expiry in your struct, so we skip expiry logic
                let invite_info = TeamInvite {
                    name: member.name.clone(),
                    email: member.email.clone(),
                    role: member.role.clone(),
                    accelerator_name: accelerator.name.clone(),
                };
                return Ok(Some(invite_info));
            }
        }
        Ok(None)
    })
}


// ==================================================================================================
// STARTUP INVITES
// ==================================================================================================

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct GenerateStartupInviteInput {
    pub startup_name: String,
    pub program_name: String,
    pub accelerator_id: String,
    pub invite_type: InviteType,
    pub email: Option<String>,
    pub expiry_days: Option<u64>,
}

#[update]
pub fn generate_startup_invite(input: GenerateStartupInviteInput) -> Result<StartupInvite, String> {
    
    let caller_principal = caller();

    
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == input.accelerator_id).map(|(_, v)| v.clone())
    });
    let accelerator = match accelerator {
        Some(acc) => acc,
        None => return Err("Accelerator not found".to_string()),
    };

    let is_admin = accelerator.team_members.iter().any(|m| {
        m.principal == Some(caller_principal) &&
        (m.role == Role::SuperAdmin || m.role == Role::Admin) &&
        m.status == MemberStatus::Active
    });
    if !is_admin {
        return Err("Only SuperAdmins or Admins can generate invites".to_string());
    }

    let mut token_bytes = [0u8; 32];
    OsRng.fill_bytes(&mut token_bytes);
    let invite_code = BASE64.encode(&token_bytes);
    let invite_id = invite_code.clone(); 

    let now = ic_cdk::api::time();
    let expiry_days = input.expiry_days.unwrap_or(3);
    let expiry = now + expiry_days * 24 * 60 * 60 * 1_000_000_000; // nanoseconds

    let invite = StartupInvite {
        invite_id: invite_id.clone(),
        startup_name: input.startup_name.clone(),
        accelerator_id: accelerator.id.clone(),
        program_name: input.program_name,
        invite_type: input.invite_type,
        invite_code: invite_code.clone(),
        expiry,
        status: InviteStatus::Pending,
        created_at: now,
        used_at: None,
        email: input.email,
        registered_principal: None,
        registered_at: None,
    };

    println!("Updating accelerator: add activity and increment invites_sent");

    let mut updated_accelerator = accelerator.clone();
    updated_accelerator.recent_activity.push(Activity {
        timestamp: now,
        description: format!("Invite generated for {}", input.startup_name),
        activity_type: ActivityType::SentInvite,
    });

    updated_accelerator.invites_sent += 1;
    ACCELERATORS.with(|accs| {
        let key = accs.borrow().iter().find(|(k, _)| k.to_string() == input.accelerator_id).map(|(k, _)| k.clone());
        if let Some(key) = key {
            accs.borrow_mut().insert(key, updated_accelerator);
        }
    });

    STARTUP_INVITES.with(|invites| {
        invites.borrow_mut().insert(StableString::new(&invite_id), invite.clone());
    });

    Ok(invite)
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct StartupRegistrationInput {
    pub invite_code: String,
    pub startup_name: String,
    pub founder_name: String,
    pub email: String,
}

#[update]
pub fn accept_startup_invite(input: StartupRegistrationInput) -> Result<(), String> {

    let principal = caller();
    let now = time();

    let invite = STARTUP_INVITES.with(|invites| {
        invites.borrow().get(&StableString::new(&input.invite_code))
    }).ok_or("Invalid or expired invite code".to_string())?;

    if invite.status != InviteStatus::Pending {
        return Err("Invite is not pending or already used/expired".to_string());
    }

    if now >= invite.expiry {
        STARTUP_INVITES.with(|invites| {
            let mut invites_mut = invites.borrow_mut();
            if let Some(mut inv) = invites_mut.get(&StableString::new(&input.invite_code)) {
                inv.status = InviteStatus::Expired;
                invites_mut.insert(StableString::new(&input.invite_code), inv);
            }
        });
        return Err("Invite has expired".to_string());
    }

    // Store the startup registration data in the invite for later use
    // We'll register the startup when the user authenticates
    STARTUP_INVITES.with(|invites| {
        let mut invites_mut = invites.borrow_mut();
        if let Some(mut inv) = invites_mut.get(&StableString::new(&input.invite_code)) {
            inv.status = InviteStatus::Used;
            inv.used_at = Some(now);
            inv.registered_principal = Some(principal);
            inv.registered_at = Some(now);
            // Store the startup registration data
            inv.startup_name = input.startup_name.clone();
            invites_mut.insert(StableString::new(&input.invite_code), inv);
        }
    });

    Ok(())
}

#[query]
pub fn list_startup_invites(accelerator_id: String) -> Vec<StartupInvite> {
    let now = ic_cdk::api::time();
    STARTUP_INVITES.with(|invites| {
        let mut invites_mut = invites.borrow_mut();
        // Update expired invites
        let keys_to_update: Vec<_> = invites_mut
            .iter()
            .filter(|(_, invite)| {
                invite.accelerator_id.to_string() == accelerator_id
                    && invite.status == InviteStatus::Pending
                    && now >= invite.expiry
            })
            .map(|(k, _)| k.clone())
            .collect();
        
        for key in keys_to_update {
            if let Some(mut invite) = invites_mut.get(&key) {
                invite.status = InviteStatus::Expired;
                invites_mut.insert(key, invite);
            }
        }
        
        invites_mut
            .iter()
            .map(|(_, invite)| invite.clone())
            .filter(|invite| invite.accelerator_id.to_string() == accelerator_id)
            .collect()
    })
}

#[update]
pub fn revoke_startup_invite(invite_code: String) -> Result<(), String> {
    let principal = ic_cdk::caller();
    let now = ic_cdk::api::time();
    STARTUP_INVITES.with(|invites| {
        let mut invites = invites.borrow_mut();
        let invite = invites.get(&StableString::new(&invite_code));
        match invite {
            Some(mut invite) => {
                let accelerator_id = &invite.accelerator_id;
                let accelerator = ACCELERATORS.with(|accs| {
                    accs.borrow().iter().find(|(k, _)| k.to_string() == accelerator_id.to_string()).map(|(_, v)| v.clone())
                });
                let accelerator = match accelerator {
                    Some(acc) => acc,
                    None => return Err("Accelerator not found".to_string()),
                };
                let is_admin = accelerator.team_members.iter().any(|m| {
                    m.principal == Some(principal)
                        && (m.role == Role::SuperAdmin || m.role == Role::Admin)
                        && m.status == MemberStatus::Active
                });
                if !is_admin {
                    return Err("Only SuperAdmins or Admins can revoke invites".to_string());
                }
                
                if invite.status == InviteStatus::Used {
                    return Err("Cannot revoke an invite that has already been used".to_string());
                }
                if invite.status == InviteStatus::Expired || (invite.status == InviteStatus::Pending && now >= invite.expiry) {
                    invite.status = InviteStatus::Expired;
                    invites.insert(StableString::new(&invite_code), invite);
                    return Err("Cannot revoke an invite that has already expired".to_string());
                }
                invite.status = InviteStatus::Revoked;
                invites.insert(StableString::new(&invite_code), invite);
                Ok(())
            }
            None => Err("Invite not found".to_string()),
        }
    })
}

#[query]
pub fn get_startup_invite_by_code(invite_code: String) -> Result<Option<StartupInvite>, String> {
    let now = ic_cdk::api::time();
    
    let invite = STARTUP_INVITES.with(|invites| {
        invites.borrow().get(&StableString::new(&invite_code))
    });
    
    match invite {
        Some(mut invite) => {
            // Check if invite has expired and update status if needed
            if invite.status == InviteStatus::Pending && now >= invite.expiry {
                invite.status = InviteStatus::Expired;
                STARTUP_INVITES.with(|invites| {
                    let mut invites_mut = invites.borrow_mut();
                    invites_mut.insert(StableString::new(&invite_code), invite.clone());
                });
            }
            
            Ok(Some(invite))
        }
        None => Ok(None)
    }
}

#[update]
pub fn link_startup_principal(startup_email: String, founder_name: String) -> Result<(), String> {
    let principal = caller();
    let now = time();

    // Check if user already exists with this principal
    if USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(principal))) {
        return Err("User already exists with this principal".to_string());
    }

    // Find the startup by email in the USERS storage
    let startup_user = USERS.with(|users| {
        users.borrow().iter().find(|(_, user)| {
            user.email.as_ref().map(|email| email == &startup_email).unwrap_or(false)
        }).map(|(_, user)| user.clone())
    });

    match startup_user {
        Some(mut user) => {
            // Update the user's principal to link it
            user.principal = StablePrincipal::new(principal);
            user.name = format!("{} ({})", user.name.split(" (").next().unwrap_or("Startup"), founder_name);
            
            USERS.with(|users| {
                users.borrow_mut().insert(StablePrincipal::new(principal), user);
            });
            
            Ok(())
        }
        None => {
            // If no user found, create a new one (this is the normal case for startup invites)
            let user = User {
                principal: StablePrincipal::new(principal),
                name: format!("Startup ({})", founder_name),
                email: Some(startup_email),
                created_at: now,
                subscription_tier: SubscriptionTier::Free,
                openchat_id: None,
                slack_id: None,
                discord_id: None,
            };
            
            USERS.with(|users| {
                users.borrow_mut().insert(StablePrincipal::new(principal), user);
            });
            
            Ok(())
        }
    }
}  

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct StartupInviteRow {
    pub startup_name: String,
    pub email: String,
    pub expiry_days: Option<u64>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct BulkStartupInviteInput {
    pub accelerator_id: String,
    pub program_name: String,
    pub invite_type: InviteType,
    pub invites: Vec<StartupInviteRow>,
}

#[derive(Clone, Debug, CandidType, Serialize)]
pub struct InviteError {
    pub row_number: u64,
    pub startup_name: String,
    pub email: String,
    pub error: String,
}

#[derive(Clone, Debug, CandidType, Serialize)]
pub struct BulkInviteResult {
    pub total: u64,
    pub successful: Vec<StartupInvite>, 
    pub failed: Vec<InviteError>,
}
#[update]
pub async fn generate_bulk_startup_invites(
    input: BulkStartupInviteInput,
) -> Result<BulkInviteResult, String> {
    ic_cdk::println!(
        "generate_bulk_startup_invites: received {} invites for accelerator {}",
        input.invites.len(),
        input.accelerator_id
    );

    let caller_principal = caller();

    // 1️⃣ Permission check
    if !is_admin_or_superadmin(&caller_principal) && !is_accel_admin(&caller_principal, &input.accelerator_id) {
        return Err("Permission denied — caller must be admin or superadmin.".to_string());
    }

    // 2️⃣ Validate accelerator exists
    let accel_id = input.accelerator_id.clone();
    if !accelerator_exists(&accel_id) {
        return Err(format!("Accelerator with ID '{}' not found.", accel_id));
    }

    let mut successful: Vec<StartupInvite> = Vec::new();
    let mut failed: Vec<InviteError> = Vec::new();
    let mut seen_emails: HashSet<String> = HashSet::new();
    let _total = input.invites.len();

    for (index, row) in input.invites.iter().enumerate() {
        let row_number = index + 1;
        let email_trimmed = row.email.trim().to_lowercase();
        let name_trimmed = row.startup_name.trim();

        // 3️⃣ Validate required fields
        if name_trimmed.is_empty() {
            failed.push(InviteError {
                row_number: row_number as u64,
                startup_name: row.startup_name.clone(),
                email: row.email.clone(),
                error: "Missing startup_name".to_string(),
            });
            continue;
        }

        if email_trimmed.is_empty() {
            failed.push(InviteError {
                row_number: row_number as u64,
                startup_name: row.startup_name.clone(),
                email: row.email.clone(),
                error: "Missing email".to_string(),
            });
            continue;
        }

        // 4️⃣ Email format
        if !is_valid_email(&email_trimmed) {
            failed.push(InviteError {
                row_number: row_number as u64,
                startup_name: row.startup_name.clone(),
                email: row.email.clone(),
                error: "Invalid email format".to_string(),
            });
            continue;
        }

        // 5️⃣ Prevent duplicate invites in same CSV
        if seen_emails.contains(&email_trimmed) {
            failed.push(InviteError {
                row_number: row_number as u64,
                startup_name: row.startup_name.clone(),
                email: row.email.clone(),
                error: "Duplicate email in CSV".to_string(),
            });
            continue;
        } else {
            seen_emails.insert(email_trimmed.clone());
        }

        // 6️⃣ Check if invite already exists
        if invite_already_exists(&accel_id, &email_trimmed) {
            failed.push(InviteError {
                row_number: row_number as u64,
                startup_name: row.startup_name.clone(),
                email: row.email.clone(),
                error: "Invite already exists".to_string(),
            });
            continue;
        }

        // 7️⃣ Create invite
        match create_startup_invite_internal(
            &accel_id,
            &input.program_name,
            name_trimmed,
            input.invite_type.clone(),
            Some(email_trimmed.clone()),
            row.expiry_days,
        ) {
            Ok(invite) => successful.push(invite),
            Err(err) => failed.push(InviteError {
                row_number: row_number as u64,
                startup_name: row.startup_name.clone(),
                email: row.email.clone(),
                error: err,
            }),
        }
    }

    // 8️⃣ Update accelerator metrics
    if !successful.is_empty() {
        increment_accelerator_invite_count(&accel_id, successful.len() as u64);
    }

    ic_cdk::println!(
        "generate_bulk_startup_invites: {} successful, {} failed.",
        successful.len(),
        failed.len()
    );

    Ok(BulkInviteResult {
        total: input.invites.len() as u64,
        successful,
        failed,
    })
}

// ---------------------------------------------------------
// 🧩 SINGLE INVITE CREATION
// ---------------------------------------------------------
fn create_startup_invite_internal(
    accelerator_id: &String,
    program_name: &String,
    startup_name: &str,
    invite_type: InviteType,
    email: Option<String>,
    expiry_days: Option<u64>,
) -> Result<StartupInvite, String> {
    // Fetch accelerator
    let sp = StablePrincipal::new(Principal::from_text(accelerator_id).map_err(|_| "Invalid Principal")?);
    let accelerator = ACCELERATORS.with(|accs|{ accs.borrow().get(&sp).map(|acc|acc.clone())});
    let accelerator = accelerator.ok_or("Accelerator not found".to_string())?;

    // Generate token / invite code
    let mut token_bytes = [0u8; 32];
    OsRng.fill_bytes(&mut token_bytes);
    let invite_code = BASE64.encode(&token_bytes);
    let invite_id = invite_code.clone();

    let now = ic_cdk::api::time();
    let expiry = now + expiry_days.unwrap_or(3) * 24 * 60 * 60 * 1_000_000_000; // ns

    let invite = StartupInvite {
        invite_id: invite_id.clone(),
        startup_name: startup_name.to_string(),
        accelerator_id: accelerator.id.clone(),
        program_name: program_name.clone(),
        invite_type,
        invite_code: invite_code.clone(),
        expiry,
        status: InviteStatus::Pending,
        created_at: now,
        used_at: None,
        email,
        registered_principal: None,
        registered_at: None,
    };

    // Store invite
    STARTUP_INVITES.with(|invites| {
        invites.borrow_mut().insert(StableString::new(&invite_id), invite.clone());
    });

    // Log activity
    ACCELERATORS.with(|accs| {
        let accs_mut = accs.borrow_mut();
        if let Some(mut acc) = accs_mut.get(&sp) {
            acc.invites_sent += 1;
            acc.recent_activity.push(Activity {
                timestamp: now,
                description: format!("Invite generated for {}", startup_name),
                activity_type: ActivityType::SentInvite,
            });
        }
    });

    Ok(invite)
}

// ---------------------------------------------------------
// 🧩 HELPER FUNCTIONS
// ---------------------------------------------------------

/// Check if an accelerator exists
fn accelerator_exists(accelerator_id: &String) -> bool {
    let sp = StablePrincipal::new(Principal::from_text(accelerator_id).unwrap());
    ACCELERATORS.with(|accs| {
        let accs_ref = accs.borrow();
        accs_ref.get(&sp).is_some()
    })
}

/// Increment invites_sent count for an accelerator
fn increment_accelerator_invite_count(accelerator_id: &String, count: u64) {
    let sp = StablePrincipal::new(Principal::from_text(accelerator_id).unwrap());
    ACCELERATORS.with(|accs| {
        let mut accs_mut = accs.borrow_mut();
        if let Some(mut acc) = accs_mut.get(&sp) {
            acc.invites_sent = acc.invites_sent.saturating_add(count as u32);
            accs_mut.insert(sp.clone(), acc); // write back
        }
    });
}

/// Check if the caller is admin or superadmin of any accelerator
fn is_admin_or_superadmin(caller: &Principal) -> bool {
    ACCELERATORS.with(|accs| {
        let accs_ref = accs.borrow();
        for (_key, acc) in accs_ref.iter() {
            if acc.team_members.iter().any(|m| {
                m.principal == Some(*caller)
                    && (m.role == Role::Admin || m.role == Role::SuperAdmin)
                    && m.status == MemberStatus::Active
            }) {
                return true;
            }
        }
        false
    })
}

/// Check if the caller is admin or superadmin of a specific accelerator
fn is_accel_admin(caller: &Principal, accelerator_id: &String) -> bool {
    let sp = StablePrincipal::new(Principal::from_text(accelerator_id).unwrap());
    ACCELERATORS.with(|accs| {
        let accs_ref = accs.borrow();
        if let Some(acc) = accs_ref.get(&sp) {
            acc.team_members.iter().any(|m| {
                m.principal == Some(*caller)
                    && (m.role == Role::Admin || m.role == Role::SuperAdmin)
                    && m.status == MemberStatus::Active
            })
        } else {
            false
        }
    })
}

/// Check if a pending invite already exists for a startup email
fn invite_already_exists(accelerator_id: &String, email: &String) -> bool {
    let sp = StablePrincipal::new(Principal::from_text(accelerator_id).unwrap());
    STARTUP_INVITES.with(|invites| {
        let invites_ref = invites.borrow();
        for (_key, invite) in invites_ref.iter() {
            if invite.accelerator_id == sp
                && invite.email.as_ref() == Some(email)
                && invite.status == InviteStatus::Pending
            {
                return true;
            }
        }
        false
    })
}

/// Validate email format using regex
fn is_valid_email(email: &str) -> bool {
    let email_regex = Regex::new(r"^[^\s@]+@[^\s@]+\.[^\s@]+$").unwrap();
    email_regex.is_match(email)
}
