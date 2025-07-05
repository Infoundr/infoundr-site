use crate::models::startup::{
    Startup, StartupStatus, StartupCohort, StartupActivity, StartupActivityType,
    StartupInput, StartupUpdate, StartupStatusInput, StartupCohortInput, StartupFilter, StartupStats
};
use crate::models::stable_principal::StablePrincipal;
use crate::models::stable_string::StableString;
use crate::storage::memory::{
    STARTUPS, STARTUP_STATUSES, STARTUP_COHORTS, STARTUP_ACTIVITIES, ACCELERATORS
};
use crate::models::accelerator::{Role, MemberStatus};
// use candid::{CandidType, Deserialize};
use ic_cdk::{caller, update, query};
use std::collections::HashMap;

// ==================================================================================================
// Startup Management
// ==================================================================================================

#[update]
pub fn create_startup(input: StartupInput) -> Result<Startup, String> {
    let caller_principal = caller();
    let now = ic_cdk::api::time();

    
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == input.accelerator_id).map(|(_, v)| v.clone())
    }).ok_or("Accelerator not found")?;

    let is_admin = accelerator.team_members.iter().any(|m| {
        m.principal == Some(caller_principal) &&
        (m.role == Role::SuperAdmin || m.role == Role::Admin || m.role == Role::ProgramManager) &&
        m.status == MemberStatus::Active
    });
    if !is_admin {
        return Err("Only SuperAdmins, Admins, or ProgramManagers can create startups".to_string());
    }

    let startup_id = format!("startup_{}", now);

    // Get default status and cohort if not provided
    let status_id = input.status_id.unwrap_or_else(|| {
        // Find first active status for this accelerator
        STARTUP_STATUSES.with(|statuses| {
            statuses.borrow()
                .iter()
                .filter(|(_, status)| status.accelerator_id == accelerator.id && status.is_active)
                .min_by_key(|(_, status)| status.sort_order)
                .map(|(id, _)| id.as_str().to_string())
                .unwrap_or_else(|| "default_status".to_string())
        })
    });

    let cohort_id = input.cohort_id.unwrap_or_else(|| {
        // Finding the active cohort for this accelerator
        STARTUP_COHORTS.with(|cohorts| {
            cohorts.borrow()
                .iter()
                .filter(|(_, cohort)| cohort.accelerator_id == accelerator.id && cohort.is_active)
                .min_by_key(|(_, cohort)| cohort.created_at)
                .map(|(id, _)| id.as_str().to_string())
                .unwrap_or_else(|| "default_cohort".to_string())
        })
    });

    let startup = Startup {
        id: startup_id.clone(),
        accelerator_id: accelerator.id.clone(),
        name: input.name,
        description: input.description,
        industry: input.industry,
        contact_email: input.contact_email,
        founder_principal: StablePrincipal::new(caller_principal),
        date_joined: now,
        status_id,
        cohort_id,
        engagement_score: 0,
        total_logins: 0,
        documents_submitted: 0,
        tasks_completed: 0,
        last_activity: now,
        created_at: now,
        updated_at: now,
    };

    STARTUPS.with(|startups| {
        startups.borrow_mut().insert(StableString::new(&startup_id), startup.clone());
    });

    // Record activity
    record_startup_activity_internal(&startup_id, StartupActivityType::Other("Startup created".to_string()), "Startup created".to_string(), None);

    Ok(startup)
}

#[query]
pub fn get_startup(startup_id: String) -> Result<Option<Startup>, String> {
    let startup = STARTUPS.with(|startups| {
        startups.borrow().get(&StableString::new(&startup_id))
    });
    Ok(startup)
}

