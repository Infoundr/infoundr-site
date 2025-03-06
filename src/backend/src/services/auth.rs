use crate::models::user::{User, SubscriptionTier};
use crate::storage::memory::USERS;
use crate::models::stable_principal::StablePrincipal;

pub fn register_user(email: String, name: String) -> Result<User, String> {
    let caller = ic_cdk::caller();
    if USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(caller))) {
        return Err("User already exists".to_string());
    }

    let user = User {
        principal: StablePrincipal::new(caller),
        email,
        name,
        created_at: ic_cdk::api::time(),
        subscription_tier: SubscriptionTier::Free,
    };

    USERS.with(|users| users.borrow_mut().insert(StablePrincipal::new(caller), user.clone()));
    Ok(user)
} 