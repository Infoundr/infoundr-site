use crate::models::main_site_user::MainSiteUser;
use crate::models::stable_principal::StablePrincipal;
use crate::models::stable_string::StableString;
use crate::storage::memory::MAIN_SITE_USERS;
use ic_cdk::api::time;

/// Ensure a main site user exists in storage
pub fn ensure_main_site_user(main_site_id: String) -> MainSiteUser {
    MAIN_SITE_USERS.with(|users| {
        let mut users = users.borrow_mut();
        
        if let Some(existing_user) = users.get(&StableString::from(main_site_id.clone())) {
            // Update last interaction time
            let mut updated_user = existing_user.clone();
            updated_user.last_interaction = time();
            users.insert(StableString::from(main_site_id), updated_user.clone());
            updated_user
        } else {
            // Create new user
            let new_user = MainSiteUser {
                main_site_id: main_site_id.clone(),
                site_principal: None,
                first_interaction: time(),
                last_interaction: time(),
            };
            users.insert(StableString::from(main_site_id), new_user.clone());
            new_user
        }
    })
}

/// Link a main site user to a principal
pub fn link_main_site_user_to_principal(main_site_id: String, principal: candid::Principal) -> Result<(), String> {
    MAIN_SITE_USERS.with(|users| {
        let mut users = users.borrow_mut();
        
        if let Some(mut user) = users.get(&StableString::from(main_site_id.clone())) {
            user.site_principal = Some(StablePrincipal::from(principal));
            users.insert(StableString::from(main_site_id), user);
            Ok(())
        } else {
            Err("Main site user not found".to_string())
        }
    })
}

/// Get main site user by ID
pub fn get_main_site_user(main_site_id: &str) -> Option<MainSiteUser> {
    MAIN_SITE_USERS.with(|users| {
        let users = users.borrow();
        users.get(&StableString::from(main_site_id.to_string()))
    })
}
