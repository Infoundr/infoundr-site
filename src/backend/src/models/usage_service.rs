// backend/src/models/usage_service.rs

use candid::CandidType;
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use ic_stable_structures::storable::{Storable, BoundedStorable};

/// Billing tiers
#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
pub enum UserTier {
    Free,
    Pro,
}

// Provide a Default impl so other structs (like UserSubscription) can derive Default.
// We choose Free as the sensible default tier.
impl Default for UserTier {
    fn default() -> Self {
        UserTier::Free
    }
}

/// Subscription state for a user
#[derive(CandidType, Deserialize, Serialize, Clone, Debug, Default)]
pub struct UserSubscription {
    pub user_id: String,
    pub tier: UserTier,
    /// Optional metadata for payments (stripe id, active flag, etc.)
    pub is_active: bool,
    pub started_at_ns: Option<u64>,
    pub renewed_at_ns: Option<u64>,
    /// NEW: optional expiry time for subscriptions
    pub expires_at_ns: Option<u64>,
}

/// What we return to the UI (not stored in StableBTreeMap; no Storable impl required)
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DailyUsage {
    pub user_id: String,
    pub tier: UserTier,
    pub requests_used_today: u32,
    pub requests_limit_today: Option<u32>, // None == unlimited
    pub day_bucket: u64,
    pub reset_time_rfc3339: String,
}

/// What we return when checking daily usage
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct UsageStats {
    pub user_id: String,
    pub tier: UserTier,
    pub requests_used: u32,
     pub requests_limit: Option<u32>,
    pub day_bucket: u64,
    pub reset_time_rfc3339: String,
}
/* ============================
   Storable / BoundedStorable
   ============================

   `StableBTreeMap` requires stored types to implement `Storable` (and
   older versions required `BoundedStorable`). We serialize via Candid.
   Adjust MAX_SIZE if you expect larger serialized payloads.
*/

impl Storable for UserSubscription {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(candid::encode_one(self).expect("Candid encode failed"))
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        candid::decode_one::<UserSubscription>(bytes.as_ref())
            .expect("Candid decode failed for UserSubscription")
    }
}

impl BoundedStorable for UserSubscription {
    // e.g. 4KB; increase if you store lots of metadata in UserSubscription
    const MAX_SIZE: u32 = 4 * 1024;
    const IS_FIXED_SIZE: bool = false;
}