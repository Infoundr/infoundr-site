use candid::Principal;
use pocket_ic::PocketIc;
use std::fs;

pub const TEST_ACCELERATOR_NAME: &str = "Test Accelerator";
pub const TEST_ACCELERATOR_WEBSITE: &str = "https://testaccelerator.com";
pub const TEST_ACCELERATOR_EMAIL: &str = "test@accelerator.com";
pub const BACKEND_WASM: &str = "../../target/wasm32-unknown-unknown/release/backend.wasm";
pub const INIT_CYCLES: u128 = 2_000_000_000_000;

pub fn setup() -> (PocketIc, Principal) {
    std::env::set_var("POCKET_IC_BIN", "/usr/local/bin/pocket-ic");
    let pic = PocketIc::new();
    let backend_canister = pic.create_canister();
    pic.add_cycles(backend_canister, INIT_CYCLES);
    let wasm = fs::read(BACKEND_WASM).expect("Wasm file not found, run 'dfx build'.");
    pic.install_canister(backend_canister, wasm, vec![], None);
    (pic, backend_canister)
}

// Test struct definitions for use in tests
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
pub struct AcceleratorSignUp {
    pub name: String,
    pub website: String,
    pub email: String,
} 