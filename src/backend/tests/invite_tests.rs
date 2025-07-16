// Startup Invite Feature Tests
// ===========================

use candid::{encode_one, decode_one, Principal};
use pocket_ic::PocketIc;
use std::fs;

mod models;
use models::invite_tests::*;

// Test data constants
const TEST_ACCELERATOR_NAME: &str = "Test Accelerator";
const TEST_ACCELERATOR_WEBSITE: &str = "https://testaccelerator.com";
const TEST_ACCELERATOR_EMAIL: &str = "test@accelerator.com";
const BACKEND_WASM: &str = "../../target/wasm32-unknown-unknown/release/backend.wasm";
const INIT_CYCLES: u128 = 2_000_000_000_000;

fn setup() -> (PocketIc, Principal) {
    std::env::set_var("POCKET_IC_BIN", "/usr/local/bin/pocket-ic");
    let pic = PocketIc::new();
    let backend_canister = pic.create_canister();
    pic.add_cycles(backend_canister, INIT_CYCLES);
    let wasm = fs::read(BACKEND_WASM).expect("Wasm file not found, run 'dfx build'.");
    pic.install_canister(backend_canister, wasm, vec![], None);
    (pic, backend_canister)
}

// #[test]
// fn test_generate_and_accept_invite() {
//     let (pic, canister_id) = setup();

//     // 1. Register accelerator (SuperAdmin)
//     let signup_data = AcceleratorSignUp {
//         name: TEST_ACCELERATOR_NAME.to_string(),
//         website: TEST_ACCELERATOR_WEBSITE.to_string(),
//         email: TEST_ACCELERATOR_EMAIL.to_string(),
//     };
//     let _ = pic.update_call(
//         canister_id,
//         Principal::anonymous(),
//         "sign_up_accelerator",
//         encode_one(signup_data).unwrap(),
//     ).expect("Accelerator sign up failed");

//     // 2. Generate invite as SuperAdmin
//     let accelerator_id = Principal::anonymous().to_string();
//     println!("Accelerator ID: {}", accelerator_id);
//     let invite_input = GenerateStartupInviteInput {
//         startup_name: "Test Startup".to_string(),
//         program_name: "Test Program".to_string(),
//         accelerator_id: accelerator_id.clone(),
//         invite_type: InviteType::Link,
//         email: Some("founder@startup.com".to_string()),
//         expiry_days: Some(3),
//     };
//     let result = pic.update_call(
//         canister_id,
//         Principal::anonymous(),
//         "generate_startup_invite",
//         encode_one(invite_input).unwrap(),
//     ).expect("Invite generation failed");
//     println!("Invite result: {:?}", result);

//     let invite_result: Result<StartupInvite, String> = decode_one(&result).unwrap();
//     let invite = invite_result.expect("Invite generation should succeed");
//     let invite_code = &invite.invite_code;
//     println!("Invite code: {}", invite_code);

//     let new_principal = Principal::from_text("2vxsx-fae").unwrap();
//     let registration_input = StartupRegistrationInput {
//         invite_code: invite_code.to_string(),
//         startup_name: "Test Startup".to_string(),
//         founder_name: "Alice Founder".to_string(),
//         email: "founder@startup.com".to_string(),
//     };
//     let accept_result = pic.update_call(
//         canister_id,
//         new_principal,
//         "accept_startup_invite",
//         encode_one(registration_input).unwrap(),
//     );
//     println!("Accept result: {:?}", accept_result);
//     assert!(accept_result.is_ok(), "Invite acceptance should succeed");

//     let list_result = pic.query_call(
//         canister_id,
//         Principal::anonymous(),
//         "list_startup_invites",
//         encode_one(accelerator_id).unwrap(),
//     ).expect("List invites failed");
//     println!("List result: {:?}", list_result);
    
//     let invites: Vec<StartupInvite> = decode_one(&list_result).unwrap();
//     let used_invite = invites.iter().find(|inv| inv.invite_code == *invite_code).unwrap();
//     let status = &used_invite.status;
//     assert_eq!(status, &InviteStatus::Used, "Invite status should be 'Used' after acceptance");

//     println!("✅ test_generate_and_accept_invite passed");
// }

//===============================================================================
// EXPIRED INVITE TESTS
//===============================================================================

