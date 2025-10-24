pub mod models;
pub mod services;
pub mod storage;
pub mod migrations;
pub mod payments;


// Custom getrandom implementation - for pocket ic testing only
use getrandom::register_custom_getrandom;

fn custom_getrandom(dest: &mut [u8]) -> Result<(), getrandom::Error> {
    // Use a simple time-based approach for testing
    // In production, you might want to use a more sophisticated approach
    let time = ic_cdk::api::time();
    for (i, byte) in dest.iter_mut().enumerate() {
        *byte = ((time + i as u64) % 256) as u8;
    }
    Ok(())
}

register_custom_getrandom!(custom_getrandom);

use crate::models::chat::BotType;
use crate::models::connected_accounts::ConnectedAccounts;
use crate::models::dashboard_token::DashboardToken;
use crate::models::github::Issue;
use crate::models::openchat_user::OpenChatUser;
use crate::models::discord_user::DiscordUser;
use crate::models::slack_user::SlackUser;
use crate::models::task::Task;
use crate::models::{
    api_message::{ApiMessage, ApiMetadata}, chat::ChatMessage, stable_principal::StablePrincipal, user::User,
    waitlist::WaitlistEntry,
};
use crate::models::startup::{Startup, StartupStatus, StartupCohort, StartupActivity, StartupInput, StartupUpdate, StartupStatusInput, StartupCohortInput, StartupFilter, StartupStats, StartupActivityType};
use crate::models::business_profile::BusinessProfile;
use crate::services::account_service::ConnectionStatus;
use crate::services::account_service::{UserActivity, UserIdentifier,  UserIdentifier as AccountUserIdentifier};
use crate::storage::memory::{
    API_MESSAGES, CHAT_HISTORY, CONNECTED_ACCOUNTS, DASHBOARD_TOKENS, OPENCHAT_USERS, SLACK_USERS, DISCORD_USERS, TASKS, USERS, WAITLIST, GITHUB_ISSUES,
    STARTUPS, STARTUP_STATUSES, STARTUP_COHORTS, STARTUP_ACTIVITIES, ACCELERATORS, STARTUP_INVITES, ADMINS, BUSINESS_PROFILES,
};
use candid::Principal;
use ic_cdk::storage::{stable_restore, stable_save};
use crate::services::token_service::TokenValidationResult;
use crate::services::accelerator_service::{AcceleratorSignUp, TeamMemberInviteWithId, UpdateTeamMemberRole, RemoveTeamMember, AcceleratorUpdateWithId, AcceleratorUpdate};
use crate::models::accelerator::{Accelerator, TeamMember};
use crate::models::startup_invite::StartupInvite;
use crate::services::accelerator_service::TeamInvite;
use crate::services::accelerator_service::{GenerateStartupInviteInput, StartupRegistrationInput};
pub use crate::models::usage_service::{UsageStats, UserTier, UserSubscription};
pub use crate::services::admin::{UserActivityReport, PaymentStats};
use crate::models::admin::PlaygroundStats;
use crate::migrations::{CurrentStableState, migrate_from_bytes};
use crate::services::payment_service::{InitializePaymentRequest, InitializePaymentResponse};

#[derive(candid::CandidType, candid::Deserialize)]
struct StableState {
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
    startup_statuses: Vec<(StableString, StartupStatus)>,
    startup_cohorts: Vec<(StableString, StartupCohort)>,
    startup_activities: Vec<((StableString, u64), StartupActivity)>,
    admins: Vec<(StablePrincipal, crate::models::admin::Admin)>,
    business_profiles: Vec<(StablePrincipal, BusinessProfile)>,
}

