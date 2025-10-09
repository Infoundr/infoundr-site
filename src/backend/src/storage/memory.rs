use crate::models::admin::Admin;
use crate::models::api_message::ApiMessage;
use crate::models::connected_accounts::ConnectedAccounts;
use crate::models::dashboard_token::DashboardToken;
use crate::models::github::Issue;
use crate::models::openchat_user::OpenChatUser;
use crate::models::slack_user::SlackUser;
use crate::models::discord_user::DiscordUser;
use crate::models::stable_principal::StablePrincipal;
use crate::models::stable_string::StableString;
use crate::models::task::Task;
use crate::models::{chat::ChatMessage, user::User, waitlist::WaitlistEntry};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use std::cell::RefCell;
use crate::models::accelerator::Accelerator;
use crate::models::startup_invite::StartupInvite;
use crate::models::startup::{Startup, StartupStatus, StartupCohort, StartupActivity};
use crate::models::usage_service::UserSubscription;
use crate::models::payment::{PaymentRecord, Invoice};

pub type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    pub static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    pub static USERS: RefCell<StableBTreeMap<StablePrincipal, User, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );

    pub static WAITLIST: RefCell<StableBTreeMap<StableString, WaitlistEntry, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );

    pub static CHAT_HISTORY: RefCell<StableBTreeMap<(StablePrincipal, u64), ChatMessage, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );

    pub static ADMINS: RefCell<StableBTreeMap<StablePrincipal, Admin, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3)))
        )
    );

    pub static CONNECTED_ACCOUNTS: RefCell<StableBTreeMap<StablePrincipal, ConnectedAccounts, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4)))
        )
    );

    pub static TASKS: RefCell<StableBTreeMap<(StablePrincipal, StableString), Task, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5)))
        )
    );

    pub static OPENCHAT_USERS: RefCell<StableBTreeMap<StableString, OpenChatUser, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6)))
        )
    );

    pub static DASHBOARD_TOKENS: RefCell<StableBTreeMap<StableString, DashboardToken, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7)))
        )
    );

    pub static GITHUB_ISSUES: RefCell<StableBTreeMap<(StablePrincipal, StableString), Issue, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(8)))
        )
    );

    pub static SLACK_USERS: RefCell<StableBTreeMap<StableString, SlackUser, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(9)))
        )
    );

    pub static DISCORD_USERS: RefCell<StableBTreeMap<StableString, DiscordUser, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(10)))
        )
    );

    pub static API_MESSAGES: RefCell<StableBTreeMap<(StableString, u64), ApiMessage, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(17)))
        )
    );

    pub static ACCELERATORS: RefCell<StableBTreeMap<StablePrincipal, Accelerator, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(11)))
        )
    );

    pub static STARTUP_INVITES: RefCell<StableBTreeMap<StableString, StartupInvite, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(16)))
        )
    );

    // Startup Management Storage
    pub static STARTUPS: RefCell<StableBTreeMap<StableString, Startup, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(12)))
        )
    );

    pub static STARTUP_STATUSES: RefCell<StableBTreeMap<StableString, StartupStatus, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(13)))
        )
    );

    pub static STARTUP_COHORTS: RefCell<StableBTreeMap<StableString, StartupCohort, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(14)))
        )
    );

    pub static STARTUP_ACTIVITIES: RefCell<StableBTreeMap<(StableString, u64), StartupActivity, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(15)))
        )
    );

    // --- NEW USAGE TRACKING STORAGE ---
    pub static USER_DAILY_USAGE: RefCell<StableBTreeMap<(StableString, u64), u32, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(18)))
        )
    );

    pub static USER_SUBSCRIPTIONS: RefCell<StableBTreeMap<StableString, UserSubscription, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(19)))
        )
    );

    // --- PAYMENT STORAGE ---
    pub static PAYMENT_RECORDS: RefCell<StableBTreeMap<StableString, PaymentRecord, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(20)))
        )
    );

    pub static INVOICES: RefCell<StableBTreeMap<StableString, Invoice, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(21)))
        )
    );
}
