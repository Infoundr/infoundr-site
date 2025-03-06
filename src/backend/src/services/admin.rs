use crate::models::stable_principal::StablePrincipal;
use crate::models::user::User;
use crate::models::waitlist::WaitlistEntry;
use crate::storage::memory::{USERS, WAITLIST, ADMINS};
use ic_cdk::caller;
use crate::models::admin::Admin;
use candid::Principal;
use ic_cdk::{ update, query };


#[query]
pub fn is_admin() -> bool {
    let caller = caller();
    ADMINS.with(|admins| admins.borrow().contains_key(&StablePrincipal::from(caller)))
}

#[update]
pub fn initialize_admin() {
    let caller = caller();
    ADMINS.with(|admins| admins.borrow_mut().insert(StablePrincipal::from(caller), Admin { principal_id: caller.to_string(), created_at: 0 }));
}

#[update]
pub fn add_admin(principal: Principal) -> Result<(), String> {
    if !is_admin() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    ADMINS.with(|admins| admins.borrow_mut().insert(StablePrincipal::from(principal), Admin { principal_id: principal.to_string(), created_at: 0 }));
    Ok(())
}

#[query]
pub fn get_waitlist() -> Result<Vec<WaitlistEntry>, String> {
    if !is_admin() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    
    let entries = WAITLIST.with(|w| {
        w.borrow()
         .iter()
         .map(|(_, entry)| entry)
         .collect::<Vec<WaitlistEntry>>()
    });
    
    Ok(entries)
}

#[query]
pub fn get_users() -> Result<Vec<User>, String> {
    if !is_admin() {
        return Err("Unauthorized: Caller is not an admin".to_string());
    }
    
    let users = USERS.with(|u| {
        u.borrow()
         .iter()
         .map(|(_, user)| user)
         .collect::<Vec<User>>()
    });
    
    Ok(users)
}

#[query]
pub fn get_admins() -> Vec<StablePrincipal> {
    ADMINS.with(|a| a.borrow().iter().map(|(k, _)| k).collect())
}

#[update]
pub fn save_admins() -> Vec<StablePrincipal> {
    ADMINS.with(|a| a.borrow().iter().map(|(k, _)| k).collect())
}

#[update]
pub fn restore_admins(admins: Vec<StablePrincipal>) {
    ADMINS.with(|a| {
        let mut a = a.borrow_mut();
        for admin in admins {
            a.insert(admin.clone(), Admin { principal_id: admin.to_string(), created_at: 0 });
        }
    });
}