#[test]
fn test_expired_invite() {
    let (pic, canister_id) = setup();

    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    let _ = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "sign_up_accelerator",
        encode_one(signup_data).unwrap(),
    ).expect("Accelerator sign up failed");

    // 2. Generate invite with very short expiry (1 second)
    let accelerator_id = Principal::anonymous().to_string();
    let invite_input = GenerateStartupInviteInput {
        startup_name: "Expired Startup".to_string(),
        program_name: "Test Program".to_string(),
        accelerator_id: accelerator_id.clone(),
        invite_type: InviteType::Link,
        email: Some("founder@expired.com".to_string()),
        expiry_days: Some(0), // 0 days = immediate expiry
    };
    let result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "generate_startup_invite",
        encode_one(invite_input).unwrap(),
    ).expect("Invite generation failed");

    let invite_result: Result<StartupInvite, String> = decode_one(&result).unwrap();
    let invite = invite_result.expect("Invite generation should succeed");
    let invite_code = &invite.invite_code;
    println!("Generated invite code: {}", invite_code);
    println!("Invite expiry: {}", invite.expiry);

    // 3. Try to accept immediately - should fail because invite is expired
    let new_principal = Principal::from_text("2vxsx-fae").unwrap();
    let registration_input = StartupRegistrationInput {
        invite_code: invite_code.to_string(),
        startup_name: "Expired Startup".to_string(),
        founder_name: "Bob Founder".to_string(),
        email: "founder@expired.com".to_string(),
    };
    
    let accept_result = pic.update_call(
        canister_id,
        new_principal,
        "accept_startup_invite",
        encode_one(registration_input).unwrap(),
    );
    
    println!("Accept result: {:?}", accept_result);
    
    // Should fail because invite is expired (0 days = immediate expiry)
    match accept_result {
        Ok(result_bytes) => {
            let result: Result<(), String> = decode_one(&result_bytes).unwrap();
            match result {
                Ok(_) => panic!("Expired invite should not be accepted"),
                Err(e) => {
                    println!("✅ Expired invite correctly rejected with error: {}", e);
                    assert!(e.contains("expired"), "Error should mention expiration");
                }
            }
        },
        Err(_) => {
            println!("✅ Expired invite correctly rejected");
        }
    }

    // 4. Check invite status is marked as expired
    let list_result = pic.query_call(
        canister_id,
        Principal::anonymous(),
        "list_startup_invites",
        encode_one(accelerator_id).unwrap(),
    ).expect("List invites failed");
    
    let invites: Vec<StartupInvite> = decode_one(&list_result).unwrap();
    let expired_invite = invites.iter().find(|inv| inv.invite_code == *invite_code).unwrap();
    assert_eq!(expired_invite.status, InviteStatus::Expired, "Invite should be marked as expired");
    
    println!("✅ test_expired_invite passed");
}

//===============================================================================
// REVOKED INVITE TESTS
//===============================================================================

#[test]
fn test_revoked_invite() {
    let (pic, canister_id) = setup();

    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    let _ = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "sign_up_accelerator",
        encode_one(signup_data).unwrap(),
    ).expect("Accelerator sign up failed");

    let accelerator_id = Principal::anonymous().to_string();
    let invite_input = GenerateStartupInviteInput {
        startup_name: "Revoked Startup".to_string(),
        program_name: "Test Program".to_string(),
        accelerator_id: accelerator_id.clone(),
        invite_type: InviteType::Link,
        email: Some("founder@revoked.com".to_string()),
        expiry_days: Some(7),
    };
    let result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "generate_startup_invite",
        encode_one(invite_input).unwrap(),
    ).expect("Invite generation failed");

    let invite_result: Result<StartupInvite, String> = decode_one(&result).unwrap();
    let invite = invite_result.expect("Invite generation should succeed");
    let invite_code = &invite.invite_code;
    println!("Generated invite code: {}", invite_code);

    let revoke_result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "revoke_startup_invite",
        encode_one(invite_code.to_string()).unwrap(),
    );
    assert!(revoke_result.is_ok(), "Invite revocation should succeed");
    println!("✅ Invite revoked successfully");

    let new_principal = Principal::from_text("2vxsx-fae").unwrap();
    let registration_input = StartupRegistrationInput {
        invite_code: invite_code.to_string(),
        startup_name: "Revoked Startup".to_string(),
        founder_name: "Charlie Founder".to_string(),
        email: "founder@revoked.com".to_string(),
    };
    
    let accept_result = pic.update_call(
        canister_id,
        new_principal,
        "accept_startup_invite",
        encode_one(registration_input).unwrap(),
    );
    
    // Should fail because invite is revoked
    match accept_result {
        Ok(result_bytes) => {
            let result: Result<(), String> = decode_one(&result_bytes).unwrap();
            match result {
                Ok(_) => panic!("Revoked invite should not be accepted"),
                Err(e) => {
                    println!("✅ Revoked invite correctly rejected with error: {}", e);
                    assert!(e.contains("not pending") || e.contains("used/expired"), "Error should mention invite status");
                }
            }
        },
        Err(_) => {
            println!("✅ Revoked invite correctly rejected");
        }
    }

    let list_result = pic.query_call(
        canister_id,
        Principal::anonymous(),
        "list_startup_invites",
        encode_one(accelerator_id).unwrap(),
    ).expect("List invites failed");
    
    let invites: Vec<StartupInvite> = decode_one(&list_result).unwrap();
    let revoked_invite = invites.iter().find(|inv| inv.invite_code == *invite_code).unwrap();
    assert_eq!(revoked_invite.status, InviteStatus::Revoked, "Invite should be marked as revoked");
    
    println!("✅ test_revoked_invite passed");
}

