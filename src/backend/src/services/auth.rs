use crate::models::stable_principal::StablePrincipal;
// use crate::models::stable_string::StableString;
use crate::models::user::SubscriptionTier;
use crate::models::user::User;
use crate::storage::memory::{OPENCHAT_USERS, USERS, SLACK_USERS, DISCORD_USERS, ACCELERATORS, STARTUPS};
use candid::Principal;
use ic_cdk::api::time;
use ic_cdk::caller;
use ic_cdk::{query, update};

#[update]
pub fn register_user(name: String) -> Result<User, String> {
    let caller = caller();

    if USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(caller))) {
        return Err("User already exists".to_string());
    }

    let openchat_id = OPENCHAT_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller))
            .map(|(id, _)| id.as_str().to_string())
    });
    let slack_id = SLACK_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller))
            .map(|(id, _)| id.as_str().to_string())
    });
    let discord_id = DISCORD_USERS.with(|users| {
        users
            .borrow()
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
        openchat_id,
        slack_id,
        discord_id,
    };

    USERS.with(|users| {
        users
            .borrow_mut()
            .insert(StablePrincipal::new(caller), user.clone())
    });
    Ok(user)
}

#[update]
pub fn register_startup(startup_name: String, founder_name: String, email: String) -> Result<User, String> {
    let caller = caller();

    if USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(caller))) {
        return Err("User already exists".to_string());
    }

    let openchat_id = OPENCHAT_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller))
            .map(|(id, _)| id.as_str().to_string())
    });
    let slack_id = SLACK_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller))
            .map(|(id, _)| id.as_str().to_string())
    });
    let discord_id = DISCORD_USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller))
            .map(|(id, _)| id.as_str().to_string())
    });

    let user = User {
        principal: StablePrincipal::new(caller),
        name: format!("{} ({})", startup_name, founder_name),
        email: Some(email),
        created_at: time(),
        subscription_tier: SubscriptionTier::Free,
        openchat_id,
        slack_id,
        discord_id,
    };

    USERS.with(|users| {
        users
            .borrow_mut()
            .insert(StablePrincipal::new(caller), user.clone())
    });
    Ok(user)
}

#[query]
pub fn get_current_user() -> Option<User> {
    let caller = caller();

    let direct_user = USERS.with(|users| {
        users
            .borrow()
            .get(&StablePrincipal::new(caller))
            .map(|u| u.clone())
    });

    if direct_user.is_some() {
        return direct_user;
    }

    // If not found, check if this is an OpenChat user
    let openchat_user = OPENCHAT_USERS.with(|users| {
        let users = users.borrow();
        for (openchat_id, openchat_user) in users.iter() {
            if openchat_user.site_principal.as_ref().map(|p| p.get()) == Some(caller) {
                return Some((openchat_id.as_str().to_string(), openchat_user.first_interaction));
            }
        }
        None
    });
    if let Some((openchat_id, created_at)) = openchat_user {
        return Some(User {
            principal: StablePrincipal::new(caller),
            name: format!("OpenChat User {}", openchat_id),
            email: None,
            created_at,
            subscription_tier: SubscriptionTier::Free,
            openchat_id: Some(openchat_id),
            slack_id: None,
            discord_id: None,
        });
    }

    let slack_user = SLACK_USERS.with(|users| {
        let users = users.borrow();
        for (slack_id, slack_user) in users.iter() {
            if slack_user.site_principal.as_ref().map(|p| p.get()) == Some(caller) {
                return Some((slack_id.as_str().to_string(), slack_user.display_name.clone(), slack_user.team_id.clone()));
            }
        }
        None
    });
    if let Some((slack_id, _display_name, _team_id)) = slack_user {
        return Some(User {
            principal: StablePrincipal::new(caller),
            name: format!("Slack User {}", slack_id),
            email: None,
            created_at: time(),
            subscription_tier: SubscriptionTier::Free,
            openchat_id: None,
            slack_id: Some(slack_id),
            discord_id: None,
        });
    }

    let discord_user = DISCORD_USERS.with(|users| {
        let users = users.borrow();
        for (discord_id, discord_user) in users.iter() {
            if discord_user.site_principal.as_ref().map(|p| p.get()) == Some(caller) {
                return Some((discord_id.as_str().to_string(), discord_user.username.clone(), discord_user.guild_id.clone()));
            }
        }
        None
    });
    if let Some((discord_id, _username, _guild_id)) = discord_user {
        return Some(User {
            principal: StablePrincipal::new(caller),
            name: format!("Discord User {}", discord_id),
            email: None,
            created_at: time(), // You may want to store first_interaction in DiscordUser for accuracy
            subscription_tier: SubscriptionTier::Free,
            openchat_id: None,
            slack_id: None,
            discord_id: Some(discord_id),
        });
    }

    // If not found, check if this is an Accelerator
    let accelerator = ACCELERATORS.with(|accelerators| {
        let accelerators = accelerators.borrow();
        for (accelerator_id, accelerator) in accelerators.iter() {
            if accelerator.id.get() == caller {
                return Some((accelerator_id.to_string(), accelerator.name.clone(), accelerator.email.clone()));
            }
        }
        None
    });
    if let Some((_accelerator_id, name, email)) = accelerator {
        return Some(User {
            principal: StablePrincipal::new(caller),
            name: format!("Accelerator: {}", name),
            email: Some(email),
            created_at: time(),
            subscription_tier: SubscriptionTier::Free,
            openchat_id: None,
            slack_id: None,
            discord_id: None,
        });
    }

    let startup = STARTUPS.with(|startups| {
        let startups = startups.borrow();
        for (startup_id, startup) in startups.iter() {
            if startup.founder_principal.get() == caller {
                return Some((startup_id.as_str().to_string(), startup.name.clone(), startup.contact_email.clone()));
            }
        }
        None
    });
    if let Some((_startup_id, name, email)) = startup {
        return Some(User {
            principal: StablePrincipal::new(caller),
            name: format!("Startup: {}", name),
            email: Some(email),
            created_at: time(),
            subscription_tier: SubscriptionTier::Free,
            openchat_id: None,
            slack_id: None,
            discord_id: None,
        });
    }

    None
}

