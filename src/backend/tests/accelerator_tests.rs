// Accelerator & Team Member Feature Tests
// =======================================

use candid::{Principal, encode_one, decode_one};
use pocket_ic::PocketIc;
use std::fs;

// Test data constants
const TEST_ACCELERATOR_NAME: &str = "Test Accelerator";
const TEST_ACCELERATOR_WEBSITE: &str = "https://testaccelerator.com";
const TEST_ACCELERATOR_EMAIL: &str = "test@accelerator.com";
const BACKEND_WASM: &str = "../../target/wasm32-unknown-unknown/release/backend.wasm";
const INIT_CYCLES: u128 = 2_000_000_000_000;

// Test struct definitions
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct AcceleratorSignUp {
    name: String,
    website: String,
    email: String,
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct TeamMemberInviteWithId {
    accelerator_id: String,
    email: String,
    role: Role,
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct UpdateTeamMemberRole {
    accelerator_id: String,
    email: String,
    new_role: Role,
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct RemoveTeamMember {
    accelerator_id: String,
    email: String,
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct AcceleratorUpdateWithId {
    accelerator_id: String,
    updates: AcceleratorUpdate,
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

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, PartialEq, Eq)]
enum Role {
    SuperAdmin,
    Admin,
    ProgramManager,
    Viewer,
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, PartialEq, Eq)]
enum MemberStatus {
    Active,
    Pending,
}

#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct TeamMember {
    email: String,
    role: Role,
    status: MemberStatus,
    token: Option<String>,
    principal: Option<Principal>,
}

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
fn test_accelerator_signup() {
    let (pic, canister_id) = setup();
    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    let encoded = encode_one(signup_data).unwrap();
    let result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "sign_up_accelerator",
        encoded,
    );
    assert!(result.is_ok(), "Sign-up should succeed");
}

#[test]
fn test_invite_team_member() {
    let (pic, canister_id) = setup();
    
    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    let encoded = encode_one(signup_data).unwrap();
    let signup_result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "sign_up_accelerator",
        encoded,
    );
    assert!(signup_result.is_ok(), "Sign-up should succeed");
    
    let accelerator_id = decode_one::<Result<String, String>>(&signup_result.unwrap()).unwrap().unwrap();
    
    let invite_data = TeamMemberInviteWithId {
        accelerator_id: accelerator_id.clone(),
        email: "newmember@accelerator.com".to_string(),
        role: Role::ProgramManager,
    };
    let encoded = encode_one(invite_data).unwrap();
    let result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "invite_team_member",
        encoded,
    );
    assert!(result.is_ok(), "Team member invite should succeed");
    
    let token = decode_one::<Result<String, String>>(&result.unwrap()).unwrap().unwrap();
    assert!(!token.is_empty(), "Should receive a non-empty invitation token");
}

#[test]
fn test_accept_invitation() {
    let (pic, canister_id) = setup();
    
    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    let encoded = encode_one(signup_data).unwrap();
    let signup_result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "sign_up_accelerator",
        encoded,
    );
    assert!(signup_result.is_ok(), "Sign-up should succeed");
    
    let accelerator_id = decode_one::<Result<String, String>>(&signup_result.unwrap()).unwrap().unwrap();
    
    let invite_data = TeamMemberInviteWithId {
        accelerator_id: accelerator_id.clone(),
        email: "newmember@accelerator.com".to_string(),
        role: Role::ProgramManager,
    };
    let encoded = encode_one(invite_data).unwrap();
    let invite_result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "invite_team_member",
        encoded,
    );
    assert!(invite_result.is_ok(), "Team member invite should succeed");
    
    let token = decode_one::<Result<String, String>>(&invite_result.unwrap()).unwrap().unwrap();
    
    let non_admin_principal = Principal::from_text("2vxsx-fae").unwrap();
    let encoded = encode_one(token).unwrap();
    let accept_result = pic.update_call(
        canister_id,
        non_admin_principal,
        "accept_invitation",
        encoded,
    );
    assert!(accept_result.is_ok(), "Accepting invitation should succeed");
    
    // Debug: Check what team members exist
    let encoded = encode_one(accelerator_id.clone()).unwrap();
    let team_result = pic.query_call(
        canister_id,
        Principal::anonymous(),
        "list_team_members",
        encoded,
    );
    if team_result.is_ok() {
        let team_members = decode_one::<Result<Vec<TeamMember>, String>>(&team_result.unwrap()).unwrap().unwrap();
        println!("Team members after accepting invitation: {:?}", team_members);
    }
    
    let invite_data = TeamMemberInviteWithId {
        accelerator_id: accelerator_id.clone(),
        email: "newmember@accelerator.com".to_string(),
        role: Role::Viewer,
    };
    let encoded = encode_one(invite_data).unwrap();
    let result = pic.update_call(
        canister_id,
        non_admin_principal,
        "invite_team_member",
        encoded,
    );

    assert!(result.is_ok(), "Call should succeed");
    let decoded_result = decode_one::<Result<String, String>>(&result.unwrap()).unwrap();
    println!("Decoded result: {:?}", decoded_result);
    assert!(decoded_result.is_err(), "Non-admin should not be able to invite team members");
}