#[update]
pub fn update_startup(startup_id: String, updates: StartupUpdate) -> Result<(), String> {
    let caller_principal = caller();
    let now = ic_cdk::api::time();

    let mut startup = STARTUPS.with(|startups| {
        startups.borrow().get(&StableString::new(&startup_id))
    }).ok_or("Startup not found")?;

    // Verify accelerator exists and caller has permission
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == startup.accelerator_id.to_string()).map(|(_, v)| v.clone())
    }).ok_or("Accelerator not found")?;

    let is_admin = accelerator.team_members.iter().any(|m| {
        m.principal == Some(caller_principal) &&
        (m.role == Role::SuperAdmin || m.role == Role::Admin || m.role == Role::ProgramManager) &&
        m.status == MemberStatus::Active
    });
    if !is_admin {
        return Err("Only SuperAdmins, Admins, or ProgramManagers can update startups".to_string());
    }

    // Track changes for activity logging
    let mut changes = Vec::new();

    if let Some(name) = updates.name {
        startup.name = name;
    }
    if let Some(description) = updates.description {
        startup.description = Some(description);
    }
    if let Some(industry) = updates.industry {
        startup.industry = Some(industry);
    }
    if let Some(contact_email) = updates.contact_email {
        startup.contact_email = contact_email;
    }
    if let Some(status_id) = updates.status_id {
        if status_id != startup.status_id {
            changes.push(("status", startup.status_id.clone(), status_id.clone()));
            startup.status_id = status_id;
        }
    }
    if let Some(cohort_id) = updates.cohort_id {
        if cohort_id != startup.cohort_id {
            changes.push(("cohort", startup.cohort_id.clone(), cohort_id.clone()));
            startup.cohort_id = cohort_id;
        }
    }
    if let Some(engagement_score) = updates.engagement_score {
        startup.engagement_score = engagement_score;
        changes.push(("engagement_score", startup.engagement_score.to_string(), engagement_score.to_string()));
    }

    startup.updated_at = now;

    STARTUPS.with(|startups| {
        startups.borrow_mut().insert(StableString::new(&startup_id), startup);
    });

    // Record activities for changes
    for (change_type, old_value, new_value) in changes {
        let activity_type = match change_type {
            "status" => StartupActivityType::StatusChanged,
            "cohort" => StartupActivityType::CohortChanged,
            "engagement_score" => StartupActivityType::EngagementScoreUpdated,
            _ => StartupActivityType::Other(format!("{} updated", change_type)),
        };
        let description = format!("{} changed from {} to {}", change_type, old_value, new_value);
        record_startup_activity_internal(&startup_id, activity_type, description, None);
    }

    Ok(())
}

#[update]
pub fn delete_startup(startup_id: String) -> Result<(), String> {
    let caller_principal = caller();

    let startup = STARTUPS.with(|startups| {
        startups.borrow().get(&StableString::new(&startup_id))
    }).ok_or("Startup not found")?;

    // Verify accelerator exists and caller has permission
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == startup.accelerator_id.to_string()).map(|(_, v)| v.clone())
    }).ok_or("Accelerator not found")?;

    let is_admin = accelerator.team_members.iter().any(|m| {
        m.principal == Some(caller_principal) &&
        (m.role == Role::SuperAdmin || m.role == Role::Admin) &&
        m.status == MemberStatus::Active
    });
    if !is_admin {
        return Err("Only SuperAdmins or Admins can delete startups".to_string());
    }

    STARTUPS.with(|startups| {
        startups.borrow_mut().remove(&StableString::new(&startup_id));
    });

    Ok(())
}

#[query]
pub fn list_startups(accelerator_id: String, filter: Option<StartupFilter>) -> Result<Vec<Startup>, String> {
    let startups: Vec<Startup> = STARTUPS.with(|startups| {
        startups.borrow()
            .iter()
            .filter(|(_, startup)| startup.accelerator_id.to_string() == accelerator_id)
            .map(|(_, startup)| startup.clone())
            .collect()
    });

    let filtered_startups = if let Some(filter) = filter {
        startups.into_iter().filter(|startup| {
            // Status filter
            if let Some(ref status_ids) = filter.status_ids {
                if !status_ids.contains(&startup.status_id) {
                    return false;
                }
            }

            // Cohort filter
            if let Some(ref cohort_ids) = filter.cohort_ids {
                if !cohort_ids.contains(&startup.cohort_id) {
                    return false;
                }
            }

            // Search term filter
            if let Some(ref search_term) = filter.search_term {
                let search_lower = search_term.to_lowercase();
                if !startup.name.to_lowercase().contains(&search_lower) &&
                   !startup.contact_email.to_lowercase().contains(&search_lower) &&
                   startup.description.as_ref().map_or(true, |desc| !desc.to_lowercase().contains(&search_lower)) &&
                   startup.industry.as_ref().map_or(true, |ind| !ind.to_lowercase().contains(&search_lower)) {
                    return false;
                }
            }

            // Engagement score filter
            if let Some(min_score) = filter.min_engagement_score {
                if startup.engagement_score < min_score {
                    return false;
                }
            }
            if let Some(max_score) = filter.max_engagement_score {
                if startup.engagement_score > max_score {
                    return false;
                }
            }

            // Date filter
            if let Some(date_from) = filter.date_from {
                if startup.date_joined < date_from {
                    return false;
                }
            }
            if let Some(date_to) = filter.date_to {
                if startup.date_joined > date_to {
                    return false;
                }
            }

            true
        }).collect()
    } else {
        startups
    };

    Ok(filtered_startups)
}

