use crate::models::waitlist::{WaitlistEntry, WaitlistStatus};
use crate::storage::memory::WAITLIST;
use crate::models::stable_string::StableString;

pub fn join_waitlist(email: String, name: String) -> Result<WaitlistEntry, String> {
    if WAITLIST.with(|w| w.borrow().contains_key(&StableString::new(email.clone()))) {
        return Err("Email already on waitlist".to_string());
    }

    let entry = WaitlistEntry {
        email: email.clone(),
        name,
        created_at: ic_cdk::api::time(),
        status: WaitlistStatus::Pending,
    };

    WAITLIST.with(|w| w.borrow_mut().insert(StableString::new(email), entry.clone()));
    Ok(entry)
} 