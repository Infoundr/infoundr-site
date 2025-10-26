use crate::models::stable_principal::StablePrincipal;
use crate::models::user::{User, SubscriptionTier};
use crate::storage::memory::{USERS, OPENCHAT_USERS, SLACK_USERS, DISCORD_USERS};
use candid::Principal;
use ic_cdk::{query, update, api::time};

/// Ensure a user exists in the USERS table, create one if they don't
fn ensure_user_exists(caller_principal: Principal) -> Result<User, String> {
    let stable_principal = StablePrincipal::from(caller_principal);
    
    // Check if user already exists
    if let Some(user) = USERS.with(|users| users.borrow().get(&stable_principal)) {
        return Ok(user);
    }
    
    // User doesn't exist, create one
    ic_cdk::println!("User not found, creating new user for principal: {:?}", caller_principal);
    
    // Try to find platform-specific user data
    let openchat_id = OPENCHAT_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller_principal))
            .map(|(id, _)| id.as_str().to_string())
    });
    
    let slack_id = SLACK_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller_principal))
            .map(|(id, _)| id.as_str().to_string())
    });
    
    let discord_id = DISCORD_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller_principal))
            .map(|(id, _)| id.as_str().to_string())
    });
    
    // Determine default name based on platform
    let default_name = if slack_id.is_some() {
        format!("Slack User {}", slack_id.as_ref().unwrap())
    } else if discord_id.is_some() {
        format!("Discord User {}", discord_id.as_ref().unwrap())
    } else if openchat_id.is_some() {
        format!("OpenChat User {}", openchat_id.as_ref().unwrap())
    } else {
        "User".to_string()
    };
    
    let new_user = User {
        principal: stable_principal.clone(),
        name: default_name,
        email: None,
        created_at: time(),
        subscription_tier: SubscriptionTier::Free,
        openchat_id,
        slack_id,
        discord_id,
    };
    
    // Insert the new user
    USERS.with(|users| {
        users.borrow_mut().insert(stable_principal, new_user.clone());
    });
    
    ic_cdk::println!("Created new user: {}", new_user.name);
    Ok(new_user)
}

/// Update user display name
#[update]
pub fn update_display_name(new_name: String) -> Result<(), String> {
    let caller_principal = ic_cdk::caller();
    let stable_principal = StablePrincipal::from(caller_principal);
    
    ic_cdk::println!("Updating display name for principal: {:?}", caller_principal);
    ic_cdk::println!("New name: {}", new_name);
    
    // Validate the name
    if new_name.trim().is_empty() {
        return Err("Display name cannot be empty".to_string());
    }
    
    if new_name.len() > 100 {
        return Err("Display name cannot exceed 100 characters".to_string());
    }
    
    // Ensure user exists
    ensure_user_exists(caller_principal)?;
    
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        
        if let Some(mut user) = users.get(&stable_principal) {
            let old_name = user.name.clone();
            user.name = new_name.trim().to_string();
            users.insert(stable_principal, user);
            
            ic_cdk::println!("Successfully updated display name from '{}' to '{}'", old_name, new_name.trim());
            Ok(())
        } else {
            ic_cdk::println!("User not found for principal: {:?}", caller_principal);
            Err("User not found".to_string())
        }
    })
}

/// Get current user's display name
#[query]
pub fn get_display_name() -> Result<String, String> {
    let caller_principal = ic_cdk::caller();
    let stable_principal = StablePrincipal::from(caller_principal);
    
    // Ensure user exists first
    ensure_user_exists(caller_principal)?;
    
    USERS.with(|users| {
        let users = users.borrow();
        
        if let Some(user) = users.get(&stable_principal) {
            Ok(user.name.clone())
        } else {
            Err("User not found".to_string())
        }
    })
}

/// Get current user's profile information
#[query]
pub fn get_user_profile() -> Result<crate::models::user::User, String> {
    let caller_principal = ic_cdk::caller();
    let stable_principal = StablePrincipal::from(caller_principal);
    
    // Ensure user exists first
    ensure_user_exists(caller_principal)?;
    
    USERS.with(|users| {
        let users = users.borrow();
        
        if let Some(user) = users.get(&stable_principal) {
            Ok(user.clone())
        } else {
            Err("User not found".to_string())
        }
    })
}

/// Update user email
#[update]
pub fn update_email(new_email: String) -> Result<(), String> {
    let caller_principal = ic_cdk::caller();
    let stable_principal = StablePrincipal::from(caller_principal);
    
    ic_cdk::println!("Updating email for principal: {:?}", caller_principal);
    ic_cdk::println!("New email: {}", new_email);
    
    // Basic email validation
    if !new_email.contains('@') || new_email.len() < 5 {
        return Err("Invalid email format".to_string());
    }
    
    if new_email.len() > 255 {
        return Err("Email cannot exceed 255 characters".to_string());
    }
    
    // Ensure user exists first
    ensure_user_exists(caller_principal)?;
    
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        
        if let Some(mut user) = users.get(&stable_principal) {
            let old_email = user.email.clone();
            user.email = Some(new_email.trim().to_string());
            users.insert(stable_principal, user);
            
            ic_cdk::println!("Successfully updated email from '{:?}' to '{}'", old_email, new_email.trim());
            Ok(())
        } else {
            ic_cdk::println!("User not found for principal: {:?}", caller_principal);
            Err("User not found".to_string())
        }
    })
}