#[query]
pub fn get_startup_stats(accelerator_id: String) -> Result<StartupStats, String> {
    let startups: Vec<Startup> = STARTUPS.with(|startups| {
        startups.borrow()
            .iter()
            .filter(|(_, startup)| startup.accelerator_id.to_string() == accelerator_id)
            .map(|(_, startup)| startup.clone())
            .collect()
    });

    let total_startups = startups.len() as u32;
    let active_startups = startups.iter().filter(|s| s.engagement_score > 0).count() as u32;
    let graduated_startups = startups.iter().filter(|s| s.status_id == "graduated").count() as u32;
    
    let total_engagement: u32 = startups.iter().map(|s| s.engagement_score).sum();
    let average_engagement_score = if total_startups > 0 { total_engagement / total_startups } else { 0 };

    // Group by status
    let mut status_counts: HashMap<String, u32> = HashMap::new();
    for startup in &startups {
        *status_counts.entry(startup.status_id.clone()).or_insert(0) += 1;
    }
    let startups_by_status: Vec<(String, u32)> = status_counts.into_iter().collect();

    // Group by cohort
    let mut cohort_counts: HashMap<String, u32> = HashMap::new();
    for startup in &startups {
        *cohort_counts.entry(startup.cohort_id.clone()).or_insert(0) += 1;
    }
    let startups_by_cohort: Vec<(String, u32)> = cohort_counts.into_iter().collect();

    // Get recent activities
    let recent_activities: Vec<StartupActivity> = STARTUP_ACTIVITIES.with(|activities| {
        activities.borrow()
            .iter()
            .filter(|((startup_id, _), _)| {
                startups.iter().any(|s| s.id == *startup_id.as_str())
            })
            .map(|(_, activity)| activity.clone())
            .collect()
    });

    Ok(StartupStats {
        total_startups,
        active_startups,
        graduated_startups,
        average_engagement_score,
        startups_by_status,
        startups_by_cohort,
        recent_activities,
    })
}

// ==================================================================================================
// Custom Status Management
// ==================================================================================================

#[update]
pub fn create_startup_status(accelerator_id: String, input: StartupStatusInput) -> Result<StartupStatus, String> {
    let caller_principal = caller();
    let now = ic_cdk::api::time();

    // Verify accelerator exists and caller has permission
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == accelerator_id).map(|(_, v)| v.clone())
    }).ok_or("Accelerator not found")?;

    let is_admin = accelerator.team_members.iter().any(|m| {
        m.principal == Some(caller_principal) &&
        (m.role == Role::SuperAdmin || m.role == Role::Admin) &&
        m.status == MemberStatus::Active
    });
    if !is_admin {
        return Err("Only SuperAdmins or Admins can create statuses".to_string());
    }

    let status_id = format!("status_{}", now);
    let sort_order = input.sort_order.unwrap_or_else(|| {
        // Find max sort order and add 1
        STARTUP_STATUSES.with(|statuses| {
            statuses.borrow()
                .iter()
                .filter(|(_, status)| status.accelerator_id == accelerator.id)
                .map(|(_, status)| status.sort_order)
                .max()
                .unwrap_or(0) + 1
        })
    });

    let status = StartupStatus {
        id: status_id.clone(),
        accelerator_id: accelerator.id.clone(),
        name: input.name,
        color: input.color,
        description: input.description,
        is_active: true,
        sort_order,
        created_at: now,
    };

    STARTUP_STATUSES.with(|statuses| {
        statuses.borrow_mut().insert(StableString::new(&status_id), status.clone());
    });

    Ok(status)
}

