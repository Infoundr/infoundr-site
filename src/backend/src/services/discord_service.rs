use crate::models::discord_user::DiscordUser;
// use crate::models::stable_principal::StablePrincipal;
use crate::models::stable_string::StableString;
use crate::storage::memory::DISCORD_USERS;
use candid::Principal;
use ic_cdk::{query, update};

#[update]
pub fn ensure_discord_user(discord_id: String) {
    DISCORD_USERS.with(|users| {
        let mut users = users.borrow_mut();
        if !users.contains_key(&StableString::from(discord_id.clone())) {
            let user = DiscordUser {
                discord_id: discord_id.clone(),
                site_principal: None,
                username: None,
                guild_id: None,
            };
            users.insert(StableString::from(discord_id), user);
        }
    });
}

#[query]
pub fn get_discord_user(discord_id: String) -> Option<DiscordUser> {
    DISCORD_USERS.with(|users| {
        users
            .borrow()
            .get(&StableString::from(discord_id))
            .map(|user| user.clone())
    })
}

#[query]
pub fn get_discord_user_by_principal(principal: Principal) -> Option<DiscordUser> {
    DISCORD_USERS.with(|users| {
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
pub fn is_discord_user_registered(discord_id: String) -> bool {
    DISCORD_USERS.with(|users| {
        users
            .borrow()
            .get(&StableString::from(discord_id))
            .is_some()
    })
}

#[query]
pub fn get_registered_discord_users() -> Vec<DiscordUser> {
    DISCORD_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .map(|(_, user)| user.clone())
            .collect()
    })
} 