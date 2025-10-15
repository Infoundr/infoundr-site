use backend::models::{
    user::User, chat::ChatMessage, api_message::ApiMessage, connected_accounts::ConnectedAccounts,
    task::Task, github::Issue, openchat_user::OpenChatUser, slack_user::SlackUser,
    discord_user::DiscordUser, dashboard_token::DashboardToken, accelerator::Accelerator,
    startup_invite::StartupInvite, startup::Startup, admin::Admin, usage_service::UserSubscription
};
use backend::models::{
    stable_principal::StablePrincipal, stable_string::StableString, waitlist::WaitlistEntry
};
use candid::Principal;
use serde::{Deserialize, Serialize};
use bincode;

// Test versioned stable state structs (copied from lib.rs for testing)
#[derive(Serialize, Deserialize)]
struct StableStateV1 {
    users: Vec<(StablePrincipal, User)>,
    waitlist: Vec<(StableString, WaitlistEntry)>,
    chat_history: Vec<((StablePrincipal, u64), ChatMessage)>,
    api_messages: Vec<((StableString, u64), ApiMessage)>,
    connected_accounts: Vec<(StablePrincipal, ConnectedAccounts)>,
    tasks: Vec<((StablePrincipal, StableString), Task)>,
    github_issues: Vec<((StablePrincipal, StableString), Issue)>,
    openchat_users: Vec<(StableString, OpenChatUser)>,
    slack_users: Vec<(StableString, SlackUser)>,
    discord_users: Vec<(StableString, DiscordUser)>,
    dashboard_tokens: Vec<(StableString, DashboardToken)>,
    accelerators: Vec<(StablePrincipal, Accelerator)>,
    startup_invites: Vec<(StableString, StartupInvite)>,
    startups: Vec<(StableString, Startup)>,
    startup_statuses: Vec<(StableString, backend::models::startup::StartupStatus)>,
    startup_cohorts: Vec<(StableString, backend::models::startup::StartupCohort)>,
    startup_activities: Vec<((StableString, u64), backend::models::startup::StartupActivity)>,
    admins: Vec<(StablePrincipal, Admin)>,
}

#[derive(Serialize, Deserialize)]
struct StableStateV2 {
    users: Vec<(StablePrincipal, User)>,
    waitlist: Vec<(StableString, WaitlistEntry)>,
    chat_history: Vec<((StablePrincipal, u64), ChatMessage)>,
    api_messages: Vec<((StableString, u64), ApiMessage)>,
    connected_accounts: Vec<(StablePrincipal, ConnectedAccounts)>,
    tasks: Vec<((StablePrincipal, StableString), Task)>,
    github_issues: Vec<((StablePrincipal, StableString), Issue)>,
    openchat_users: Vec<(StableString, OpenChatUser)>,
    slack_users: Vec<(StableString, SlackUser)>,
    discord_users: Vec<(StableString, DiscordUser)>,
    dashboard_tokens: Vec<(StableString, DashboardToken)>,
    accelerators: Vec<(StablePrincipal, Accelerator)>,
    startup_invites: Vec<(StableString, StartupInvite)>,
    startups: Vec<(StableString, Startup)>,
    startup_statuses: Vec<(StableString, backend::models::startup::StartupStatus)>,
    startup_cohorts: Vec<(StableString, backend::models::startup::StartupCohort)>,
    startup_activities: Vec<((StableString, u64), backend::models::startup::StartupActivity)>,
    admins: Vec<(StablePrincipal, Admin)>,
    user_subscriptions: Vec<(StableString, UserSubscription)>,
    user_daily_usage: Vec<((StableString, u64), u32)>,
}

impl From<StableStateV1> for StableStateV2 {
    fn from(v1: StableStateV1) -> Self {
        StableStateV2 {
            users: v1.users,
            waitlist: v1.waitlist,
            chat_history: v1.chat_history,
            api_messages: v1.api_messages,
            connected_accounts: v1.connected_accounts,
            tasks: v1.tasks,
            github_issues: v1.github_issues,
            openchat_users: v1.openchat_users,
            slack_users: v1.slack_users,
            discord_users: v1.discord_users,
            dashboard_tokens: v1.dashboard_tokens,
            accelerators: v1.accelerators,
            startup_invites: v1.startup_invites,
            startups: v1.startups,
            startup_statuses: v1.startup_statuses,
            startup_cohorts: v1.startup_cohorts,
            startup_activities: v1.startup_activities,
            admins: v1.admins,
            user_subscriptions: vec![], // Default empty for new field
            user_daily_usage: vec![],   // Default empty for new field
        }
    }
}

