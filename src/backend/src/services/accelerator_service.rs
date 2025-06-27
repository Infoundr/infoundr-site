use crate::models::accelerator::Accelerator;
use crate::models::stable_principal::StablePrincipal;
use crate::storage::memory::ACCELERATORS;
use candid::{CandidType, Deserialize};
use ic_cdk::{caller, update};

/// Input struct for sign-up (only required fields)
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct AcceleratorSignUp {
    pub name: String,
    pub website: String,
    pub email: String,
}

#[update]
pub fn sign_up_accelerator(input: AcceleratorSignUp) -> Result<(), String> {
    let caller_principal = caller();
    let accelerator_id = StablePrincipal::new(caller_principal);

    // Check if already exists
    let exists = ACCELERATORS.with(|accs| accs.borrow().contains_key(&accelerator_id));
    if exists {
        return Err("Accelerator with this principal already exists".to_string());
    }

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
        recent_activity: vec![],
    };

    ACCELERATORS.with(|accs| accs.borrow_mut().insert(accelerator_id, accelerator));
    Ok(())
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
    let accelerator_id = StablePrincipal::new(caller_principal);
    
    let accelerator = ACCELERATORS.with(|accs| accs.borrow().get(&accelerator_id));
    Ok(accelerator)
}

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

#[update]
pub fn update_my_accelerator(updates: AcceleratorUpdate) -> Result<(), String> {
    let caller_principal = caller();
    let accelerator_id = StablePrincipal::new(caller_principal);
    
    update_accelerator(accelerator_id, updates)
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