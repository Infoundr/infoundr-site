use crate::models::accelerator::{Accelerator, Role, TeamMember, MemberStatus, Activity, ActivityType};
use crate::models::stable_principal::StablePrincipal;
use crate::storage::memory::ACCELERATORS;
use candid::{CandidType, Deserialize};
use ic_cdk::{caller, update, query};
use rand::RngCore;
use rand::rngs::OsRng;
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};

// ==================================================================================================
// Accelerator Sign Up
// ===============================================================================================

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct AcceleratorSignUp {
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
pub fn get_my_accelerator(accelerator_id: String) -> Result<Option<Accelerator>, String> {
    let caller_principal = caller();
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == accelerator_id).map(|(_, v)| v.clone())
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
    pub accelerator_id: String,
    pub email: String,
    pub role: Role,
}

#[update]
pub fn invite_team_member(input: TeamMemberInviteWithId) -> Result<String, String> {
    let caller_principal = caller();
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == input.accelerator_id).map(|(_, v)| v.clone())
    });
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
        email: input.email,
        role: input.role,
        status: MemberStatus::Pending,
        token: Some(token.clone()),
        principal: None,
    });
    accelerator.invites_sent += 1;

    ACCELERATORS.with(|accs| {
        let key = accs.borrow().iter().find(|(k, _)| k.to_string() == input.accelerator_id).map(|(k, _)| k.clone());
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

#[query]
pub fn list_team_members(accelerator_id: String) -> Result<Vec<TeamMember>, String> {
    let caller_principal = caller();
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == accelerator_id).map(|(_, v)| v.clone())
    });
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
    pub accelerator_id: String,
    pub email: String,
    pub new_role: Role,
}

#[update]
pub fn update_team_member_role(input: UpdateTeamMemberRole) -> Result<(), String> {
    let caller_principal = caller();
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == input.accelerator_id).map(|(_, v)| v.clone())
    });
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
        let key = accs.borrow().iter().find(|(k, _)| k.to_string() == input.accelerator_id).map(|(k, _)| k.clone());
        if let Some(key) = key {
            accs.borrow_mut().insert(key, accelerator);
        }
    });
    Ok(())
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct RemoveTeamMember {
    pub accelerator_id: String,
    pub email: String,
}

#[update]
pub fn remove_team_member(input: RemoveTeamMember) -> Result<(), String> {
    let caller_principal = caller();
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == input.accelerator_id).map(|(_, v)| v.clone())
    });
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
        let key = accs.borrow().iter().find(|(k, _)| k.to_string() == input.accelerator_id).map(|(k, _)| k.clone());
        if let Some(key) = key {
            accs.borrow_mut().insert(key, accelerator);
        }
    });
    Ok(())
} 