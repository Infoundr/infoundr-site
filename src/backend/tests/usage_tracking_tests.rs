use candid::{decode_one, encode_one, Principal};
use pocket_ic::PocketIc;
use std::fs;
use std::time::Duration;


use backend::models::usage_service::UsageStats; // make sure path matches your crate

const BACKEND_WASM: &str = "../../target/wasm32-unknown-unknown/release/backend.wasm";

fn setup_backend() -> (PocketIc, Principal) {
    let pic = PocketIc::new();
    let backend_canister = pic.create_canister();
    pic.add_cycles(backend_canister, 2_000_000_000_000); // 2T cycles
    let wasm = fs::read(BACKEND_WASM).expect("Wasm file not found, run `cargo build --target wasm32-unknown-unknown`.");
    pic.install_canister(backend_canister, wasm, vec![], None);
    (pic, backend_canister)
}

#[test]
fn test_free_tier_daily_limit() {
    let (pic, backend) = setup_backend();
    let user_id = "test_user_123".to_string();

    // 50 requests should succeed
    for i in 0..50 {
        let result = pic.update_call(
            backend,
            Principal::anonymous(),
            "store_api_message",
            encode_one((&user_id, format!("Request {}", i), "Response".to_string(), "GitHub Agent".to_string(), None::<String>)).unwrap(),
        );
        assert!(result.is_ok(), "Request {} failed unexpectedly", i);
    }

    // 51st request should fail
    let result = pic.update_call(
        backend,
        Principal::anonymous(),
        "store_api_message",
        encode_one((&user_id, "Request 51".to_string(), "Response".to_string(), "GitHub Agent".to_string(), None::<String>)).unwrap(),
    );
    assert!(result.is_err(), "51st request should have failed");
}

#[test]
fn test_daily_reset() {
    let (pic, backend) = setup_backend();
    let user_id = "test_user_reset".to_string();

    // Use up all 50 requests
    for i in 0..50 {
        let _ = pic.update_call(
            backend,
            Principal::anonymous(),
            "store_api_message",
            encode_one((&user_id, format!("Req {}", i), "Resp".to_string(), "Bot".to_string(), None::<String>)).unwrap(),
        );
    }

    // Advance time by 24h
    pic.advance_time(Duration::from_secs(24 * 60 * 60));

    // Should allow new requests
    let result = pic.update_call(
        backend,
        Principal::anonymous(),
        "store_api_message",
        encode_one((&user_id, "After reset".to_string(), "Resp".to_string(), "Bot".to_string(), None::<String>)).unwrap(),
    );
    assert!(result.is_ok(), "Request after daily reset should succeed");
}

#[test]
fn test_pro_tier_unlimited() {
    let (pic, backend) = setup_backend();
    let user_id = "pro_user_123".to_string();

    // Upgrade user to Pro
    let result = pic.update_call(
        backend,
        Principal::anonymous(),
        "api_upgrade_user_tier",
        encode_one((&user_id, backend::models::usage_service::UserTier::Pro, None::<u64>)).unwrap(),
    );
    assert!(result.is_ok());

    // Make 100+ requests (should all succeed)
    for i in 0..100 {
        let result = pic.update_call(
            backend,
            Principal::anonymous(),
            "store_api_message",
            encode_one((&user_id, format!("ProReq {}", i), "Resp".to_string(), "Bot".to_string(), None::<String>)).unwrap(),
        );
        assert!(result.is_ok(), "Pro request {} failed unexpectedly", i);
    }
}

#[test]
fn test_usage_stats() {
    let (pic, backend) = setup_backend();
    let user_id = "stats_user_123".to_string();

    // Make 25 requests
    for i in 0..25 {
        let _ = pic.update_call(
            backend,
            Principal::anonymous(),
            "store_api_message",
            encode_one((&user_id, format!("Req {}", i), "Resp".to_string(), "Bot".to_string(), None::<String>)).unwrap(),
        );
    }

    // Query usage stats
    let result = pic.query_call(
        backend,
        Principal::anonymous(),
        "api_get_usage_stats",
        encode_one(&user_id).unwrap(),
    ).unwrap();

    let stats: UsageStats = decode_one(&result).unwrap();

    assert_eq!(stats.user_id, user_id);
    assert_eq!(stats.requests_used, 25);
    assert_eq!(stats.requests_limit, Some(50));
    assert_eq!(stats.tier, backend::models::usage_service::UserTier::Free);
}
