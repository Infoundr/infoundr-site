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

#[test]
fn test_generate_and_accept_invite() {
    let (pic, canister_id) = setup();

    // 1. Register accelerator (SuperAdmin)
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

    // 2. Generate invite as SuperAdmin
    let accelerator_id = Principal::anonymous().to_string();
    println!("Accelerator ID: {}", accelerator_id);
    let invite_input = GenerateStartupInviteInput {
        startup_name: "Test Startup".to_string(),
        program_name: "Test Program".to_string(),
        accelerator_id: accelerator_id.clone(),
        invite_type: InviteType::Link,
        email: Some("founder@startup.com".to_string()),
        expiry_days: Some(3),
    };
    let result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "generate_startup_invite",
        encode_one(invite_input).unwrap(),
    ).expect("Invite generation failed");
    println!("Invite result: {:?}", result);

    // Decode invite using candid
    let invite_result: Result<StartupInvite, String> = decode_one(&result).unwrap();
    let invite = invite_result.expect("Invite generation should succeed");
    let invite_code = &invite.invite_code;
    println!("Invite code: {}", invite_code);

    // 3. Accept invite as a new principal
    let new_principal = Principal::from_text("2vxsx-fae").unwrap(); // Use a different principal
    let registration_input = StartupRegistrationInput {
        invite_code: invite_code.to_string(),
        startup_name: "Test Startup".to_string(),
        founder_name: "Alice Founder".to_string(),
        email: "founder@startup.com".to_string(),
        password: "password123".to_string(),
    };
    let accept_result = pic.update_call(
        canister_id,
        new_principal,
        "accept_startup_invite",
        encode_one(registration_input).unwrap(),
    );
    println!("Accept result: {:?}", accept_result);
    assert!(accept_result.is_ok(), "Invite acceptance should succeed");

    // 4. List invites and check status
    let list_result = pic.query_call(
        canister_id,
        Principal::anonymous(),
        "list_startup_invites",
        encode_one(accelerator_id).unwrap(),
    ).expect("List invites failed");
    println!("List result: {:?}", list_result);
    
    let invites: Vec<StartupInvite> = decode_one(&list_result).unwrap();
    let used_invite = invites.iter().find(|inv| inv.invite_code == *invite_code).unwrap();
    let status = &used_invite.status;
    assert_eq!(status, &InviteStatus::Used, "Invite status should be 'Used' after acceptance");

    println!("✅ test_generate_and_accept_invite passed");
}
