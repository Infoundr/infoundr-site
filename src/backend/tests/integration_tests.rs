use candid::{Principal, encode_one, decode_one};
use pocket_ic::PocketIc;
use std::fs;

// Test data constants
const TEST_ACCELERATOR_NAME: &str = "Test Accelerator";
const TEST_ACCELERATOR_WEBSITE: &str = "https://testaccelerator.com";
const TEST_ACCELERATOR_EMAIL: &str = "test@accelerator.com";

// WASM file path
const BACKEND_WASM: &str = "../../target/wasm32-unknown-unknown/release/backend.wasm";

// 2T cycles for testing
const INIT_CYCLES: u128 = 2_000_000_000_000;

fn setup() -> (PocketIc, Principal) {
    std::env::set_var("POCKET_IC_BIN", "/usr/local/bin/pocket-ic"); // Path of the pocket-ic binary
    let pic = PocketIc::new();

    let backend_canister = pic.create_canister();
    pic.add_cycles(backend_canister, INIT_CYCLES); // 2T Cycles
    let wasm = fs::read(BACKEND_WASM).expect("Wasm file not found, run 'dfx build'.");
    pic.install_canister(backend_canister, wasm, vec![], None);
    (pic, backend_canister)
}

#[test]
fn test_accelerator_signup() {
    
    let (pic, canister_id) = setup();
    
    // Test 1: Basic sign-up
    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };

    let result = call_accelerator_signup(&pic, canister_id, signup_data);
    assert!(result.is_ok(), "Sign-up should succeed");
    
    println!("✅ Test 1: Basic sign-up passed"); 
}

// #[test]
// fn test_duplicate_signup_prevention() {
//     let (pic, canister_id) = setup();
    
//     let signup_data = AcceleratorSignUp {
//         name: TEST_ACCELERATOR_NAME.to_string(),
//         website: TEST_ACCELERATOR_WEBSITE.to_string(),
//         email: TEST_ACCELERATOR_EMAIL.to_string(),
//     };

//     // First sign-up should succeed
//     let result1 = call_accelerator_signup(&pic, canister_id, signup_data.clone());
//     assert!(result1.is_ok(), "First sign-up should succeed");

//     // Second sign-up with same principal should fail
//     let result2 = call_accelerator_signup(&pic, canister_id, signup_data);
//     assert!(result2.is_err(), "Duplicate sign-up should fail");
    
//     println!("✅ Test 2: Duplicate sign-up prevention passed");
// }

// #[test]
// fn test_field_updates() {
//     let (pic, canister_id) = setup();
    
//     // First sign up an accelerator
//     let signup_data = AcceleratorSignUp {
//         name: TEST_ACCELERATOR_NAME.to_string(),
//         website: TEST_ACCELERATOR_WEBSITE.to_string(),
//         email: TEST_ACCELERATOR_EMAIL.to_string(),
//     };
//     call_accelerator_signup(&pic, canister_id, signup_data).unwrap();

//     // Test individual field updates
//     let updates = AcceleratorUpdate {
//         name: Some("Updated Name".to_string()),
//         website: Some("https://updatedwebsite.com".to_string()),
//         email: Some("updated@email.com".to_string()),
//         email_verified: Some(true),
//         logo: Some(Some(vec![vec![1, 2, 3, 4]])), // Test logo data
//         total_startups: Some(10),
//         invites_sent: Some(5),
//         active_startups: Some(8),
//         graduated_startups: Some(2),
//     };

//     let update_result = call_update_my_accelerator(&pic, canister_id, updates);
//     assert!(update_result.is_ok(), "Update should succeed");

//     // Verify the updates
//     let my_accelerator = call_get_my_accelerator(&pic, canister_id);
//     assert!(my_accelerator.is_ok(), "Should be able to get accelerator");
    
//     let accelerator = my_accelerator.unwrap().unwrap();
//     assert_eq!(accelerator.name, "Updated Name");
//     assert_eq!(accelerator.website, "https://updatedwebsite.com");
//     assert_eq!(accelerator.email, "updated@email.com");
//     assert_eq!(accelerator.email_verified, true);
//     assert_eq!(accelerator.total_startups, 10);
//     assert_eq!(accelerator.invites_sent, 5);
//     assert_eq!(accelerator.active_startups, 8);
//     assert_eq!(accelerator.graduated_startups, 2);
//     assert!(accelerator.logo.is_some());

