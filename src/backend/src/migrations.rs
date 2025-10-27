// Migration Logic for Canister State
// This module contains all migration implementations between different versions of StableState

use serde::{Deserialize, Serialize};
use crate::models::{
    user::User, chat::ChatMessage, api_message::ApiMessage, connected_accounts::ConnectedAccounts,
    task::Task, github::Issue, openchat_user::OpenChatUser, slack_user::SlackUser,
    discord_user::DiscordUser, dashboard_token::DashboardToken, accelerator::Accelerator,
    startup_invite::StartupInvite, startup::Startup, admin::Admin, usage_service::UserSubscription,
    payment::{PaymentRecord, Invoice}, analytics::AnalyticsDataPoint
};
use crate::models::{
    stable_principal::StablePrincipal, stable_string::StableString, waitlist::WaitlistEntry
};
use crate::models::startup::{StartupStatus, StartupCohort, StartupActivity};

// Versioned stable state definitions
#[derive(Serialize, Deserialize)]
pub struct StableStateV1 {
    pub users: Vec<(StablePrincipal, User)>,
    pub waitlist: Vec<(StableString, WaitlistEntry)>,
    pub chat_history: Vec<((StablePrincipal, u64), ChatMessage)>,
    pub api_messages: Vec<((StableString, u64), ApiMessage)>,
    pub connected_accounts: Vec<(StablePrincipal, ConnectedAccounts)>,
    pub tasks: Vec<((StablePrincipal, StableString), Task)>,
    pub github_issues: Vec<((StablePrincipal, StableString), Issue)>,
    pub openchat_users: Vec<(StableString, OpenChatUser)>,
    pub slack_users: Vec<(StableString, SlackUser)>,
    pub discord_users: Vec<(StableString, DiscordUser)>,
    pub dashboard_tokens: Vec<(StableString, DashboardToken)>,
    pub accelerators: Vec<(StablePrincipal, Accelerator)>,
    pub startup_invites: Vec<(StableString, StartupInvite)>,
    pub startups: Vec<(StableString, Startup)>,
    pub startup_statuses: Vec<(StableString, StartupStatus)>,
    pub startup_cohorts: Vec<(StableString, StartupCohort)>,
    pub startup_activities: Vec<((StableString, u64), StartupActivity)>,
    pub admins: Vec<(StablePrincipal, Admin)>,
}

#[derive(Serialize, Deserialize)]
pub struct StableStateV2 {
    pub users: Vec<(StablePrincipal, User)>,
    pub waitlist: Vec<(StableString, WaitlistEntry)>,
    pub chat_history: Vec<((StablePrincipal, u64), ChatMessage)>,
    pub api_messages: Vec<((StableString, u64), ApiMessage)>,
    pub connected_accounts: Vec<(StablePrincipal, ConnectedAccounts)>,
    pub tasks: Vec<((StablePrincipal, StableString), Task)>,
    pub github_issues: Vec<((StablePrincipal, StableString), Issue)>,
    pub openchat_users: Vec<(StableString, OpenChatUser)>,
    pub slack_users: Vec<(StableString, SlackUser)>,
    pub discord_users: Vec<(StableString, DiscordUser)>,
    pub dashboard_tokens: Vec<(StableString, DashboardToken)>,
    pub accelerators: Vec<(StablePrincipal, Accelerator)>,
    pub startup_invites: Vec<(StableString, StartupInvite)>,
    pub startups: Vec<(StableString, Startup)>,
    pub startup_statuses: Vec<(StableString, StartupStatus)>,
    pub startup_cohorts: Vec<(StableString, StartupCohort)>,
    pub startup_activities: Vec<((StableString, u64), StartupActivity)>,
    pub admins: Vec<(StablePrincipal, Admin)>,
    // NEW FIELDS IN V2:
    pub user_subscriptions: Vec<(StableString, UserSubscription)>,
    pub user_daily_usage: Vec<((StableString, u64), u32)>,
}

// V3: Added payment system (payment_records, invoices)
#[derive(Serialize, Deserialize)]
pub struct StableStateV3 {
    pub users: Vec<(StablePrincipal, User)>,
    pub waitlist: Vec<(StableString, WaitlistEntry)>,
    pub chat_history: Vec<((StablePrincipal, u64), ChatMessage)>,
    pub api_messages: Vec<((StableString, u64), ApiMessage)>,
    pub connected_accounts: Vec<(StablePrincipal, ConnectedAccounts)>,
    pub tasks: Vec<((StablePrincipal, StableString), Task)>,
    pub github_issues: Vec<((StablePrincipal, StableString), Issue)>,
    pub openchat_users: Vec<(StableString, OpenChatUser)>,
    pub slack_users: Vec<(StableString, SlackUser)>,
    pub discord_users: Vec<(StableString, DiscordUser)>,
    pub dashboard_tokens: Vec<(StableString, DashboardToken)>,
    pub accelerators: Vec<(StablePrincipal, Accelerator)>,
    pub startup_invites: Vec<(StableString, StartupInvite)>,
    pub startups: Vec<(StableString, Startup)>,
    pub startup_statuses: Vec<(StableString, StartupStatus)>,
    pub startup_cohorts: Vec<(StableString, StartupCohort)>,
    pub startup_activities: Vec<((StableString, u64), StartupActivity)>,
    pub admins: Vec<(StablePrincipal, Admin)>,
    pub user_subscriptions: Vec<(StableString, UserSubscription)>,
    pub user_daily_usage: Vec<((StableString, u64), u32)>,
    // NEW FIELDS IN V3:
    pub payment_records: Vec<(StableString, PaymentRecord)>,
    pub invoices: Vec<(StableString, Invoice)>,
}

