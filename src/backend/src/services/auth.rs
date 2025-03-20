use candid::Principal;
use ic_cdk::caller;
use crate::models::user::User;
use crate::storage::memory::USERS;
use ic_cdk::api::time;
use ic_cdk::{query, update};
use crate::models::stable_principal::StablePrincipal;
use crate::models::user::SubscriptionTier;

#[update]
pub fn register_user(name: String) -> Result<User, String> {
    let caller = caller();
    
    // Check if user already exists
    if USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(caller))) {
        return Err("User already exists".to_string());
    }

    let user = User {
        principal: StablePrincipal::new(caller),
        name,
        email: None,
        created_at: time(),
        subscription_tier: SubscriptionTier::Free,
    };

    USERS.with(|users| users.borrow_mut().insert(StablePrincipal::new(caller), user.clone()));
    Ok(user)
}

#[query]
pub fn get_current_user() -> Option<User> {
    let caller = caller();
    USERS.with(|users| users.borrow().get(&StablePrincipal::new(caller)))
}

#[query]
pub fn is_registered() -> bool {
    let caller = caller();
    ic_cdk::println!("Checking registration for principal: {}", caller.to_string());
    USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(caller)))
}

// Helper function to check if user is authenticated
#[query]
pub fn check_auth() -> bool {
    let caller = caller();
    caller != Principal::anonymous()
}

#[update]
pub fn register_openchat_user(name: String, openchat_principal: String) -> Result<User, String> {
    let caller = caller();
    let openchatprincipal = Principal::from_text(&openchat_principal).unwrap();
    
    // Only allow authenticated users to register
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot register".to_string());
    }
    
    // Check if user already exists with this OpenChat principal
    if USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(openchatprincipal))) {
        return Err("User with this OpenChat ID already exists".to_string());
    }

    let user = User {
        principal: StablePrincipal::new(openchatprincipal),
        name,
        email: None,
        created_at: time(),
        subscription_tier: SubscriptionTier::Free,
    };

    USERS.with(|users| users.borrow_mut().insert(StablePrincipal::new(openchatprincipal), user.clone()));
    
    Ok(user)
}

// Helper function to get user by OpenChat principal
#[query]
pub fn get_user_by_openchat_id(openchat_principal: Principal) -> Option<User> {
    USERS.with(|users| users.borrow().get(&StablePrincipal::new(openchat_principal)))
}

// Helper to check if OpenChat user exists
#[query]
pub fn is_openchat_user_registered(openchat_principal: Principal) -> bool {
    USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(openchat_principal)))
} 