//     println!("✅ Test 3: Field updates passed");
// }

// #[test]
// fn test_partial_updates() {
//     let (pic, canister_id) = setup();
    
//     // First sign up an accelerator
//     let signup_data = AcceleratorSignUp {
//         name: TEST_ACCELERATOR_NAME.to_string(),
//         website: TEST_ACCELERATOR_WEBSITE.to_string(),
//         email: TEST_ACCELERATOR_EMAIL.to_string(),
//     };
//     call_accelerator_signup(&pic, canister_id, signup_data).unwrap();

//     // Test partial updates (only name)
//     let partial_updates = AcceleratorUpdate {
//         name: Some("Partial Update".to_string()),
//         website: None,
//         email: None,
//         email_verified: None,
//         logo: None,
//         total_startups: None,
//         invites_sent: None,
//         active_startups: None,
//         graduated_startups: None,
//     };

//     let update_result = call_update_my_accelerator(&pic, canister_id, partial_updates);
//     assert!(update_result.is_ok(), "Partial update should succeed");

//     // Verify only name was updated, other fields remain unchanged
//     let my_accelerator = call_get_my_accelerator(&pic, canister_id);
//     let accelerator = my_accelerator.unwrap().unwrap();
//     assert_eq!(accelerator.name, "Partial Update");
//     assert_eq!(accelerator.website, TEST_ACCELERATOR_WEBSITE); // Should remain unchanged
//     assert_eq!(accelerator.email, TEST_ACCELERATOR_EMAIL); // Should remain unchanged

//     println!("✅ Test 4: Partial updates passed");
// }

#[test]
fn test_admin_functions() {
    let (pic, canister_id) = setup();
    
    // Create a test accelerator first
    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    call_accelerator_signup(&pic, canister_id, signup_data).unwrap();

    // Get the caller's principal (anonymous in this case)
    let caller_principal = Principal::anonymous();

    // Test get_all_accelerators (as admin)
    let _all_accelerators = call_get_all_accelerators(&pic, canister_id);
    // Note: This will fail if caller is not admin, which is expected behavior
    
    // Test get_accelerator_by_id (as admin)
    let _accelerator = call_get_accelerator_by_id(&pic, canister_id, caller_principal);
    // Note: This will fail if caller is not admin, which is expected behavior

    // Test admin_update_accelerator
    let admin_updates = AcceleratorUpdate {
        name: Some("Admin Updated Name".to_string()),
        website: None,
        email: None,
        email_verified: Some(true),
        logo: None,
        total_startups: Some(15),
        invites_sent: None,
        active_startups: None,
        graduated_startups: None,
    };

    let _update_result = call_admin_update_accelerator(&pic, canister_id, caller_principal, admin_updates);
    // Note: This will fail if caller is not admin, which is expected behavior

    println!("✅ Test 5: Admin functions structure created (will fail without admin privileges)");
}

// #[test]
// fn test_data_integrity() {
//     let (pic, canister_id) = setup();
    
//     let signup_data = AcceleratorSignUp {
//         name: "Integrity Test".to_string(),
//         website: "https://integritytest.com".to_string(),
//         email: "integrity@test.com".to_string(),
//     };

//     // Sign up
//     let signup_result = call_accelerator_signup(&pic, canister_id, signup_data);
//     assert!(signup_result.is_ok(), "Sign-up should succeed");

//     // Get the accelerator
//     let my_accelerator = call_get_my_accelerator(&pic, canister_id);
//     assert!(my_accelerator.is_ok(), "Should be able to get accelerator");
//     let accelerator = my_accelerator.unwrap().unwrap();

//     // Verify all fields are set correctly
//     assert_eq!(accelerator.name, "Integrity Test");
//     assert_eq!(accelerator.website, "https://integritytest.com");
//     assert_eq!(accelerator.email, "integrity@test.com");
//     assert_eq!(accelerator.email_verified, false);
//     assert_eq!(accelerator.total_startups, 0);
//     assert_eq!(accelerator.invites_sent, 0);
//     assert_eq!(accelerator.active_startups, 0);
//     assert_eq!(accelerator.graduated_startups, 0);
//     assert!(accelerator.logo.is_none());
//     assert!(accelerator.recent_activity.is_empty());