#[test]
fn test_list_team_members() {
    let (pic, canister_id) = setup();
    
    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    let encoded = encode_one(signup_data).unwrap();
    let signup_result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "sign_up_accelerator",
        encoded,
    );
    assert!(signup_result.is_ok(), "Sign-up should succeed");
    
    let accelerator_id = decode_one::<Result<String, String>>(&signup_result.unwrap()).unwrap().unwrap();
    
    let encoded = encode_one(accelerator_id.clone()).unwrap();
    let result = pic.query_call(
        canister_id,
        Principal::anonymous(),
        "list_team_members",
        encoded,
    );
    assert!(result.is_ok(), "Listing team members should succeed");
    
    let team_members = decode_one::<Result<Vec<TeamMember>, String>>(&result.unwrap()).unwrap().unwrap();
    assert_eq!(team_members.len(), 1, "Should have one team member initially");
    assert_eq!(team_members[0].email, TEST_ACCELERATOR_EMAIL);
    assert_eq!(team_members[0].role, Role::SuperAdmin);
    assert_eq!(team_members[0].status, MemberStatus::Active);
}

#[test]
fn test_update_team_member_role() {
    let (pic, canister_id) = setup();
    
    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    let encoded = encode_one(signup_data).unwrap();
    let signup_result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "sign_up_accelerator",
        encoded,
    );
    assert!(signup_result.is_ok(), "Sign-up should succeed");
    
    let accelerator_id = decode_one::<Result<String, String>>(&signup_result.unwrap()).unwrap().unwrap();
    
    let invite_data = TeamMemberInviteWithId {
        accelerator_id: accelerator_id.clone(),
        email: "newmember@accelerator.com".to_string(),
        role: Role::ProgramManager,
    };
    let encoded = encode_one(invite_data).unwrap();
    let invite_result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "invite_team_member",
        encoded,
    );
    assert!(invite_result.is_ok(), "Team member invite should succeed");
    
    let token = decode_one::<Result<String, String>>(&invite_result.unwrap()).unwrap().unwrap();
    let new_principal = Principal::from_text("2vxsx-fae").unwrap();
    let encoded = encode_one(token).unwrap();
    let accept_result = pic.update_call(
        canister_id,
        new_principal,
        "accept_invitation",
        encoded,
    );
    assert!(accept_result.is_ok(), "Accepting invitation should succeed");
    
    let update_role_data = UpdateTeamMemberRole {
        accelerator_id: accelerator_id.clone(),
        email: "newmember@accelerator.com".to_string(),
        new_role: Role::Admin,
    };
    let encoded = encode_one(update_role_data).unwrap();
    let result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "update_team_member_role",
        encoded,
    );
    assert!(result.is_ok(), "Updating team member role should succeed");
}

#[test]
fn test_remove_team_member() {
    let (pic, canister_id) = setup();
    
    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    let encoded = encode_one(signup_data).unwrap();
    let signup_result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "sign_up_accelerator",
        encoded,
    );
    assert!(signup_result.is_ok(), "Sign-up should succeed");
    
    let accelerator_id = decode_one::<Result<String, String>>(&signup_result.unwrap()).unwrap().unwrap();
    
    let invite_data = TeamMemberInviteWithId {
        accelerator_id: accelerator_id.clone(),
        email: "newmember@accelerator.com".to_string(),
        role: Role::ProgramManager,
    };
    let encoded = encode_one(invite_data).unwrap();
    let invite_result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "invite_team_member",
        encoded,
    );
    assert!(invite_result.is_ok(), "Team member invite should succeed");
    
    let token = decode_one::<Result<String, String>>(&invite_result.unwrap()).unwrap().unwrap();
    
    let new_principal = Principal::from_text("2vxsx-fae").unwrap();
    let encoded = encode_one(token).unwrap();
    let accept_result = pic.update_call(
        canister_id,
        new_principal,
        "accept_invitation",
        encoded,
    );
    assert!(accept_result.is_ok(), "Accepting invitation should succeed");
    
    let remove_data = RemoveTeamMember {
        accelerator_id: accelerator_id.clone(),
        email: "newmember@accelerator.com".to_string(),
    };
    let encoded = encode_one(remove_data).unwrap();
    let result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "remove_team_member",
        encoded,
    );
    assert!(result.is_ok(), "Removing team member should succeed");
}

