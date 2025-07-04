mod models;
mod services;
mod storage;

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
    chat::ChatMessage, stable_principal::StablePrincipal, stable_string::StableString, user::User,
    waitlist::WaitlistEntry,
};
use crate::services::account_service::ConnectionStatus;
use crate::services::account_service::{UserActivity, UserIdentifier};
use crate::storage::memory::{
    CHAT_HISTORY, CONNECTED_ACCOUNTS, DASHBOARD_TOKENS, OPENCHAT_USERS, SLACK_USERS, DISCORD_USERS, TASKS, USERS, WAITLIST, GITHUB_ISSUES,
};
use candid::Principal;
use ic_cdk::storage::{stable_restore, stable_save};
use crate::services::token_service::TokenValidationResult;
use crate::services::accelerator_service::{AcceleratorSignUp, TeamMemberInviteWithId, UpdateTeamMemberRole, RemoveTeamMember, AcceleratorUpdateWithId, AcceleratorUpdate};
use crate::models::accelerator::{Accelerator, TeamMember};
use crate::models::startup_invite::StartupInvite;
use crate::services::accelerator_service::GenerateStartupInviteInput;

#[ic_cdk::pre_upgrade]
fn pre_upgrade() {
    let users = USERS.with(|users| users.borrow().iter().collect::<Vec<_>>());
    let waitlist = WAITLIST.with(|w| w.borrow().iter().collect::<Vec<_>>());
    let chat_history = CHAT_HISTORY.with(|h| h.borrow().iter().collect::<Vec<_>>());
    let connected_accounts = CONNECTED_ACCOUNTS.with(|ca| ca.borrow().iter().collect::<Vec<_>>());
    let tasks = TASKS.with(|t| t.borrow().iter().collect::<Vec<_>>());
    let github_issues = GITHUB_ISSUES.with(|i| i.borrow().iter().collect::<Vec<_>>());
    let openchat_users = OPENCHAT_USERS.with(|u| u.borrow().iter().collect::<Vec<_>>());
    let slack_users = SLACK_USERS.with(|u| u.borrow().iter().collect::<Vec<_>>());
    let discord_users = DISCORD_USERS.with(|u| u.borrow().iter().collect::<Vec<_>>());
    let dashboard_tokens = DASHBOARD_TOKENS.with(|t| t.borrow().iter().collect::<Vec<_>>());

    stable_save((
        users,
        waitlist,
        chat_history,
        connected_accounts,
        tasks,
        github_issues,
        openchat_users,
        slack_users,
        discord_users,
        dashboard_tokens,
    ))
    .expect("Failed to save stable state");
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    let (
        users,
        waitlist,
        chat_history,
        connected_accounts,
        tasks,
        github_issues,
        openchat_users,
        slack_users,
        discord_users,
        dashboard_tokens,
    ): (
        Vec<(StablePrincipal, User)>,
        Vec<(StableString, WaitlistEntry)>,
        Vec<((StablePrincipal, u64), ChatMessage)>,
        Vec<(StablePrincipal, ConnectedAccounts)>,
        Vec<((StablePrincipal, StableString), Task)>,
        Vec<((StablePrincipal, StableString), Issue)>,
        Vec<(StableString, OpenChatUser)>,
        Vec<(StableString, SlackUser)>,
        Vec<(StableString, DiscordUser)>,
        Vec<(StableString, DashboardToken)>,
    ) = match stable_restore() {
        Ok(data) => data,
        Err(_) => (vec![], vec![], vec![], vec![], vec![], vec![], vec![], vec![], vec![], vec![]),
    };

    // Restore users
    USERS.with(|u| {
        let mut u = u.borrow_mut();
        for (k, v) in users {
            u.insert(k, v);
        }
    });

    // Restore waitlist
    WAITLIST.with(|w| {
        let mut w = w.borrow_mut();
        for (k, v) in waitlist {
            w.insert(k, v);
        }
    });

    // Restore chat history
    CHAT_HISTORY.with(|h| {
        let mut h = h.borrow_mut();
        for (k, v) in chat_history {
            h.insert(k, v);
        }
    });

    // Restore connected accounts
    CONNECTED_ACCOUNTS.with(|ca| {
        let mut ca = ca.borrow_mut();
        for (k, v) in connected_accounts {
            ca.insert(k, v);
        }
    });

    // Restore tasks
    TASKS.with(|t| {
        let mut t = t.borrow_mut();
        for (k, v) in tasks {
            t.insert(k, v);
        }
    });

    // Restore GitHub issues
    GITHUB_ISSUES.with(|i| {
        let mut i = i.borrow_mut();
        for (k, v) in github_issues {
            i.insert(k, v);
        }
    });

    // Restore OpenChat users
    OPENCHAT_USERS.with(|u| {
        let mut u = u.borrow_mut();
        for (k, v) in openchat_users {
            u.insert(k, v);
        }
    });

    // Restore Slack users
    SLACK_USERS.with(|u| {
        let mut u = u.borrow_mut();
        for (k, v) in slack_users {
            u.insert(k, v);
        }
    });

    // Restore Discord users
    DISCORD_USERS.with(|u| {
        let mut u = u.borrow_mut();
        for (k, v) in discord_users {
            u.insert(k, v);
        }
    });

    // Restore dashboard tokens
    DASHBOARD_TOKENS.with(|t| {
        let mut t = t.borrow_mut();
        for (k, v) in dashboard_tokens {
            t.insert(k, v);
        }
    });
}

ic_cdk::export_candid!();