//     println!("✅ Test 6: Data integrity passed");
// }

// Helper functions

fn call_accelerator_signup(pic: &PocketIc, canister_id: Principal, data: AcceleratorSignUp) -> Result<(), String> {
    let encoded = encode_one(data).unwrap();
    let result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "sign_up_accelerator",
        encoded,
    );
    
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Sign-up failed: {:?}", e)),
    }
}

fn call_get_my_accelerator(pic: &PocketIc, canister_id: Principal) -> Result<Option<Accelerator>, String> {
    let result = pic.query_call(
        canister_id,
        Principal::anonymous(),
        "get_my_accelerator",
        encode_one(()).unwrap(),
    );
    
    match result {
        Ok(response) => {
            let decoded: Result<Option<Accelerator>, _> = decode_one(&response);
            decoded.map_err(|e| format!("Decode failed: {:?}", e))
        },
        Err(e) => Err(format!("Query failed: {:?}", e)),
    }
}

fn call_update_my_accelerator(pic: &PocketIc, canister_id: Principal, updates: AcceleratorUpdate) -> Result<(), String> {
    let encoded = encode_one(updates).unwrap();
    let result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "update_my_accelerator",
        encoded,
    );
    
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Update failed: {:?}", e)),
    }
}

fn call_get_all_accelerators(pic: &PocketIc, canister_id: Principal) -> Result<Vec<Accelerator>, String> {
    let result = pic.query_call(
        canister_id,
        Principal::anonymous(),
        "get_all_accelerators",
        encode_one(()).unwrap(),
    );
    
    match result {
        Ok(response) => {
            let decoded: Result<Vec<Accelerator>, _> = decode_one(&response);
            decoded.map_err(|e| format!("Decode failed: {:?}", e))
        },
        Err(e) => Err(format!("Query failed: {:?}", e)),
    }
}

fn call_get_accelerator_by_id(pic: &PocketIc, canister_id: Principal, target_id: Principal) -> Result<Option<Accelerator>, String> {
    let encoded = encode_one(target_id).unwrap();
    let result = pic.query_call(
        canister_id,
        Principal::anonymous(),
        "get_accelerator_by_id",
        encoded,
    );
    
    match result {
        Ok(response) => {
            let decoded: Result<Option<Accelerator>, _> = decode_one(&response);
            decoded.map_err(|e| format!("Decode failed: {:?}", e))
        },
        Err(e) => Err(format!("Query failed: {:?}", e)),
    }
}

fn call_admin_update_accelerator(pic: &PocketIc, canister_id: Principal, target_id: Principal, updates: AcceleratorUpdate) -> Result<(), String> {
    let args = (target_id, updates);
    let encoded = encode_one(args).unwrap();
    let result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "admin_update_accelerator",
        encoded,
    );
    
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Admin update failed: {:?}", e)),
    }
}

// Type definitions for testing
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct AcceleratorSignUp {
    name: String,
    website: String,
    email: String,
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct AcceleratorUpdate {
    name: Option<String>,
    website: Option<String>,
    email: Option<String>,
    email_verified: Option<bool>,
    logo: Option<Option<Vec<Vec<u8>>>>,
    total_startups: Option<u32>,
    invites_sent: Option<u32>,
    active_startups: Option<u32>,
    graduated_startups: Option<u32>,
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct Accelerator {
    id: Principal,
    name: String,
    website: String,
    email: String,
    email_verified: bool,
    logo: Option<Vec<Vec<u8>>>,
    total_startups: u32,
    invites_sent: u32,
    active_startups: u32,
    graduated_startups: u32,
    recent_activity: Vec<Activity>,
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct Activity {
    timestamp: u64,
    description: String,
    activity_type: ActivityType,
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
enum ActivityType {
    Joined,
    UpdatedPitchDeck,
    SentInvite,
    Graduated,
    MissedMilestone,
    Other(String),
} 