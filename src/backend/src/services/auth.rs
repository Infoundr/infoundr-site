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
    USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(caller)))
}

// Helper function to check if user is authenticated
#[query]
pub fn check_auth() -> bool {
    let caller = caller();
    caller != Principal::anonymous()
} 