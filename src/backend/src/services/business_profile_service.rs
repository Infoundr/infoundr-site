use crate::models::business_profile::{BusinessProfile, BusinessStage};
use crate::models::stable_principal::StablePrincipal;
use crate::storage::memory::BUSINESS_PROFILES;
use ic_cdk::api::time;
use ic_cdk::caller;

/// Save or update a business profile
#[ic_cdk::update]
pub fn save_business_profile(profile: BusinessProfile) -> Result<String, String> {
    let principal = profile.user_principal.clone();
    let now = time();

    BUSINESS_PROFILES.with(|profiles| {
        let mut map = profiles.borrow_mut();
        let mut updated_profile = profile.clone();

        updated_profile.updated_at = now;

        if let Some(existing) = map.get(&principal) {
            updated_profile.created_at = existing.created_at;
        } else {
            updated_profile.created_at = now;
        }

        map.insert(principal.clone(), updated_profile);
        ic_cdk::println!("Saved business profile for {:?}", principal);
        Ok(format!("Business profile saved for principal: {:?}", principal))
    })
}

/// Get the current caller's business profile
#[ic_cdk::query]
pub fn get_my_business_profile() -> Result<Option<BusinessProfile>, String> {
    let principal = StablePrincipal::from(caller());
    let profile = BUSINESS_PROFILES.with(|profiles| profiles.borrow().get(&principal));
    Ok(profile)
}

/// Get a specific business profile by user principal
#[ic_cdk::query]
pub fn get_business_profile(principal: StablePrincipal) -> Result<Option<BusinessProfile>, String> {
    let profile = BUSINESS_PROFILES.with(|profiles| profiles.borrow().get(&principal));
    Ok(profile)
}

/// Delete a business profile by principal
#[ic_cdk::update]
pub fn delete_business_profile(principal: StablePrincipal) -> Result<String, String> {
    BUSINESS_PROFILES.with(|profiles| {
        let mut map = profiles.borrow_mut();
        if map.remove(&principal).is_some() {
            Ok(format!("Business profile deleted for {:?}", principal))
        } else {
            Err("Profile not found".to_string())
        }
    })
}

/// List all business profiles (admin or debugging use)
#[ic_cdk::query]
pub fn list_business_profiles() -> Vec<BusinessProfile> {
    BUSINESS_PROFILES.with(|profiles| profiles.borrow().iter().map(|(_, p)| p).collect())
}

/// Update a single field in the current user's business profile
#[ic_cdk::update]
pub fn update_business_profile_field(field_name: String, value: String) -> Result<String, String> {
    let principal = StablePrincipal::from(caller());

    BUSINESS_PROFILES.with(|profiles| {
        let mut map = profiles.borrow_mut();

        if let Some(mut profile) = map.get(&principal) {
            match field_name.as_str() {
                "business_name" => profile.business_name = value,
                "tagline" => profile.tagline = Some(value),
                "industry" => profile.industry = value,
                "location" => profile.location = Some(value),
                "website" => profile.website = Some(value),
                "funding_goal" => profile.funding_goal = Some(value),
                "competitive_advantage" => profile.competitive_advantage = Some(value),
                _ => return Err(format!("Unsupported or unknown field: {}", field_name)),
            }

            profile.updated_at = time();
            map.insert(principal.clone(), profile);
            Ok(format!("Field '{}' updated successfully", field_name))
        } else {
            Err("Profile not found for caller".to_string())
        }
    })
}

/// Calculate and return the profile completion percentage and completion status
#[ic_cdk::query]
pub fn get_profile_completion(principal: StablePrincipal) -> Result<(u8, bool), String> {
    BUSINESS_PROFILES.with(|profiles| {
        let profiles = profiles.borrow();

        if let Some(profile) = profiles.get(&principal) {
            // Use u8 for counters (fits 0-100)
            let mut filled: u8 = 0;
            let total: u8 = 10; // number of key fields considered

            if !profile.business_name.is_empty() {
                filled = filled.saturating_add(1);
            }

            // Use pattern matching instead of `!=` to avoid requiring PartialEq
            match &profile.stage {
                BusinessStage::Idea => { /* no increment */ }
                _ => { filled = filled.saturating_add(1); }
            }

            if !profile.product_description.is_empty() {
                filled = filled.saturating_add(1);
            }

            if !profile.target_market.is_empty() {
                filled = filled.saturating_add(1);
            }

            if !profile.customer_segments.is_empty() {
                filled = filled.saturating_add(1);
            }

            if profile.business_model.is_some() {
                filled = filled.saturating_add(1);
            }

            if profile.revenue_stage.is_some() {
                filled = filled.saturating_add(1);
            }

            if profile.market_size.is_some() {
                filled = filled.saturating_add(1);
            }

            if !profile.competitors.is_empty() {
                filled = filled.saturating_add(1);
            }

            if profile.unique_value_proposition.is_some() {
                filled = filled.saturating_add(1);
            }
            // ✅ Optional fields added
            if !profile.help_needed.is_empty() {
                filled = filled.saturating_add(1);
            }

            if !profile.mentorship_interests.is_empty() {
                filled = filled.saturating_add(1);
            }

            if !profile.technologies_used.is_empty() {
                filled = filled.saturating_add(1);
            }

            // Compute percentage (0-100)
            let completion = ((filled as f32 / total as f32) * 100.0) as u8;
            let is_complete = completion >= 90;

            Ok((completion, is_complete))
        } else {
            Err("Profile not found".to_string())
        }
    })
}

