use crate::models::stable_string::StableString;
use crate::models::waitlist::{WaitlistEntry, WaitlistStatus};
use crate::storage::memory::WAITLIST;
use ic_cdk::update;

#[update]
pub fn join_waitlist(name: String) -> Result<WaitlistEntry, String> {
    let caller = ic_cdk::caller();
    let principal_id = caller.to_string();

    if WAITLIST.with(|w| {
        w.borrow()
            .contains_key(&StableString::new(principal_id.clone()))
    }) {
        return Err("Principal already on waitlist".to_string());
    }

    let entry = WaitlistEntry {
        email: principal_id.clone(),
        name,
        created_at: ic_cdk::api::time(),
        status: WaitlistStatus::Pending,
    };

    WAITLIST.with(|w| {
        w.borrow_mut()
            .insert(StableString::new(principal_id), entry.clone())
    });
    Ok(entry)
}

// async fn send_verification_email(email: &str, token: &str) -> Result<(), String> {
//     // Implement email sending logic here
//     // You might want to use an SMTP service or a third-party email service
//     Ok(())
// }

// fn generate_verification_token() -> String {
//     // Implement secure token generation
//     uuid::Uuid::new_v4().to_string()
// }