fn create_test_v1_state() -> StableStateV1 {
    let test_principal = StablePrincipal::from(Principal::from_text("rdmx6-jaaaa-aaaaa-aaadq-cai").unwrap());
    let test_string = StableString::from("test_string".to_string());
    
    StableStateV1 {
        users: vec![(
            test_principal.clone(),
            User {
                principal: test_principal.clone(),
                name: "Test User".to_string(),
                email: Some("test@example.com".to_string()),
                created_at: 1234567890,
                subscription_tier: backend::models::user::SubscriptionTier::Free,
                openchat_id: Some("oc_user_123".to_string()),
                slack_id: Some("slack_user_123".to_string()),
                discord_id: Some("discord_user_123".to_string()),
            }
        )],
        waitlist: vec![(
            test_string.clone(),
            WaitlistEntry {
                email: "waitlist@example.com".to_string(),
                name: "Waitlist User".to_string(),
                created_at: 1234567890,
                status: backend::models::waitlist::WaitlistStatus::Pending,
            }
        )],
        chat_history: vec![],
        api_messages: vec![],
        connected_accounts: vec![],
        tasks: vec![],
        github_issues: vec![],
        openchat_users: vec![],
        slack_users: vec![],
        discord_users: vec![],
        dashboard_tokens: vec![],
        accelerators: vec![],
        startup_invites: vec![],
        startups: vec![],
        startup_statuses: vec![],
        startup_cohorts: vec![],
        startup_activities: vec![],
        admins: vec![],
    }
}

#[test]
fn test_v1_to_v2_migration() {
    println!("🧪 Testing V1 to V2 migration");
    
    // Create V1 state
    let v1_state = create_test_v1_state();
    assert_eq!(v1_state.users.len(), 1);
    assert_eq!(v1_state.waitlist.len(), 1);
    
    // Serialize V1 state
    let serialized_v1 = bincode::serialize(&v1_state).expect("Failed to serialize V1 state");
    assert!(!serialized_v1.is_empty());
    
    // Try to deserialize as V2 (should fail)
    let v2_deserialize_result = bincode::deserialize::<StableStateV2>(&serialized_v1);
    assert!(v2_deserialize_result.is_err(), "V1 data should not deserialize as V2");
    
    // Deserialize as V1 and migrate to V2
    let v1_deserialized = bincode::deserialize::<StableStateV1>(&serialized_v1)
        .expect("Failed to deserialize V1 state");
    let v2_migrated = StableStateV2::from(v1_deserialized);
    
    // Verify migration
    assert_eq!(v2_migrated.users.len(), 1, "Users should be preserved");
    assert_eq!(v2_migrated.waitlist.len(), 1, "Waitlist should be preserved");
    assert_eq!(v2_migrated.user_subscriptions.len(), 0, "New field should be empty");
    assert_eq!(v2_migrated.user_daily_usage.len(), 0, "New field should be empty");
    
    // Verify data integrity
    let user = &v2_migrated.users[0].1;
    assert_eq!(user.name, "Test User");
    assert_eq!(user.email, Some("test@example.com".to_string()));
    
    let waitlist_entry = &v2_migrated.waitlist[0].1;
    assert_eq!(waitlist_entry.email, "waitlist@example.com");
    assert_eq!(waitlist_entry.name, "Waitlist User");
    
    println!("✅ V1 to V2 migration test passed");
}