// V4: Added analytics system
#[derive(Serialize, Deserialize)]
pub struct StableStateV4 {
    pub users: Vec<(StablePrincipal, User)>,
    pub waitlist: Vec<(StableString, WaitlistEntry)>,
    pub chat_history: Vec<((StablePrincipal, u64), ChatMessage)>,
    pub api_messages: Vec<((StableString, u64), ApiMessage)>,
    pub connected_accounts: Vec<(StablePrincipal, ConnectedAccounts)>,
    pub tasks: Vec<((StablePrincipal, StableString), Task)>,
    pub github_issues: Vec<((StablePrincipal, StableString), Issue)>,
    pub openchat_users: Vec<(StableString, OpenChatUser)>,
    pub slack_users: Vec<(StableString, SlackUser)>,
    pub discord_users: Vec<(StableString, DiscordUser)>,
    pub dashboard_tokens: Vec<(StableString, DashboardToken)>,
    pub accelerators: Vec<(StablePrincipal, Accelerator)>,
    pub startup_invites: Vec<(StableString, StartupInvite)>,
    pub startups: Vec<(StableString, Startup)>,
    pub startup_statuses: Vec<(StableString, StartupStatus)>,
    pub startup_cohorts: Vec<(StableString, StartupCohort)>,
    pub startup_activities: Vec<((StableString, u64), StartupActivity)>,
    pub admins: Vec<(StablePrincipal, Admin)>,
    pub user_subscriptions: Vec<(StableString, UserSubscription)>,
    pub user_daily_usage: Vec<((StableString, u64), u32)>,
    pub payment_records: Vec<(StableString, PaymentRecord)>,
    pub invoices: Vec<(StableString, Invoice)>,
    // NEW FIELDS IN V4:
    pub user_analytics: Vec<((StableString, u64), AnalyticsDataPoint)>,
}

// Current stable state (latest version)
pub type CurrentStableState = StableStateV4;

// Migration implementations
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
            // NEW V2 FIELDS - Default empty for migration
            user_subscriptions: vec![],
            user_daily_usage: vec![],
        }
    }
}

impl From<StableStateV2> for StableStateV3 {
    fn from(v2: StableStateV2) -> Self {
        StableStateV3 {
            users: v2.users,
            waitlist: v2.waitlist,
            chat_history: v2.chat_history,
            api_messages: v2.api_messages,
            connected_accounts: v2.connected_accounts,
            tasks: v2.tasks,
            github_issues: v2.github_issues,
            openchat_users: v2.openchat_users,
            slack_users: v2.slack_users,
            discord_users: v2.discord_users,
            dashboard_tokens: v2.dashboard_tokens,
            accelerators: v2.accelerators,
            startup_invites: v2.startup_invites,
            startups: v2.startups,
            startup_statuses: v2.startup_statuses,
            startup_cohorts: v2.startup_cohorts,
            startup_activities: v2.startup_activities,
            admins: v2.admins,
            user_subscriptions: v2.user_subscriptions,
            user_daily_usage: v2.user_daily_usage,
            // NEW V3 FIELDS - Default empty for migration
            payment_records: vec![],
            invoices: vec![],
        }
    }
}

impl From<StableStateV3> for StableStateV4 {
    fn from(v3: StableStateV3) -> Self {
        StableStateV4 {
            users: v3.users,
            waitlist: v3.waitlist,
            chat_history: v3.chat_history,
            api_messages: v3.api_messages,
            connected_accounts: v3.connected_accounts,
            tasks: v3.tasks,
            github_issues: v3.github_issues,
            openchat_users: v3.openchat_users,
            slack_users: v3.slack_users,
            discord_users: v3.discord_users,
            dashboard_tokens: v3.dashboard_tokens,
            accelerators: v3.accelerators,
            startup_invites: v3.startup_invites,
            startups: v3.startups,
            startup_statuses: v3.startup_statuses,
            startup_cohorts: v3.startup_cohorts,
            startup_activities: v3.startup_activities,
            admins: v3.admins,
            user_subscriptions: v3.user_subscriptions,
            user_daily_usage: v3.user_daily_usage,
            payment_records: v3.payment_records,
            invoices: v3.invoices,
            // NEW V4 FIELDS - Default empty for migration
            user_analytics: vec![],
        }
    }
}

// Chain migration from V1 to V3
impl From<StableStateV1> for StableStateV3 {
    fn from(v1: StableStateV1) -> Self {
        let v2 = StableStateV2::from(v1);
        StableStateV3::from(v2)
    }
}

// Migration helper functions
pub fn migrate_from_v1_to_v2(v1_data: StableStateV1) -> StableStateV2 {
    v1_data.into()
}

pub fn migrate_from_v2_to_v3(v2_data: StableStateV2) -> StableStateV3 {
    v2_data.into()
}

pub fn migrate_from_v1_to_v3(v1_data: StableStateV1) -> StableStateV3 {
    v1_data.into()
}

pub fn migrate_from_bytes(bytes: &[u8]) -> Result<CurrentStableState, String> {
    // Try to deserialize as current version first
    match bincode::deserialize::<CurrentStableState>(bytes) {
        Ok(state) => Ok(state),
        Err(_) => {
            // Try V2 and migrate to V3
            match bincode::deserialize::<StableStateV2>(bytes) {
                Ok(v2_state) => {
                    println!("Migrating from V2 to V3");
                    Ok(migrate_from_v2_to_v3(v2_state).into())
                }
                Err(_) => {
                    // Try V1 and migrate to V3
                    match bincode::deserialize::<StableStateV1>(bytes) {
                        Ok(v1_state) => {
                            println!("Migrating from V1 to V3");
                            Ok(migrate_from_v1_to_v3(v1_state).into())
                        }
                        Err(e) => Err(format!("Failed to deserialize state: {:?}", e))
                    }
                }
            }
        }
    }
}