#[update]
pub fn update_startup_status(accelerator_id: String, status_id: String, input: StartupStatusInput) -> Result<(), String> {
    let caller_principal = caller();

    // Verify accelerator exists and caller has permission
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == accelerator_id).map(|(_, v)| v.clone())
    }).ok_or("Accelerator not found")?;

    let is_admin = accelerator.team_members.iter().any(|m| {
        m.principal == Some(caller_principal) &&
        (m.role == Role::SuperAdmin || m.role == Role::Admin) &&
        m.status == MemberStatus::Active
    });
    if !is_admin {
        return Err("Only SuperAdmins or Admins can update statuses".to_string());
    }

    let mut status = STARTUP_STATUSES.with(|statuses| {
        statuses.borrow().get(&StableString::new(&status_id))
    }).ok_or("Status not found")?;

    if status.accelerator_id != accelerator.id {
        return Err("Status does not belong to this accelerator".to_string());
    }

    status.name = input.name;
    status.color = input.color;
    status.description = input.description;
    if let Some(sort_order) = input.sort_order {
        status.sort_order = sort_order;
    }

    STARTUP_STATUSES.with(|statuses| {
        statuses.borrow_mut().insert(StableString::new(&status_id), status);
    });

    Ok(())
}

#[update]
pub fn delete_startup_status(accelerator_id: String, status_id: String) -> Result<(), String> {
    let caller_principal = caller();

    // Verify accelerator exists and caller has permission
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == accelerator_id).map(|(_, v)| v.clone())
    }).ok_or("Accelerator not found")?;

    let is_admin = accelerator.team_members.iter().any(|m| {
        m.principal == Some(caller_principal) &&
        (m.role == Role::SuperAdmin || m.role == Role::Admin) &&
        m.status == MemberStatus::Active
    });
    if !is_admin {
        return Err("Only SuperAdmins or Admins can delete statuses".to_string());
    }

    let status = STARTUP_STATUSES.with(|statuses| {
        statuses.borrow().get(&StableString::new(&status_id))
    }).ok_or("Status not found")?;

    if status.accelerator_id != accelerator.id {
        return Err("Status does not belong to this accelerator".to_string());
    }

    // Check if any startups are using this status
    let startups_using_status = STARTUPS.with(|startups| {
        startups.borrow()
            .iter()
            .any(|(_, startup)| startup.status_id == status_id)
    });

    if startups_using_status {
        return Err("Cannot delete status that is being used by startups".to_string());
    }

    STARTUP_STATUSES.with(|statuses| {
        statuses.borrow_mut().remove(&StableString::new(&status_id));
    });

    Ok(())
}

#[query]
pub fn list_startup_statuses(accelerator_id: String) -> Result<Vec<StartupStatus>, String> {
    let statuses: Vec<StartupStatus> = STARTUP_STATUSES.with(|statuses| {
        statuses.borrow()
            .iter()
            .filter(|(_, status)| status.accelerator_id.to_string() == accelerator_id)
            .map(|(_, status)| status.clone())
            .collect()
    });

    Ok(statuses)
}

// ==================================================================================================
// Custom Cohort Management
// ==================================================================================================

#[update]
pub fn create_startup_cohort(accelerator_id: String, input: StartupCohortInput) -> Result<StartupCohort, String> {
    let caller_principal = caller();
    let now = ic_cdk::api::time();

    // Verify accelerator exists and caller has permission
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == accelerator_id).map(|(_, v)| v.clone())
    }).ok_or("Accelerator not found")?;

    let is_admin = accelerator.team_members.iter().any(|m| {
        m.principal == Some(caller_principal) &&
        (m.role == Role::SuperAdmin || m.role == Role::Admin) &&
        m.status == MemberStatus::Active
    });
    if !is_admin {
        return Err("Only SuperAdmins or Admins can create cohorts".to_string());
    }

    let cohort_id = format!("cohort_{}", now);

    let cohort = StartupCohort {
        id: cohort_id.clone(),
        accelerator_id: accelerator.id.clone(),
        name: input.name,
        description: input.description,
        start_date: input.start_date,
        end_date: input.end_date,
        is_active: true,
        created_at: now,
    };

    STARTUP_COHORTS.with(|cohorts| {
        cohorts.borrow_mut().insert(StableString::new(&cohort_id), cohort.clone());
    });

    Ok(cohort)
}

