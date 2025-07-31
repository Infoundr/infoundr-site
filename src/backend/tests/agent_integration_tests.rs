use candid::{Principal, encode_one, decode_one};
use pocket_ic::PocketIc;
use std::fs;

// Test data constants
const TEST_USER_ID: &str = "test_user_123";
const TEST_GITHUB_TOKEN: &str = "github_pat_test_token_123";
const TEST_ASANA_TOKEN: &str = "asana_test_token_456";

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
fn test_agent_session_creation() {
    let (pic, canister_id) = setup();
    
    // Test creating a GitHub agent session
    let session_result = call_create_agent_session(
        &pic,
        canister_id,
        TEST_USER_ID.to_string(),
        "GitHub".to_string(),
        Some(TEST_GITHUB_TOKEN.to_string()),
        None,
        None,
    );
    
    assert!(session_result.is_ok(), "Session creation should succeed");
    let session_id = session_result.unwrap();
    assert!(!session_id.is_empty(), "Session ID should not be empty");
    
    println!("✅ Test 1: Agent session creation passed");
}

#[test]
fn test_agent_credentials_storage() {
    let (pic, canister_id) = setup();
    
    // Test storing GitHub credentials
    let credentials_result = call_store_agent_credentials(
        &pic,
        canister_id,
        TEST_USER_ID.to_string(),
        "GitHub".to_string(),
        TEST_GITHUB_TOKEN.to_string(),
        None,
        None,
        vec![],
        None,
        None,
    );
    
    assert!(credentials_result.is_ok(), "Credentials storage should succeed");
    
    // Test retrieving credentials
    let retrieved_credentials = call_get_agent_credentials(
        &pic,
        canister_id,
        TEST_USER_ID.to_string(),
        "GitHub".to_string(),
    );
    
    assert!(retrieved_credentials.is_ok(), "Should be able to retrieve credentials");
    let credentials = retrieved_credentials.unwrap();
    assert!(credentials.is_some(), "Credentials should exist");
    
    let creds = credentials.unwrap();
    assert_eq!(creds.user_id, TEST_USER_ID);
    assert_eq!(creds.token, TEST_GITHUB_TOKEN);
    
    println!("✅ Test 2: Agent credentials storage passed");
}

