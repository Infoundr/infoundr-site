use crate::models::stable_principal::StablePrincipal;
use crate::models::user::User;
use crate::models::waitlist::WaitlistEntry;
use crate::models::accelerator::Accelerator;
use crate::models::slack_user::SlackUser;
use crate::models::discord_user::DiscordUser;
use crate::models::chat::ChatMessage;
use crate::storage::memory::{USERS, WAITLIST, ACCELERATORS};
use candid::Principal;
use ic_cdk::{caller, query, update};
use crate::services::slack_service::get_registered_slack_users;
use crate::services::discord_service::get_registered_discord_users;
use crate::services::account_service::{get_chat_history, UserIdentifier};

// Admin callers
#[query]
pub fn is_allowed_principal() -> bool {
    let allowed_principals = vec![
        Principal::from_text("b3sqw-op7sx-26m67-mieei-h5cg4-qagvd-tpwkw-r2up5-dvtna-yp6dt-oqe")
            .unwrap(),
        Principal::from_text("hicyl-bvh4m-2x5wf-ozwt3-4kegq-nx5qh-neq7r-t46dn-e4ygv-kgf2r-6qe")
            .unwrap(),
        Principal::from_text("vgsl4-yf65u-gceur-wws44-arng2-vzjja-ozb5k-vs2cq-3cpay-3y3er-qqe")
            .unwrap(),
    ];

    let caller_principal = caller();
    ic_cdk::println!("Caller Principal: {}", caller_principal.to_string());
    ic_cdk::println!("Allowed Principals:");
    for principal in &allowed_principals {
        ic_cdk::println!("  {}", principal.to_string());
    }
    let is_allowed = allowed_principals.contains(&caller_principal);
    ic_cdk::println!("Is Allowed: {}", is_allowed);
    is_allowed
}

// Function to get total number of registered users
#[query]
pub fn get_registered_users() -> Result<Vec<User>, String> {
    // Get all registered users without admin check
    let users = USERS.with(|u| {
        u.borrow()
            .iter()
            .map(|(_, user)| user.clone())
            .collect::<Vec<User>>()
    });

    Ok(users)
}

#[query]
pub fn is_admin() -> bool {
    ic_cdk::println!("Checking admin status for: {}", caller().to_string());
    let result = is_allowed_principal();
    ic_cdk::println!("Admin check result: {}", result);
    result
}

#[query]
pub fn get_waitlist() -> Result<Vec<WaitlistEntry>, String> {
    // if !is_allowed_principal() {
    //     return Err("Unauthorized: Caller is not an admin".to_string());
    // }

    let entries = WAITLIST.with(|w| {
        w.borrow()
            .iter()
            .map(|(_, entry)| entry)
            .collect::<Vec<WaitlistEntry>>()
    });

    Ok(entries)
}

#[query]
pub fn get_users() -> Result<Vec<User>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let users = USERS.with(|u| {
        u.borrow()
            .iter()
            .map(|(_, user)| user)
            .collect::<Vec<User>>()
    });

    Ok(users)
}

#[query]
pub fn get_admins() -> Vec<StablePrincipal> {
    // Return hardcoded admins
    vec![
        Principal::from_text("b3sqw-op7sx-26m67-mieei-h5cg4-qagvd-tpwkw-r2up5-dvtna-yp6dt-oqe")
            .unwrap(),
        Principal::from_text("hicyl-bvh4m-2x5wf-ozwt3-4kegq-nx5qh-neq7r-t46dn-e4ygv-kgf2r-6qe")
            .unwrap(),
        Principal::from_text("vgsl4-yf65u-gceur-wws44-arng2-vzjja-ozb5k-vs2cq-3cpay-3y3er-qqe")
            .unwrap(),
    ]
    .into_iter()
    .map(StablePrincipal::from)
    .collect()
}

#[query]
pub fn get_all_accelerators() -> Result<Vec<Accelerator>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let accelerators = ACCELERATORS.with(|accs| {
        accs.borrow()
            .iter()
            .map(|(_, accelerator)| accelerator.clone())
            .collect::<Vec<Accelerator>>()
    });

    Ok(accelerators)
}

#[update]
pub fn delete_accelerator(accelerator_id: Principal) -> Result<(), String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let stable_id = StablePrincipal::new(accelerator_id);
    
    // Check if accelerator exists
    let exists = ACCELERATORS.with(|accs| accs.borrow().contains_key(&stable_id));
    if !exists {
        return Err("Accelerator not found".to_string());
    }

    // Delete the accelerator
    ACCELERATORS.with(|accs| accs.borrow_mut().remove(&stable_id));
    Ok(())
}

#[update]
pub fn admin_update_accelerator(accelerator_id: Principal, updates: crate::services::accelerator_service::AcceleratorUpdate) -> Result<(), String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let stable_id = StablePrincipal::new(accelerator_id);
    
    // Get the current accelerator
    let mut accelerator = ACCELERATORS.with(|accs| accs.borrow().get(&stable_id))
        .ok_or("Accelerator not found")?;

    // Apply updates
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

    // Save the updated accelerator
    ACCELERATORS.with(|accs| accs.borrow_mut().insert(stable_id, accelerator));
    Ok(())
}

#[query]
pub fn get_accelerator_by_id(accelerator_id: Principal) -> Result<Option<Accelerator>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }

    let stable_id = StablePrincipal::new(accelerator_id);
    let accelerator = ACCELERATORS.with(|accs| accs.borrow().get(&stable_id));
    Ok(accelerator)
}

#[query]
pub fn admin_get_all_slack_users() -> Result<Vec<SlackUser>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    Ok(get_registered_slack_users())
}

#[query]
pub fn admin_get_all_discord_users() -> Result<Vec<DiscordUser>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    Ok(get_registered_discord_users())
}

#[query]
pub fn admin_get_all_slack_messages() -> Result<Vec<ChatMessage>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    let users = get_registered_slack_users();
    let mut all_messages = Vec::new();
    for user in users {
        let messages = get_chat_history(UserIdentifier::SlackId(user.slack_id));
        all_messages.extend(messages);
    }
    Ok(all_messages)
}

#[query]
pub fn admin_get_all_discord_messages() -> Result<Vec<ChatMessage>, String> {
    if !is_allowed_principal() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    let users = get_registered_discord_users();
    let mut all_messages = Vec::new();
    for user in users {
        let messages = get_chat_history(UserIdentifier::DiscordId(user.discord_id));
        all_messages.extend(messages);
    }
    Ok(all_messages)
}