#[update]
pub fn update_startup_cohort(accelerator_id: String, cohort_id: String, input: StartupCohortInput) -> Result<(), String> {
    let caller_principal = caller();

    // Verify accelerator exists and caller has permission
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == accelerator_id).map(|(_, v)| v.clone())
    }).ok_or("Accelerator not found")?;

    let is_admin = accelerator.team_members.iter().any(|m| {
        m.principal == Some(caller_principal) &&
        (m.role == Role::SuperAdmin || m.role == Role::Admin) &&
        m.status == MemberStatus::Active
    });
    if !is_admin {
        return Err("Only SuperAdmins or Admins can update cohorts".to_string());
    }

    let mut cohort = STARTUP_COHORTS.with(|cohorts| {
        cohorts.borrow().get(&StableString::new(&cohort_id))
    }).ok_or("Cohort not found")?;

    if cohort.accelerator_id != accelerator.id {
        return Err("Cohort does not belong to this accelerator".to_string());
    }

    cohort.name = input.name;
    cohort.description = input.description;
    cohort.start_date = input.start_date;
    cohort.end_date = input.end_date;

    STARTUP_COHORTS.with(|cohorts| {
        cohorts.borrow_mut().insert(StableString::new(&cohort_id), cohort);
    });

    Ok(())
}

#[update]
pub fn delete_startup_cohort(accelerator_id: String, cohort_id: String) -> Result<(), String> {
    let caller_principal = caller();

    // Verify accelerator exists and caller has permission
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == accelerator_id).map(|(_, v)| v.clone())
    }).ok_or("Accelerator not found")?;

    let is_admin = accelerator.team_members.iter().any(|m| {
        m.principal == Some(caller_principal) &&
        (m.role == Role::SuperAdmin || m.role == Role::Admin) &&
        m.status == MemberStatus::Active
    });
    if !is_admin {
        return Err("Only SuperAdmins or Admins can delete cohorts".to_string());
    }

    let cohort = STARTUP_COHORTS.with(|cohorts| {
        cohorts.borrow().get(&StableString::new(&cohort_id))
    }).ok_or("Cohort not found")?;

    if cohort.accelerator_id != accelerator.id {
        return Err("Cohort does not belong to this accelerator".to_string());
    }

    // Check if any startups are using this cohort
    let startups_using_cohort = STARTUPS.with(|startups| {
        startups.borrow()
            .iter()
            .any(|(_, startup)| startup.cohort_id == cohort_id)
    });

    if startups_using_cohort {
        return Err("Cannot delete cohort that is being used by startups".to_string());
    }

    STARTUP_COHORTS.with(|cohorts| {
        cohorts.borrow_mut().remove(&StableString::new(&cohort_id));
    });

    Ok(())
}

#[query]
pub fn list_startup_cohorts(accelerator_id: String) -> Result<Vec<StartupCohort>, String> {
    let cohorts: Vec<StartupCohort> = STARTUP_COHORTS.with(|cohorts| {
        cohorts.borrow()
            .iter()
            .filter(|(_, cohort)| cohort.accelerator_id.to_string() == accelerator_id)
            .map(|(_, cohort)| cohort.clone())
            .collect()
    });

    Ok(cohorts)
}

// ==================================================================================================
// Activity Tracking
// ==================================================================================================

#[update]
pub fn record_startup_activity(startup_id: String, activity_type: StartupActivityType, description: String, metadata: Option<String>) -> Result<(), String> {
    record_startup_activity_internal(&startup_id, activity_type, description, metadata);
    Ok(())
}

