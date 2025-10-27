// backend/src/services/pricing_services.rs

use ic_cdk::api::time;
use chrono::{DateTime, Utc, TimeZone};

use crate::storage::memory::{USER_DAILY_USAGE, USER_SUBSCRIPTIONS};
use crate::models::stable_string::StableString;
use crate::models::usage_service::{UsageStats, UserSubscription, UserTier};

const NANOS_PER_DAY: u64 = 86_400 * 1_000_000_000;
const FREE_DAILY_LIMIT: u32 = 20;

/// Helper: get daily limit for a tier
fn get_daily_limit(tier: &UserTier) -> Option<u32> {
    match tier {
        UserTier::Free => Some(FREE_DAILY_LIMIT),
        UserTier::Pro => None,
    }
}

/// Get current day bucket timestamp
fn get_current_day_timestamp() -> u64 {
    time() / NANOS_PER_DAY
}

/// Compare if two timestamps fall in the same day bucket
fn is_same_day(timestamp1: u64, timestamp2: u64) -> bool {
    timestamp1 == timestamp2
}

/// Reset daily usage for user if day bucket has changed
fn reset_daily_usage_if_needed(user_id: &str) {
    let today = get_current_day_timestamp();
    USER_DAILY_USAGE.with(|usage| {
        let mut map = usage.borrow_mut();
        let uid = StableString::from(user_id.to_string());

        // remove outdated entries
        let keys_to_remove: Vec<_> = map
            .iter()
            .filter(|((uid_ref, _), _)| uid_ref == &uid)
            .map(|(key, _)| key)
            .filter(|(_, day)| !is_same_day(*day, today))
            .collect();

        for key in keys_to_remove {
            map.remove(&key);
        }

        // ✅ manually initialize today’s bucket if missing
        if !map.contains_key(&(uid.clone(), today)) {
            map.insert((uid, today), 0);
        }
    });
}


/// Check user subscription tier
pub fn check_user_tier(user_id: &str) -> UserTier {
    USER_SUBSCRIPTIONS.with(|subs| {
        subs.borrow()
            .get(&StableString::from(user_id.to_string()))
            .map(|s| {
                // handle expired subs
                if let Some(expiry) = s.expires_at_ns {
                    if time() > expiry {
                        return UserTier::Free;
                    }
                }
                s.tier
            })
            .unwrap_or(UserTier::Free)
    })
}

/// Get number of requests made today
pub fn get_user_daily_requests(user_id: &str) -> u32 {
    reset_daily_usage_if_needed(user_id);
    let day = get_current_day_timestamp();
    USER_DAILY_USAGE.with(|usage| {
        usage
            .borrow()
            .get(&(StableString::from(user_id.to_string()), day))
            .unwrap_or(0)
    })
}

/// Check if user can make another request
pub fn can_make_request(user_id: &str) -> bool {
    let tier = check_user_tier(user_id);
    match get_daily_limit(&tier) {
        None => true, // Pro unlimited
        Some(limit) => get_user_daily_requests(user_id) < limit,
    }
}

/// Increment user daily request counter
pub fn increment_user_requests(user_id: &str) -> Result<(), String> {
    // ✅ Pro users are unlimited
    if matches!(check_user_tier(user_id), UserTier::Pro) {
        return Ok(());
    }

    if !can_make_request(user_id) {
        return Err("Daily limit reached. Upgrade to Pro for unlimited access.".to_string());
    }

    reset_daily_usage_if_needed(user_id);
    let day = get_current_day_timestamp();
    let tier = check_user_tier(user_id);
    let limit = get_daily_limit(&tier);

    USER_DAILY_USAGE.with(|usage| {
        let mut map = usage.borrow_mut();
        let key = (StableString::from(user_id.to_string()), day);
        let current = map.get(&key).unwrap_or(0);

        if let Some(limit) = limit {
            if current >= limit {
                return Err("Daily limit reached. Upgrade to Pro for unlimited access.".to_string());
            }
        }

        map.insert(key, current + 1);
        Ok(())
    })
}

/// Calculate reset time in RFC3339 format
fn next_reset_rfc3339(now_ns: u64) -> String {
    let bucket = now_ns / NANOS_PER_DAY;
    let next_bucket_start_ns = (bucket + 1) * NANOS_PER_DAY;
    let secs = (next_bucket_start_ns / 1_000_000_000) as i64;

    let dt: DateTime<Utc> = Utc.timestamp_opt(secs, 0)
    .single()
    .unwrap_or_else(|| Utc::now());

    dt.to_rfc3339()

}

/// Get usage stats for user
pub fn get_usage_stats(user_id: &str) -> UsageStats {
    let now = time();
    let day_bucket = get_current_day_timestamp();
    let tier = check_user_tier(user_id);
    let used = get_user_daily_requests(user_id);
    let limit = get_daily_limit(&tier);

    UsageStats {
        user_id: user_id.to_string(),
        tier,
        requests_used: used,
        requests_limit: limit,
        day_bucket,
        reset_time_rfc3339: next_reset_rfc3339(now),
    }
}

/// Upgrade user tier
pub fn upgrade_user_tier(user_id: &str, tier: UserTier, expires_at: Option<u64>) -> Result<(), String> {
    USER_SUBSCRIPTIONS.with(|subs| {
        let mut map = subs.borrow_mut();
        let mut sub = map
            .get(&StableString::from(user_id.to_string()))
            .unwrap_or(UserSubscription {
                user_id: user_id.to_string(),
                tier: UserTier::Free,
                is_active: true,
                started_at_ns: Some(time()),
                renewed_at_ns: None,
                expires_at_ns: None,
            });

        sub.tier = tier.clone();
        sub.is_active = true;
        sub.renewed_at_ns = Some(time());
        sub.expires_at_ns = expires_at;

        map.insert(StableString::from(user_id.to_string()), sub);
        Ok(())
    })
}

/// Public API: get user tier
pub fn get_user_tier(user_id: &str) -> UserTier {
    check_user_tier(user_id)
}

/// Public API: get subscription object
pub fn get_user_subscription(user_id: &str) -> Option<UserSubscription> {
    USER_SUBSCRIPTIONS.with(|subs| {
        subs.borrow()
            .get(&StableString::from(user_id.to_string()))
            .map(|s| s.clone())
    })
}