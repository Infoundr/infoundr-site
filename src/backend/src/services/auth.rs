use candid::Principal;
use ic_cdk::caller;
use crate::models::user::User;
use crate::storage::memory::{USERS, OPENCHAT_USERS};
use ic_cdk::api::time;
use ic_cdk::{query, update};
use crate::models::stable_principal::StablePrincipal;
use crate::models::user::SubscriptionTier;
use crate::models::stable_string::StableString;

#[update]
pub fn register_user(name: String) -> Result<User, String> {
    let caller = caller();
    
    // Check if user already exists
    if USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(caller))) {
        return Err("User already exists".to_string());
    }

    // Check if this principal is already linked to an OpenChat user
    let openchat_id = OPENCHAT_USERS.with(|users| {
        users.borrow()
            .iter()
            .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller))
            .map(|(id, _)| id.as_str().to_string())
    });

    let user = User {
        principal: StablePrincipal::new(caller),
        name,
        email: None,
        created_at: time(),
        subscription_tier: SubscriptionTier::Free,
        openchat_id, // Add this field to User struct
    };

    USERS.with(|users| users.borrow_mut().insert(StablePrincipal::new(caller), user.clone()));
    Ok(user)
}

#[query]
pub fn get_current_user() -> Option<User> {
    let caller = caller();
    
    // First try to get user directly
    let direct_user = USERS.with(|users| users.borrow().get(&StablePrincipal::new(caller)).map(|u| u.clone()));
    
    if direct_user.is_some() {
        return direct_user;
    }

    // If not found, check if this is an OpenChat user
    OPENCHAT_USERS.with(|users| {
        let users = users.borrow();
        for (openchat_id, openchat_user) in users.iter() {
            if openchat_user.site_principal.as_ref().map(|p| p.get()) == Some(caller) {
                // If found, return or create corresponding User
                return USERS.with(|users| {
                    let mut users = users.borrow_mut();
                    if let Some(user) = users.get(&StablePrincipal::new(caller)) {
                        Some(user.clone())
                    } else {
                        // Create new User entry for OpenChat user
                        let user = User {
                            principal: StablePrincipal::new(caller),
                            name: format!("OpenChat User {}", openchat_id.as_str()),
                            email: None,
                            created_at: openchat_user.first_interaction,
                            subscription_tier: SubscriptionTier::Free,
                            openchat_id: Some(openchat_id.as_str().to_string()),
                        };
                        users.insert(StablePrincipal::new(caller), user.clone());
                        Some(user)
                    }
                });
            }
        }
        None
    })
}

#[query]
pub fn is_registered() -> bool {
    let caller = caller();
    
    // Check both USERS and OPENCHAT_USERS
    USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(caller))) ||
    OPENCHAT_USERS.with(|users| {
        users.borrow()
            .iter()
            .any(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller))
    })
}

// Helper function to check if user is authenticated
#[query]
pub fn check_auth() -> bool {
    let caller = caller();
    if caller == Principal::anonymous() {
        return false;
    }
    
    // Check both regular registration and OpenChat registration
    is_registered()
}

// This function is now deprecated as we handle OpenChat users differently
// #[update]
// pub fn register_openchat_user(name: String, openchat_principal: String) -> Result<User, String> {
//     // ... remove this function as it's no longer needed
// }

#[query]
pub fn get_user_by_openchat_id(openchat_id: String) -> Option<User> {
    // First check if there's a linked user
    OPENCHAT_USERS.with(|users| {
        users.borrow()
            .get(&StableString::from(openchat_id.clone()))
            .and_then(|openchat_user| {
                openchat_user.site_principal.as_ref().map(|p| p.get())
            })
            .and_then(|principal| {
                USERS.with(|users| users.borrow().get(&StablePrincipal::new(principal)).map(|u| u.clone()))
            })
    })
}

// Helper to check if OpenChat user exists
#[query]
pub fn is_openchat_user_registered(openchat_id: String) -> bool {
    OPENCHAT_USERS.with(|users| {
        users.borrow().contains_key(&StableString::from(openchat_id))
    })
} 