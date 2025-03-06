mod models;
mod storage;
mod services;

use crate::storage::memory::{USERS, WAITLIST, CHAT_HISTORY};
use ic_cdk::storage::{stable_save, stable_restore};
use crate::models::{
    stable_principal::StablePrincipal,
    stable_string::StableString,
    user::User,
    waitlist::WaitlistEntry,
    chat::ChatMessage
};

#[ic_cdk::update]
fn register_user(email: String, name: String) -> Result<User, String> {
    services::auth::register_user(email, name)
}

#[ic_cdk::update]
fn join_waitlist(email: String, name: String) -> Result<models::waitlist::WaitlistEntry, String> {
    services::waitlist::join_waitlist(email, name)
}

#[ic_cdk::pre_upgrade]
fn pre_upgrade() {
    let users = USERS.with(|users| users.borrow().iter().collect::<Vec<_>>());
    let waitlist = WAITLIST.with(|w| w.borrow().iter().collect::<Vec<_>>());
    let chat_history = CHAT_HISTORY.with(|h| h.borrow().iter().collect::<Vec<_>>());

    stable_save((users, waitlist, chat_history))
        .expect("Failed to save stable state");
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    let (users, waitlist, chat_history): (
        Vec<(StablePrincipal, User)>,
        Vec<(StableString, WaitlistEntry)>,
        Vec<((StablePrincipal, u64), ChatMessage)>
    ) = stable_restore()
        .expect("Failed to restore stable state");

    // Restore users
    USERS.with(|u| {
        let mut u = u.borrow_mut();
        for (k, v) in users {
            u.insert(k, v);
        }
    });

    // Restore waitlist
    WAITLIST.with(|w| {
        let mut w = w.borrow_mut();
        for (k, v) in waitlist {
            w.insert(k, v);
        }
    });

    // Restore chat history
    CHAT_HISTORY.with(|h| {
        let mut h = h.borrow_mut();
        for (k, v) in chat_history {
            h.insert(k, v);
        }
    });
}

ic_cdk::export_candid!();
