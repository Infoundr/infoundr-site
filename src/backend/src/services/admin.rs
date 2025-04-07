use crate::models::stable_principal::StablePrincipal;
use crate::models::user::User;
use crate::models::waitlist::WaitlistEntry;
use crate::storage::memory::{USERS, WAITLIST};
use candid::Principal;
use ic_cdk::caller;
use ic_cdk::query;

// Admin callers
#[query]
pub fn is_allowed_principal() -> bool {
    let allowed_principals = vec![
        Principal::from_text("b3sqw-op7sx-26m67-mieei-h5cg4-qagvd-tpwkw-r2up5-dvtna-yp6dt-oqe")
            .unwrap(),
        Principal::from_text("hicyl-bvh4m-2x5wf-ozwt3-4kegq-nx5qh-neq7r-t46dn-e4ygv-kgf2r-6qe")
            .unwrap(),
        Principal::from_text("vgsl4-yf65u-gceur-wws44-arng2-vzjja-ozb5k-vs2cq-3cpay-3y3er-qqe")
            .unwrap(),
    ];

    let caller_principal = caller();
    ic_cdk::println!("Caller Principal: {}", caller_principal.to_string());
    ic_cdk::println!("Allowed Principals:");
    for principal in &allowed_principals {
        ic_cdk::println!("  {}", principal.to_string());
    }
    let is_allowed = allowed_principals.contains(&caller_principal);
    ic_cdk::println!("Is Allowed: {}", is_allowed);
    is_allowed
}

// Function to get total number of registered users
#[query]
pub fn get_registered_users() -> Result<Vec<User>, String> {
    // Get all registered users without admin check
    let users = USERS.with(|u| {
        u.borrow()
            .iter()
            .map(|(_, user)| user.clone())
            .collect::<Vec<User>>()
    });

    Ok(users)
}

#[query]
pub fn is_admin() -> bool {
    ic_cdk::println!("Checking admin status for: {}", caller().to_string());
    let result = is_allowed_principal();
    ic_cdk::println!("Admin check result: {}", result);
    result
}

#[query]
pub fn get_waitlist() -> Result<Vec<WaitlistEntry>, String> {
    // if !is_allowed_principal() {
    //     return Err("Unauthorized: Caller is not an admin".to_string());
    // }

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
    if !is_allowed_principal() {
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
    // Return hardcoded admins
    vec![
        Principal::from_text("b3sqw-op7sx-26m67-mieei-h5cg4-qagvd-tpwkw-r2up5-dvtna-yp6dt-oqe")
            .unwrap(),
        Principal::from_text("hicyl-bvh4m-2x5wf-ozwt3-4kegq-nx5qh-neq7r-t46dn-e4ygv-kgf2r-6qe")
            .unwrap(),
        Principal::from_text("vgsl4-yf65u-gceur-wws44-arng2-vzjja-ozb5k-vs2cq-3cpay-3y3er-qqe")
            .unwrap(),
    ]
    .into_iter()
    .map(StablePrincipal::from)
    .collect()
}