#[query]
pub fn is_registered() -> bool {
    let caller = caller();

    // Check USERS, OPENCHAT_USERS, SLACK_USERS, DISCORD_USERS
    USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(caller)))
        || OPENCHAT_USERS.with(|users| {
            users
                .borrow()
                .iter()
                .any(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller))
        })
        || SLACK_USERS.with(|users| {
            users
                .borrow()
                .iter()
                .any(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller))
        })
        || DISCORD_USERS.with(|users| {
            users
                .borrow()
                .iter()
                .any(|(_, user)| user.site_principal.as_ref().map(|p| p.get()) == Some(caller))
        })
        || ACCELERATORS.with(|users| {
            users
                .borrow()
                .iter()
                .any(|(_, user)| user.id.get() == caller)
        })
        || STARTUPS.with(|startups| {
            startups
                .borrow()
                .iter()
                .any(|(_, startup)| startup.founder_principal.get() == caller)
        })
}

#[query]
pub fn check_auth() -> bool {
    let caller = caller();
    if caller == Principal::anonymous() {
        return false;
    }

    is_registered()
}

// This function is now deprecated as we handle OpenChat users differently
// #[update]
// pub fn register_openchat_user(name: String, openchat_principal: String) -> Result<User, String> {
//     // ... remove this function as it's no longer needed
// }

// #[query]
// pub fn get_user_by_openchat_id(openchat_id: String) -> Option<User> {
//     // First check if there's a linked user
//     OPENCHAT_USERS.with(|users| {
//         users
//             .borrow()
//             .get(&StableString::from(openchat_id.clone()))
//             .and_then(|openchat_user| openchat_user.site_principal.as_ref().map(|p| p.get()))
//             .and_then(|principal| {
//                 USERS.with(|users| {
//                     users
//                         .borrow()
//                         .get(&StablePrincipal::new(principal))
//                         .map(|u| u.clone())
//                 })
//             })
//     })
// }

// // Helper to check if OpenChat user exists
// #[query]
// pub fn is_openchat_user_registered(openchat_id: String) -> bool {
//     OPENCHAT_USERS.with(|users| {
//         users
//             .borrow()
//             .contains_key(&StableString::from(openchat_id))
//     })
// }
