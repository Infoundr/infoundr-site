use crate::models::slack_user::SlackUser;
use crate::models::stable_principal::StablePrincipal;
use crate::models::stable_string::StableString;
use crate::storage::memory::SLACK_USERS;
use candid::Principal;
use ic_cdk::{query, update};

#[update]
pub fn ensure_slack_user(slack_id: String) {
    SLACK_USERS.with(|users| {
        let mut users = users.borrow_mut();
        if !users.contains_key(&StableString::from(slack_id.clone())) {
            let user = SlackUser {
                slack_id: slack_id.clone(),
                site_principal: None,
                display_name: None,
                team_id: None,
            };
            users.insert(StableString::from(slack_id), user);
        }
    });
}

#[query]
pub fn get_slack_user(slack_id: String) -> Option<SlackUser> {
    SLACK_USERS.with(|users| {
        users
            .borrow()
            .get(&StableString::from(slack_id))
            .map(|user| user.clone())
    })
}

#[query]
pub fn get_slack_user_by_principal(principal: Principal) -> Option<SlackUser> {
    SLACK_USERS.with(|users| {
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
pub fn is_slack_user_registered(slack_id: String) -> bool {
    SLACK_USERS.with(|users| {
        users
            .borrow()
            .get(&StableString::from(slack_id))
            .is_some()
    })
}

#[query]
pub fn get_registered_slack_users() -> Vec<SlackUser> {
    SLACK_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .map(|(_, user)| user.clone())
            .collect()
    })
} 