#[ic_cdk::pre_upgrade]
fn pre_upgrade() {
    let users = USERS.with(|users| users.borrow().iter().collect::<Vec<_>>());
    let waitlist = WAITLIST.with(|w| w.borrow().iter().collect::<Vec<_>>());
    let chat_history = CHAT_HISTORY.with(|h| h.borrow().iter().collect::<Vec<_>>());
    let api_messages = API_MESSAGES.with(|m| m.borrow().iter().collect::<Vec<_>>());
    let connected_accounts = CONNECTED_ACCOUNTS.with(|ca| ca.borrow().iter().collect::<Vec<_>>());
    let tasks = TASKS.with(|t| t.borrow().iter().collect::<Vec<_>>());
    let github_issues = GITHUB_ISSUES.with(|i| i.borrow().iter().collect::<Vec<_>>());
    let openchat_users = OPENCHAT_USERS.with(|u| u.borrow().iter().collect::<Vec<_>>());
    let slack_users = SLACK_USERS.with(|u| u.borrow().iter().collect::<Vec<_>>());
    let discord_users = DISCORD_USERS.with(|u| u.borrow().iter().collect::<Vec<_>>());
    let dashboard_tokens = DASHBOARD_TOKENS.with(|t| t.borrow().iter().collect::<Vec<_>>());
    let accelerators = ACCELERATORS.with(|a| a.borrow().iter().collect::<Vec<_>>());
    let startup_invites = STARTUP_INVITES.with(|i| i.borrow().iter().collect::<Vec<_>>());
    let startups = STARTUPS.with(|s| s.borrow().iter().collect::<Vec<_>>());
    let startup_statuses = STARTUP_STATUSES.with(|s| s.borrow().iter().collect::<Vec<_>>());
    let startup_cohorts = STARTUP_COHORTS.with(|c| c.borrow().iter().collect::<Vec<_>>());
    let startup_activities = STARTUP_ACTIVITIES.with(|a| a.borrow().iter().collect::<Vec<_>>());
    let admins = ADMINS.with(|a| a.borrow().iter().collect::<Vec<_>>());
    let business_profiles = BUSINESS_PROFILES.with(|b| b.borrow().iter().collect::<Vec<_>>());

    let state = StableState {
        users,
        waitlist,
        chat_history,
        api_messages,
        connected_accounts,
        tasks,
        github_issues,
        openchat_users,
        slack_users,
        discord_users,
        dashboard_tokens,
        accelerators,
        startup_invites,
        startups,
        startup_statuses,
        startup_cohorts,
        startup_activities,
        admins,
        business_profiles, 
    };

    // Serialize with bincode for better performance and compatibility
    let serialized = bincode::serialize(&state).expect("Failed to serialize state");
    stable_save((serialized,)).expect("Failed to save stable state");
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    let (state,): (StableState,) = match stable_restore() {
        Ok(data) => data,
        Err(_) => (StableState {
            users: vec![],
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
            business_profiles: vec![],
        },),
    };

    // Restore users
    USERS.with(|u| {
        let mut u = u.borrow_mut();
        for (k, v) in state.users {
            u.insert(k, v);
        }
    });

    // Restore waitlist
    WAITLIST.with(|w| {
        let mut w = w.borrow_mut();
        for (k, v) in state.waitlist {
            w.insert(k, v);
        }
    });

    // Restore chat history
    CHAT_HISTORY.with(|h| {
        let mut h = h.borrow_mut();
        for (k, v) in state.chat_history {
            h.insert(k, v);
        }
    });

    // Restore API messages
    API_MESSAGES.with(|m| {
        let mut m = m.borrow_mut();
        for (k, v) in state.api_messages {
            m.insert(k, v);
        }
    });

    // Restore connected accounts
    CONNECTED_ACCOUNTS.with(|ca| {
        let mut ca = ca.borrow_mut();
        for (k, v) in state.connected_accounts {
            ca.insert(k, v);
        }
    });

    // Restore tasks
    TASKS.with(|t| {
        let mut t = t.borrow_mut();
        for (k, v) in state.tasks {
            t.insert(k, v);
        }
    });

    // Restore GitHub issues
    GITHUB_ISSUES.with(|i| {
        let mut i = i.borrow_mut();
        for (k, v) in state.github_issues {
            i.insert(k, v);
        }
    });

    // Restore OpenChat users
    OPENCHAT_USERS.with(|u| {
        let mut u = u.borrow_mut();
        for (k, v) in state.openchat_users {
            u.insert(k, v);
        }
    });

    // Restore Slack users
    SLACK_USERS.with(|u| {
        let mut u = u.borrow_mut();
        for (k, v) in state.slack_users {
            u.insert(k, v);
        }
    });

    // Restore Discord users
    DISCORD_USERS.with(|u| {
        let mut u = u.borrow_mut();
        for (k, v) in state.discord_users {
            u.insert(k, v);
        }
    });

    // Restore dashboard tokens
    DASHBOARD_TOKENS.with(|t| {
        let mut t = t.borrow_mut();
        for (k, v) in state.dashboard_tokens {
            t.insert(k, v);
        }
    });

    // Restore accelerators
    ACCELERATORS.with(|a| {
        let mut a = a.borrow_mut();
        for (k, v) in state.accelerators {
            a.insert(k, v);
        }
    });

    // Restore startup invites
    STARTUP_INVITES.with(|i| {
        let mut i = i.borrow_mut();
        for (k, v) in state.startup_invites {
            i.insert(k, v);
        }
    });

    // Restore startups
    STARTUPS.with(|s| {
        let mut s = s.borrow_mut();
        for (k, v) in state.startups {
            s.insert(k, v);
        }
    });

    // Restore startup statuses
    STARTUP_STATUSES.with(|s| {
        let mut s = s.borrow_mut();
        for (k, v) in state.startup_statuses {
            s.insert(k, v);
        }
    });

    // Restore startup cohorts
    STARTUP_COHORTS.with(|c| {
        let mut c = c.borrow_mut();
        for (k, v) in state.startup_cohorts {
            c.insert(k, v);
        }
    });

    // Restore startup activities
    STARTUP_ACTIVITIES.with(|a| {
        let mut a = a.borrow_mut();
        for (k, v) in state.startup_activities {
            a.insert(k, v);
        }
    });

    // Restore admins
    ADMINS.with(|a| {
        let mut a = a.borrow_mut();
        for (k, v) in state.admins {
            a.insert(k, v);
        }
    });

    // Restore business profiles
    BUSINESS_PROFILES.with(|b| {
    let mut b = b.borrow_mut();
    for (k, v) in state.business_profiles {
        b.insert(k, v);
    }
    });

}

ic_cdk::export_candid!();