fn record_startup_activity_internal(startup_id: &str, activity_type: StartupActivityType, description: String, metadata: Option<String>) {
    let now = ic_cdk::api::time();
    let activity_id = format!("activity_{}", now);

    let activity = StartupActivity {
        id: activity_id,
        startup_id: startup_id.to_string(),
        activity_type,
        description,
        timestamp: now,
        metadata,
    };

    STARTUP_ACTIVITIES.with(|activities| {
        activities.borrow_mut().insert((StableString::new(startup_id), now), activity);
    });

    // Update startup's last activity - get the startup first, then update it
    let mut startup_opt = STARTUPS.with(|startups| {
        startups.borrow().get(&StableString::new(startup_id))
    });
    
    if let Some(ref mut startup) = startup_opt {
        startup.last_activity = now;
        
        // Now insert the updated startup back
        STARTUPS.with(|startups| {
            startups.borrow_mut().insert(StableString::new(startup_id), startup.clone());
        });
    }
}

#[query]
pub fn get_startup_activities(startup_id: String, limit: Option<u64>) -> Result<Vec<StartupActivity>, String> {
    let limit = limit.unwrap_or(50);
    
    let activities: Vec<StartupActivity> = STARTUP_ACTIVITIES.with(|activities| {
        activities.borrow()
            .iter()
            .filter(|((id, _), _)| id.as_str() == startup_id)
            .map(|(_, activity)| activity.clone())
            .collect()
    });

    // Sort by timestamp descending and limit
    let mut sorted_activities = activities;
    sorted_activities.sort_by_key(|a| std::cmp::Reverse(a.timestamp));
    sorted_activities.truncate(limit as usize);

    Ok(sorted_activities)
}

// ==================================================================================================
// Engagement Scoring
// ==================================================================================================

#[update]
pub fn update_engagement_score(startup_id: String, score: u32) -> Result<(), String> {
    let caller_principal = caller();
    let now = ic_cdk::api::time();

    let mut startup = STARTUPS.with(|startups| {
        startups.borrow().get(&StableString::new(&startup_id))
    }).ok_or("Startup not found")?;

    // Verify accelerator exists and caller has permission
    let accelerator = ACCELERATORS.with(|accs| {
        accs.borrow().iter().find(|(k, _)| k.to_string() == startup.accelerator_id.to_string()).map(|(_, v)| v.clone())
    }).ok_or("Accelerator not found")?;

    let is_admin = accelerator.team_members.iter().any(|m| {
        m.principal == Some(caller_principal) &&
        (m.role == Role::SuperAdmin || m.role == Role::Admin || m.role == Role::ProgramManager) &&
        m.status == MemberStatus::Active
    });
    if !is_admin {
        return Err("Only SuperAdmins, Admins, or ProgramManagers can update engagement scores".to_string());
    }

    let old_score = startup.engagement_score;
    let new_score = score.min(100); // Cap at 100
    startup.engagement_score = new_score;
    startup.updated_at = now;

    STARTUPS.with(|startups| {
        startups.borrow_mut().insert(StableString::new(&startup_id), startup);
    });

    // Record activity
    if old_score != new_score {
        let description = format!("Engagement score updated from {} to {}", old_score, new_score);
        record_startup_activity_internal(&startup_id, StartupActivityType::EngagementScoreUpdated, description, None);
    }

    Ok(())
}

#[query]
pub fn calculate_engagement_score(startup_id: String) -> Result<u32, String> {
    let startup = STARTUPS.with(|startups| {
        startups.borrow().get(&StableString::new(&startup_id))
    }).ok_or("Startup not found")?;

    let now = ic_cdk::api::time();
    let days_since_joined = (now - startup.date_joined) / (24 * 60 * 60 * 1_000_000_000);
    let days_since_last_activity = (now - startup.last_activity) / (24 * 60 * 60 * 1_000_000_000);

    // Calculate score based on various factors
    let mut score = 0u32;

    // Login frequency (max 25 points)
    if startup.total_logins > 0 {
        let login_frequency = startup.total_logins as f64 / days_since_joined.max(1) as f64;
        score += (login_frequency * 10.0).min(25.0) as u32;
    }

    // Document submissions (max 25 points)
    score += (startup.documents_submitted * 5).min(25);

    // Task completions (max 25 points)
    score += (startup.tasks_completed * 5).min(25);

    // Recent activity (max 25 points)
    if days_since_last_activity <= 7 {
        score += 25;
    } else if days_since_last_activity <= 30 {
        score += 15;
    } else if days_since_last_activity <= 90 {
        score += 5;
    }

    Ok(score.min(100))
} 