#[test]
fn test_v2_direct_serialization() {
    println!("🧪 Testing V2 direct serialization");
    
    let test_principal = StablePrincipal::from(Principal::from_text("rdmx6-jaaaa-aaaaa-aaadq-cai").unwrap());
    
    let v2_state = StableStateV2 {
        users: vec![(
            test_principal.clone(),
            User {
                principal: test_principal.clone(),
                name: "V2 Test User".to_string(),
                email: Some("v2@example.com".to_string()),
                created_at: 1234567890,
                subscription_tier: backend::models::user::SubscriptionTier::Professional,
                openchat_id: Some("oc_user_v2".to_string()),
                slack_id: Some("slack_user_v2".to_string()),
                discord_id: Some("discord_user_v2".to_string()),
            }
        )],
        waitlist: vec![],
        chat_history: vec![],
        api_messages: vec![],
        connected_accounts: vec![],
        tasks: vec![],
        github_issues: vec![],
        openchat_users: vec![],
        slack_users: vec![],
        discord_users: vec![],
        dashboard_tokens: vec![],
        accelerators: vec![],
        startup_invites: vec![],
        startups: vec![],
        startup_statuses: vec![],
        startup_cohorts: vec![],
        startup_activities: vec![],
        admins: vec![],
        user_subscriptions: vec![(
            StableString::from("user123".to_string()),
            UserSubscription {
                user_id: "user123".to_string(),
                tier: backend::models::usage_service::UserTier::Pro,
                is_active: true,
                started_at_ns: Some(1234567890),
                renewed_at_ns: Some(1234567890),
                expires_at_ns: Some(1234567890 + 86400 * 30), // 30 days
            }
        )],
        user_daily_usage: vec![(
            (StableString::from("user123".to_string()), 1234567890),
            5
        )],
    };
    
    // Serialize V2 state
    let serialized_v2 = bincode::serialize(&v2_state).expect("Failed to serialize V2 state");
    assert!(!serialized_v2.is_empty());
    
    // Deserialize V2 state
    let deserialized_v2 = bincode::deserialize::<StableStateV2>(&serialized_v2)
        .expect("Failed to deserialize V2 state");
    
    // Verify deserialization
    assert_eq!(deserialized_v2.users.len(), 1);
    assert_eq!(deserialized_v2.user_subscriptions.len(), 1);
    assert_eq!(deserialized_v2.user_daily_usage.len(), 1);
    
    // Verify data integrity
    let user = &deserialized_v2.users[0].1;
    assert_eq!(user.name, "V2 Test User");
    assert_eq!(user.subscription_tier, backend::models::user::SubscriptionTier::Professional);
    
    let subscription = &deserialized_v2.user_subscriptions[0].1;
    assert_eq!(subscription.user_id, "user123");
    assert_eq!(subscription.tier, backend::models::usage_service::UserTier::Pro);
    assert!(subscription.is_active);
    
    let daily_usage = &deserialized_v2.user_daily_usage[0];
    assert_eq!(daily_usage.0 .0, StableString::from("user123".to_string()));
    assert_eq!(daily_usage.1, 5);
    
    println!("✅ V2 direct serialization test passed");
}

#[test]
fn test_migration_simulation() {
    println!("🧪 Testing complete migration simulation");
    
    // Simulate the post_upgrade logic
    let v1_state = create_test_v1_state();
    let serialized_v1 = bincode::serialize(&v1_state).expect("Failed to serialize V1 state");
    
    // Simulate the migration logic from post_upgrade
    let final_state = match bincode::deserialize::<StableStateV2>(&serialized_v1) {
        Ok(state) => {
            println!("✅ Direct V2 deserialization succeeded");
            state
        }
        Err(_) => {
            println!("✅ V2 deserialization failed, trying V1 migration");
            match bincode::deserialize::<StableStateV1>(&serialized_v1) {
                Ok(v1_state) => {
                    println!("✅ V1 deserialization succeeded, migrating to V2");
                    StableStateV2::from(v1_state)
                }
                Err(e) => {
                    println!("❌ Both V1 and V2 deserialization failed: {:?}", e);
                    panic!("Migration failed");
                }
            }
        }
    };
    
    // Verify the final state
    assert_eq!(final_state.users.len(), 1);
    assert_eq!(final_state.waitlist.len(), 1);
    assert_eq!(final_state.user_subscriptions.len(), 0);
    assert_eq!(final_state.user_daily_usage.len(), 0);
    
    println!("✅ Complete migration simulation test passed");
}
