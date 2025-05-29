use crate::models::openchat_user::OpenChatUser;
// use crate::models::stable_principal::StablePrincipal;
use crate::models::stable_string::StableString;
use crate::storage::memory::OPENCHAT_USERS;
use candid::Principal;
use ic_cdk::api::time;
use ic_cdk::{query, update};

#[update]
pub fn ensure_openchat_user(openchat_id: String) {
    OPENCHAT_USERS.with(|users| {
        let mut users = users.borrow_mut();
        if !users.contains_key(&StableString::from(openchat_id.clone())) {
            let user = OpenChatUser {
                openchat_id: openchat_id.clone(),
                site_principal: None,
                first_interaction: time(),
                last_interaction: time(),
            };
            users.insert(StableString::from(openchat_id), user);
        } else {
            // Update last interaction time
            if let Some(mut user) = users.get(&StableString::from(openchat_id.clone())) {
                user.last_interaction = time();
                users.insert(StableString::from(openchat_id), user);
            }
        }
    });
}

#[query]
pub fn get_registered_openchat_users() -> Vec<OpenChatUser> {
    OPENCHAT_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .map(|(_, user)| user.clone())
            .collect()
    })
}

#[query]
pub fn get_openchat_user(openchat_id: String) -> Option<OpenChatUser> {
    OPENCHAT_USERS.with(|users| {
        users
            .borrow()
            .get(&StableString::from(openchat_id))
            .map(|user| user.clone())
    })
}

#[query]
pub fn get_openchat_user_by_principal(principal: Principal) -> Option<OpenChatUser> {
    OPENCHAT_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| {
                user.site_principal
                    .as_ref()
                    .map(|p| p.get() == principal)
                    .unwrap_or(false)
            })
            .map(|(_, user)| user.clone())
    })
}

#[query]
pub fn get_active_openchat_users(since: u64) -> Vec<OpenChatUser> {
    OPENCHAT_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .filter(|(_, user)| user.last_interaction >= since)
            .map(|(_, user)| user.clone())
            .collect()
    })
}