#[test]
fn test_agent_interaction_storage() {
    let (pic, canister_id) = setup();
    
    // Test storing an agent interaction
    let interaction_result = call_store_agent_interaction(
        &pic,
        canister_id,
        TEST_USER_ID.to_string(),
        "GitHub".to_string(),
        "Create a new issue for the login bug".to_string(),
        "Issue #123 created successfully".to_string(),
        true,
        Some(r#"{"issue_id": "123", "repository": "test-repo"}"#.to_string()),
    );
    
    assert!(interaction_result.is_ok(), "Interaction storage should succeed");
    let interaction_id = interaction_result.unwrap();
    assert!(!interaction_id.is_empty(), "Interaction ID should not be empty");
    
    // Test retrieving interactions
    let interactions = call_get_user_agent_interactions(
        &pic,
        canister_id,
        TEST_USER_ID.to_string(),
        Some(10),
    );
    
    assert!(interactions.is_ok(), "Should be able to retrieve interactions");
    let interaction_list = interactions.unwrap();
    assert!(!interaction_list.is_empty(), "Should have at least one interaction");
    
    let latest_interaction = &interaction_list[0];
    assert_eq!(latest_interaction.user_id, TEST_USER_ID);
    assert_eq!(latest_interaction.message, "Create a new issue for the login bug");
    assert!(latest_interaction.success);
    
    println!("✅ Test 3: Agent interaction storage passed");
}

#[test]
fn test_agent_status() {
    let (pic, canister_id) = setup();
    
    // Create multiple sessions and credentials
    call_create_agent_session(
        &pic,
        canister_id,
        TEST_USER_ID.to_string(),
        "GitHub".to_string(),
        Some(TEST_GITHUB_TOKEN.to_string()),
        None,
        None,
    ).unwrap();
    
    call_create_agent_session(
        &pic,
        canister_id,
        TEST_USER_ID.to_string(),
        "Asana".to_string(),
        Some(TEST_ASANA_TOKEN.to_string()),
        None,
        None,
    ).unwrap();
    
    call_store_agent_credentials(
        &pic,
        canister_id,
        TEST_USER_ID.to_string(),
        "GitHub".to_string(),
        TEST_GITHUB_TOKEN.to_string(),
        None,
        None,
        vec![],
        None,
        None,
    ).unwrap();
    
    // Test getting agent status
    let status_result = call_get_agent_status(&pic, canister_id, TEST_USER_ID.to_string());
    assert!(status_result.is_ok(), "Should be able to get agent status");
    
    let status = status_result.unwrap();
    assert_eq!(status.user_id, TEST_USER_ID);
    assert_eq!(status.active_sessions, 2);
    assert_eq!(status.total_sessions, 2);
    assert_eq!(status.connected_agents, 1);
    assert!(status.last_activity > 0);
    
    println!("✅ Test 4: Agent status passed");
}

// Helper functions for making canister calls
fn call_create_agent_session(
    pic: &PocketIc,
    canister_id: Principal,
    user_id: String,
    agent_type: String,
    token: Option<String>,
    project_id: Option<String>,
    selected_repo: Option<String>,
) -> Result<String, String> {
    let args = encode_one((user_id, agent_type, token, project_id, selected_repo)).unwrap();
    let result = pic.update_call(canister_id, Principal::anonymous(), "create_agent_session", args);
    match result {
        Ok(response) => {
            let decoded: Result<String, String> = decode_one(&response).unwrap();
            decoded
        }
        Err(err) => Err(format!("Call failed: {:?}", err)),
    }
}

fn call_store_agent_credentials(
    pic: &PocketIc,
    canister_id: Principal,
    user_id: String,
    agent_type: String,
    token: String,
    token_data: Option<String>,
    workspace_id: Option<String>,
    project_ids: Vec<(String, String)>,
    selected_repo: Option<String>,
    expires_at: Option<u64>,
) -> Result<(), String> {
    let args = encode_one((user_id, agent_type, token, token_data, workspace_id, project_ids, selected_repo, expires_at)).unwrap();
    let result = pic.update_call(canister_id, Principal::anonymous(), "store_agent_credentials", args);
    match result {
        Ok(response) => {
            let decoded: Result<(), String> = decode_one(&response).unwrap();
            decoded
        }
        Err(err) => Err(format!("Call failed: {:?}", err)),
    }
}

fn call_get_agent_credentials(
    pic: &PocketIc,
    canister_id: Principal,
    user_id: String,
    agent_type: String,
) -> Result<Option<AgentCredentials>, String> {
    let args = encode_one((user_id, agent_type)).unwrap();
    let result = pic.query_call(canister_id, Principal::anonymous(), "get_agent_credentials", args);
    match result {
        Ok(response) => {
            let decoded: Option<AgentCredentials> = decode_one(&response).unwrap();
            Ok(decoded)
        }
        Err(err) => Err(format!("Call failed: {:?}", err)),
    }
}

fn call_store_agent_interaction(
    pic: &PocketIc,
    canister_id: Principal,
    user_id: String,
    agent_type: String,
    message: String,
    response: String,
    success: bool,
    metadata: Option<String>,
) -> Result<String, String> {
    let args = encode_one((user_id, agent_type, message, response, success, metadata)).unwrap();
    let result = pic.update_call(canister_id, Principal::anonymous(), "store_agent_interaction", args);
    match result {
        Ok(response) => {
            let decoded: Result<String, String> = decode_one(&response).unwrap();
            decoded
        }
        Err(err) => Err(format!("Call failed: {:?}", err)),
    }
}

fn call_get_user_agent_interactions(
    pic: &PocketIc,
    canister_id: Principal,
    user_id: String,
    limit: Option<u32>,
) -> Result<Vec<AgentInteraction>, String> {
    let args = encode_one((user_id, limit)).unwrap();
    let result = pic.query_call(canister_id, Principal::anonymous(), "get_user_agent_interactions", args);
    match result {
        Ok(response) => {
            let decoded: Vec<AgentInteraction> = decode_one(&response).unwrap();
            Ok(decoded)
        }
        Err(err) => Err(format!("Call failed: {:?}", err)),
    }
}

fn call_get_agent_status(
    pic: &PocketIc,
    canister_id: Principal,
    user_id: String,
) -> Result<AgentStatus, String> {
    let args = encode_one(user_id).unwrap();
    let result = pic.query_call(canister_id, Principal::anonymous(), "get_agent_status", args);
    match result {
        Ok(response) => {
            let decoded: AgentStatus = decode_one(&response).unwrap();
            Ok(decoded)
        }
        Err(err) => Err(format!("Call failed: {:?}", err)),
    }
}

// Data structures for testing
#[derive(candid::CandidType, serde::Deserialize, Clone, Debug)]
struct AgentCredentials {
    pub user_id: String,
    pub agent_type: String,
    pub token: String,
    pub token_data: Option<String>,
    pub workspace_id: Option<String>,
    pub project_ids: Vec<(String, String)>,
    pub selected_repo: Option<String>,
    pub created_at: u64,
    pub expires_at: Option<u64>,
}

#[derive(candid::CandidType, serde::Deserialize, Clone, Debug)]
struct AgentInteraction {
    pub id: String,
    pub user_id: String,
    pub agent_type: String,
    pub message: String,
    pub response: String,
    pub timestamp: u64,
    pub success: bool,
    pub metadata: Option<String>,
}

#[derive(candid::CandidType, serde::Deserialize, Clone, Debug)]
struct AgentStatus {
    pub user_id: String,
    pub active_sessions: u32,
    pub total_sessions: u32,
    pub connected_agents: u32,
    pub recent_interactions: u32,
    pub recent_activities: u32,
    pub last_activity: u64,
} 