//===============================================================================
// PERMISSION CHECKS TESTS
//===============================================================================

#[test]
fn test_permission_checks() {
    let (pic, canister_id) = setup();

    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    let _ = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "sign_up_accelerator",
        encode_one(signup_data).unwrap(),
    ).expect("Accelerator sign up failed");

    // 2. Try to generate invite as non-admin (different principal)
    // This should fail because the non-admin principal is not a team member
    // Create a truly different principal by using a different byte array
    let non_admin_principal = Principal::from_slice(&[5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    let accelerator_id = Principal::anonymous().to_string();
    let invite_input = GenerateStartupInviteInput {
        startup_name: "Unauthorized Startup".to_string(),
        program_name: "Test Program".to_string(),
        accelerator_id: accelerator_id.clone(),
        invite_type: InviteType::Link,
        email: Some("founder@unauthorized.com".to_string()),
        expiry_days: Some(7),
    };
    
    let result = pic.update_call(
        canister_id,
        non_admin_principal, // Using non-admin principal
        "generate_startup_invite",
        encode_one(invite_input).unwrap(),
    );
    
    println!("Permission check result: {:?}", result);
    
    // Should fail because non-admin is not a team member
    match result {
        Ok(result_bytes) => {
            let result: Result<StartupInvite, String> = decode_one(&result_bytes).unwrap();
            match result {
                Ok(invite) => {
                    println!("❌ Non-admin successfully generated invite: {:?}", invite);
                    panic!("Non-admin should not be able to generate invites");
                },
                Err(e) => {
                    println!("✅ Non-admin correctly prevented from generating invites with error: {}", e);
                    assert!(e.contains("Only SuperAdmins or Admins"), "Error should mention permission");
                }
            }
        },
        Err(_) => {
            println!("✅ Non-admin correctly prevented from generating invites");
        }
    }

    // 3. Try to revoke invite as non-admin
    let fake_invite_code = "fake_invite_code".to_string();
    let revoke_result = pic.update_call(
        canister_id,
        non_admin_principal, // Using non-admin principal
        "revoke_startup_invite",
        encode_one(fake_invite_code).unwrap(),
    );
    
    // Should fail because non-admin is not a team member
    match revoke_result {
        Ok(result_bytes) => {
            let result: Result<(), String> = decode_one(&result_bytes).unwrap();
            match result {
                Ok(_) => panic!("Non-admin should not be able to revoke invites"),
                Err(e) => {
                    println!("✅ Non-admin correctly prevented from revoking invites with error: {}", e);
                    // The error might be "Invite not found" (if invite doesn't exist) or permission error
                    assert!(e.contains("Only SuperAdmins or Admins") || e.contains("not found"), "Error should mention permission or not found");
                }
            }
        },
        Err(_) => {
            println!("✅ Non-admin correctly prevented from revoking invites");
        }
    }

    // 4. Try to list invites as non-admin (this might be allowed, but let's test)
    let list_result = pic.query_call(
        canister_id,
        non_admin_principal, // Using non-admin principal
        "list_startup_invites",
        encode_one(accelerator_id).unwrap(),
    );
    
    match list_result {
        Ok(_) => println!("✅ Non-admin can list invites (if this is intended)"),
        Err(_) => println!("✅ Non-admin correctly prevented from listing invites"),
    }
    
    println!("✅ test_permission_checks passed");
}

#[test]
fn test_invalid_invite_code() {
    let (pic, canister_id) = setup();

    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    let _ = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "sign_up_accelerator",
        encode_one(signup_data).unwrap(),
    ).expect("Accelerator sign up failed");

    let new_principal = Principal::from_text("2vxsx-fae").unwrap();
    let registration_input = StartupRegistrationInput {
        invite_code: "INVALID_INVITE_CODE_12345".to_string(),
        startup_name: "Invalid Startup".to_string(),
        founder_name: "David Founder".to_string(),
        email: "founder@invalid.com".to_string(),
    };
    
    let accept_result = pic.update_call(
        canister_id,
        new_principal,
        "accept_startup_invite",
        encode_one(registration_input).unwrap(),
    );
    
    // Should fail because invite code doesn't exist
    match accept_result {
        Ok(result_bytes) => {
            let result: Result<(), String> = decode_one(&result_bytes).unwrap();
            match result {
                Ok(_) => panic!("Invalid invite code should not be accepted"),
                Err(e) => {
                    println!("✅ Invalid invite code correctly rejected with error: {}", e);
                    assert!(e.contains("Invalid") || e.contains("not found"), "Error should mention invalid invite");
                }
            }
        },
        Err(_) => {
            println!("✅ Invalid invite code correctly rejected");
        }
    }
    
    println!("✅ test_invalid_invite_code passed");
}