#[test]
fn test_permission_checks() {
    let pic = PocketIc::new();
    let admin_principal = Principal::anonymous();
    let program_manager_principal = Principal::anonymous();
    let canister_id = pic.create_canister();
    pic.add_cycles(canister_id, INIT_CYCLES);
    let wasm = fs::read(BACKEND_WASM).expect("Wasm file not found, run 'dfx build'.");
    pic.install_canister(canister_id, wasm, vec![], None);

    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    let encoded = encode_one(signup_data).unwrap();
    let signup_result = pic.update_call(
        canister_id,
        admin_principal,
        "sign_up_accelerator",
        encoded,
    );
    println!("Signup result: {:?}", signup_result);
    assert!(signup_result.is_ok(), "Sign-up should succeed");
    
    let accelerator_id = decode_one::<Result<String, String>>(&signup_result.unwrap()).unwrap().unwrap();
    println!("Accelerator ID: {:?}", accelerator_id);

    let invite_data = TeamMemberInviteWithId {
        accelerator_id: accelerator_id.clone(),
        email: "programmanager@accelerator.com".to_string(),
        role: Role::ProgramManager,
    };
    let encoded = encode_one(invite_data).unwrap();
    let invite_result = pic.update_call(
        canister_id,
        admin_principal,
        "invite_team_member",
        encoded,
    );
    println!("Invite result: {:?}", invite_result);
    assert!(invite_result.is_ok(), "Invite should succeed");
    
    let token = decode_one::<Result<String, String>>(&invite_result.unwrap()).unwrap().unwrap();

    let encoded = encode_one(token).unwrap();
    let accept_result = pic.update_call(
        canister_id,
        program_manager_principal,
        "accept_invitation",
        encoded,
    );
    println!("Accept result: {:?}", accept_result);
    assert!(accept_result.is_ok(), "Accepting invitation should succeed");
    
    let encoded = encode_one(accelerator_id.clone()).unwrap();
    let team_result = pic.query_call(
        canister_id,
        admin_principal,
        "list_team_members",
        encoded,
    );
    println!("Team result: {:?}", team_result);
    if team_result.is_ok() {
        let team_members = decode_one::<Result<Vec<TeamMember>, String>>(&team_result.unwrap()).unwrap().unwrap();
        println!("Team members after accepting invitation: {:?}", team_members);
    }

    let invite_data = TeamMemberInviteWithId {
        accelerator_id: accelerator_id.clone(),
        email: "newmember@accelerator.com".to_string(),
        role: Role::Viewer,
    };
    let encoded = encode_one(invite_data).unwrap();
    let result = pic.update_call(
        canister_id,
        program_manager_principal,
        "invite_team_member",
        encoded,
    );
    println!("Invite result: {:?}", result);
    
    assert!(result.is_ok(), "Call should succeed");
    let decoded_result = decode_one::<Result<String, String>>(&result.unwrap()).unwrap();
    println!("Decoded result: {:?}", decoded_result);
    assert!(decoded_result.is_err(), "Non-admin should not be able to invite team members");

    let update_data = AcceleratorUpdateWithId {
        accelerator_id: accelerator_id.clone(),
        updates: AcceleratorUpdate {
            name: Some("Updated Name".to_string()),
            website: None,
            email: None,
            email_verified: None,
            logo: None,
            total_startups: None,
            invites_sent: None,
            active_startups: None,
            graduated_startups: None,
        },
    };
    let encoded = encode_one(update_data).unwrap();
    let result = pic.update_call(
        canister_id,
        program_manager_principal,
        "update_my_accelerator",
        encoded,
    );
    println!("Update result: {:?}", result);

    assert!(result.is_ok(), "Call should succeed");
    let error_result = decode_one::<Result<(), String>>(&result.unwrap()).unwrap();
    println!("Error result: {:?}", error_result);
    assert!(error_result.is_err(), "Non-admin should not be able to update accelerator");
}

#[test]
fn test_invalid_invitation_token() {
    let (pic, canister_id) = setup();
    
    let invalid_token = "invalid_token_12345";
    let encoded = encode_one(invalid_token).unwrap();
    let result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "accept_invitation",
        encoded,
    );
    // The call should succeed but return an error result
    assert!(result.is_ok(), "Call should succeed");
    let error_result = decode_one::<Result<(), String>>(&result.unwrap()).unwrap();
    assert!(error_result.is_err(), "Invalid token should be rejected");
}

#[test]
fn test_duplicate_email_invite() {
    let (pic, canister_id) = setup();
    
    let signup_data = AcceleratorSignUp {
        name: TEST_ACCELERATOR_NAME.to_string(),
        website: TEST_ACCELERATOR_WEBSITE.to_string(),
        email: TEST_ACCELERATOR_EMAIL.to_string(),
    };
    let encoded = encode_one(signup_data).unwrap();
    let signup_result = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "sign_up_accelerator",
        encoded,
    );
    assert!(signup_result.is_ok(), "Sign-up should succeed");
    
    let accelerator_id = decode_one::<Result<String, String>>(&signup_result.unwrap()).unwrap().unwrap();

    let invite_data = TeamMemberInviteWithId {
        accelerator_id: accelerator_id.clone(),
        email: "newmember@accelerator.com".to_string(),
        role: Role::ProgramManager,
    };
    let encoded = encode_one(invite_data.clone()).unwrap();
    let result1 = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "invite_team_member",
        encoded,
    );
    assert!(result1.is_ok(), "First invite should succeed");
    
    let encoded = encode_one(invite_data).unwrap();
    let result2 = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "invite_team_member",
        encoded,
    );
    assert!(result2.is_ok(), "Call should succeed");
    let error_result = decode_one::<Result<String, String>>(&result2.unwrap()).unwrap();
    assert!(error_result.is_err(), "Duplicate email invite should fail");
} 