// #[test]
// fn test_duplicate_invite_acceptance() {
//     let (pic, canister_id) = setup();

//     let signup_data = AcceleratorSignUp {
//         name: TEST_ACCELERATOR_NAME.to_string(),
//         website: TEST_ACCELERATOR_WEBSITE.to_string(),
//         email: TEST_ACCELERATOR_EMAIL.to_string(),
//     };
//     let _ = pic.update_call(
//         canister_id,
//         Principal::anonymous(),
//         "sign_up_accelerator",
//         encode_one(signup_data).unwrap(),
//     ).expect("Accelerator sign up failed");

//     let accelerator_id = Principal::anonymous().to_string();
//     let invite_input = GenerateStartupInviteInput {
//         startup_name: "Duplicate Startup".to_string(),
//         program_name: "Test Program".to_string(),
//         accelerator_id: accelerator_id.clone(),
//         invite_type: InviteType::Link,
//         email: Some("founder@duplicate.com".to_string()),
//         expiry_days: Some(7),
//     };
//     let result = pic.update_call(
//         canister_id,
//         Principal::anonymous(),
//         "generate_startup_invite",
//         encode_one(invite_input).unwrap(),
//     ).expect("Invite generation failed");

//     let invite_result: Result<StartupInvite, String> = decode_one(&result).unwrap();
//     let invite = invite_result.expect("Invite generation should succeed");
//     let invite_code = &invite.invite_code;
//     println!("Generated invite code: {}", invite_code);

//     let principal1 = Principal::from_slice(&[6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
//     let registration_input = StartupRegistrationInput {
//         invite_code: invite_code.to_string(),
//         startup_name: "Duplicate Startup".to_string(),
//         founder_name: "Eve Founder".to_string(),
//         email: "founder@duplicate.com".to_string(),
//     };
    
//     let accept_result = pic.update_call(
//         canister_id,
//         principal1,
//         "accept_startup_invite",
//         encode_one(registration_input).unwrap(),
//     );
//     assert!(accept_result.is_ok(), "First invite acceptance should succeed");
//     println!("✅ First invite acceptance succeeded");

//     let principal2 = Principal::from_slice(&[7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
//     let duplicate_registration_input = StartupRegistrationInput {
//         invite_code: invite_code.to_string(),
//         startup_name: "Duplicate Startup 2".to_string(),
//         founder_name: "Frank Founder".to_string(),
//         email: "founder2@duplicate.com".to_string(),
//     };
    
//     let duplicate_accept_result = pic.update_call(
//         canister_id,
//         principal2,
//         "accept_startup_invite",
//         encode_one(duplicate_registration_input).unwrap(),
//     );
    
//     match duplicate_accept_result {
//         Ok(result_bytes) => {
//             let result: Result<(), String> = decode_one(&result_bytes).unwrap();
//             match result {
//                 Ok(_) => panic!("Duplicate invite acceptance should fail"),
//                 Err(e) => {
//                     println!("✅ Duplicate invite acceptance correctly rejected with error: {}", e);
//                     assert!(e.contains("not pending") || e.contains("used/expired"), "Error should mention invite status");
//                 }
//             }
//         },
//         Err(_) => {
//             println!("✅ Duplicate invite acceptance correctly rejected");
//         }
//     }
    
//     println!("✅ test_duplicate_invite_acceptance passed");
// }