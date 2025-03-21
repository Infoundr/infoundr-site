use crate::storage::memory::{CONNECTED_ACCOUNTS, CHAT_HISTORY, TASKS, GITHUB_ISSUES};
use crate::models::connected_accounts::{ConnectedAccounts, AsanaAccount, GitHubAccount};
use crate::models::chat::ChatMessage;
use crate::models::task::Task;
use crate::models::stable_string::StableString;
use ic_cdk::{update, query};
use candid::Principal;
use crate::models::github::Issue;
use crate::services::openchat_service::ensure_openchat_user;
use crate::storage::memory::OPENCHAT_USERS;

// Asana connection management
#[update]
pub fn store_asana_connection(
    identifier: UserIdentifier,
    token: String,
    workspace_id: String,
    project_ids: Vec<(String, String)>
) {
    let store_principal = get_principal_from_identifier(&identifier);
    
    CONNECTED_ACCOUNTS.with(|accounts| {
        let mut accounts = accounts.borrow_mut();
        let mut user_accounts = accounts
            .get(&store_principal.into())
            .unwrap_or(ConnectedAccounts {
                asana: None,
                github: None,
            });
        
        user_accounts.asana = Some(AsanaAccount {
            token,
            workspace_id,
            project_ids,
        });
        
        accounts.insert(store_principal.into(), user_accounts);
    });
}

// GitHub connection management
#[update]
pub fn store_github_connection(
    identifier: UserIdentifier,
    token: String,
    selected_repo: Option<String>
) {
    let store_principal = get_principal_from_identifier(&identifier);
    
    CONNECTED_ACCOUNTS.with(|accounts| {
        let mut accounts = accounts.borrow_mut();
        let mut user_accounts = accounts
            .get(&store_principal.into())
            .unwrap_or(ConnectedAccounts {
                asana: None,
                github: None,
            });
        
        user_accounts.github = Some(GitHubAccount {
            token,
            selected_repo,
        });
        
        accounts.insert(store_principal.into(), user_accounts);
    });
}

// Get user's connected accounts
#[query]
pub fn get_user_connections(user: Principal) -> Option<ConnectedAccounts> {
    CONNECTED_ACCOUNTS.with(|accounts| {
        accounts.borrow().get(&user.into())
    })
}

// Update GitHub selected repository
#[update]
pub fn update_github_selected_repo(
    identifier: UserIdentifier, 
    repo: String
) -> Result<(), String> {
    let store_principal = get_principal_from_identifier(&identifier);
    
    CONNECTED_ACCOUNTS.with(|accounts| {
        let mut accounts = accounts.borrow_mut();
        if let Some(mut user_accounts) = accounts.get(&store_principal.into()) {
            if let Some(ref mut github) = user_accounts.github {
                github.selected_repo = Some(repo);
                accounts.insert(store_principal.into(), user_accounts);
                Ok(())
            } else {
                Err("GitHub account not connected".to_string())
            }
        } else {
            Err("User accounts not found".to_string())
        }
    })
}

// Message History Management
#[update]
pub fn store_chat_message(
    identifier: UserIdentifier,
    message: ChatMessage
) {
    let store_principal = match identifier {
        UserIdentifier::Principal(principal) => principal,
        UserIdentifier::OpenChatId(openchat_id) => {
            // Ensure OpenChat user exists
            ensure_openchat_user(openchat_id.clone());
            
            // Try to get linked principal, otherwise derive from openchat_id
            OPENCHAT_USERS.with(|users| {
                users.borrow()
                    .get(&StableString::from(openchat_id.clone()))
                    .and_then(|user| user.site_principal.map(|p| p.get()))
                    .unwrap_or_else(|| {
                        Principal::from_text(openchat_id).unwrap_or_else(|_| Principal::anonymous())
                    })
            })
        }
    };

    CHAT_HISTORY.with(|history| {
        let mut history = history.borrow_mut();
        let message_id = history
            .iter()
            .filter(|((user_id, _), _)| user_id.get() == store_principal)
            .count() as u64;
        
        history.insert((store_principal.into(), message_id), message);
    });
}

#[query]
pub fn get_chat_history(user: Principal) -> Vec<ChatMessage> {
    CHAT_HISTORY.with(|history| {
        history
            .borrow()
            .iter()
            .filter(|((user_id, _), _)| user_id.get() == user)
            .map(|(_, message)| message.clone())
            .collect()
    })
}

// Connected Accounts Status
#[query]
pub fn get_connection_status(user: Principal) -> ConnectionStatus {
    CONNECTED_ACCOUNTS.with(|accounts| {
        let accounts = accounts.borrow();
        if let Some(user_accounts) = accounts.get(&user.into()) {
            ConnectionStatus {
                asana_connected: user_accounts.asana.is_some(),
                github_connected: user_accounts.github.is_some(),
                selected_repo: user_accounts.github.as_ref().and_then(|gh| gh.selected_repo.clone()),
                asana_workspace: user_accounts.asana.as_ref().map(|a| a.workspace_id.clone()),
            }
        } else {
            ConnectionStatus {
                asana_connected: false,
                github_connected: false,
                selected_repo: None,
                asana_workspace: None,
            }
        }
    })
}

// GitHub Repository Management
#[query]
pub fn get_current_repo(user: Principal) -> Option<String> {
    CONNECTED_ACCOUNTS.with(|accounts| {
        accounts
            .borrow()
            .get(&user.into())
            .and_then(|accounts| accounts.github)
            .and_then(|github| github.selected_repo)
    })
}

// Asana Tasks Management
#[update]
pub fn store_asana_task(
    identifier: UserIdentifier,
    task: Task
) -> Result<(), String> {
    let store_principal = match identifier {
        UserIdentifier::Principal(principal) => principal,
        UserIdentifier::OpenChatId(openchat_id) => {
            ensure_openchat_user(openchat_id.clone());
            
            OPENCHAT_USERS.with(|users| {
                users.borrow()
                    .get(&StableString::from(openchat_id.clone()))
                    .and_then(|user| user.site_principal.map(|p| p.get()))
                    .unwrap_or_else(|| {
                        Principal::from_text(openchat_id).unwrap_or_else(|_| Principal::anonymous())
                    })
            })
        }
    };

    TASKS.with(|tasks| {
        let mut tasks = tasks.borrow_mut();
        let task_key = (store_principal.into(), StableString::from(task.id.clone()));
        tasks.insert(task_key, task);
        Ok(())
    })
}

#[query]
pub fn get_user_tasks(user: Principal) -> Vec<Task> {
    TASKS.with(|tasks| {
        tasks
            .borrow()
            .iter()
            .filter(|((user_id, _), _)| user_id.get() == user)
            .map(|(_, task)| task.clone())
            .collect()
    })
}

// GitHub Issues Management
#[update]
pub fn store_github_issue(
    identifier: UserIdentifier,
    issue: Issue
) -> Result<(), String> {
    let store_principal = match identifier {
        UserIdentifier::Principal(principal) => principal,
        UserIdentifier::OpenChatId(openchat_id) => {
            ensure_openchat_user(openchat_id.clone());
            
            OPENCHAT_USERS.with(|users| {
                users.borrow()
                    .get(&StableString::from(openchat_id.clone()))
                    .and_then(|user| user.site_principal.map(|p| p.get()))
                    .unwrap_or_else(|| {
                        Principal::from_text(openchat_id).unwrap_or_else(|_| Principal::anonymous())
                    })
            })
        }
    };

    GITHUB_ISSUES.with(|issues| {
        let mut issues = issues.borrow_mut();
        let issue_key = (store_principal.into(), StableString::from(issue.id.clone()));
        issues.insert(issue_key, issue);
        Ok(())
    })
}

#[query]
pub fn get_user_issues(user: Principal) -> Vec<Issue> {
    GITHUB_ISSUES.with(|issues| {
        issues
            .borrow()
            .iter()
            .filter(|((user_id, _), _)| user_id.get() == user)
            .map(|(_, issue)| issue.clone())
            .collect()
    })
}

// Helper struct for connection status
#[derive(candid::CandidType, serde::Deserialize, Clone, Debug)]
pub struct ConnectionStatus {
    pub asana_connected: bool,
    pub github_connected: bool,
    pub selected_repo: Option<String>,
    pub asana_workspace: Option<String>,
}

// Utility function to check if accounts are properly connected
#[query]
pub fn verify_connections(user: Principal) -> Result<(), Vec<String>> {
    let mut errors = Vec::new();
    
    CONNECTED_ACCOUNTS.with(|accounts| {
        let accounts = accounts.borrow();
        if let Some(user_accounts) = accounts.get(&user.into()) {
            // Check GitHub connection
            if user_accounts.github.is_none() {
                errors.push("GitHub not connected".to_string());
            } else if user_accounts.github.as_ref().and_then(|gh| gh.selected_repo.as_ref()).is_none() {
                errors.push("No GitHub repository selected".to_string());
            }
            
            // Check Asana connection
            if user_accounts.asana.is_none() {
                errors.push("Asana not connected".to_string());
            } else if let Some(asana) = &user_accounts.asana {
                if asana.project_ids.is_empty() {
                    errors.push("No Asana projects selected".to_string());
                }
            }
        } else {
            errors.push("No connected accounts found".to_string());
        }
    });
    
    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

// Helper function to get principal from identifier
fn get_principal_from_identifier(identifier: &UserIdentifier) -> Principal {
    match identifier {
        UserIdentifier::Principal(principal) => *principal,
        UserIdentifier::OpenChatId(openchat_id) => {
            OPENCHAT_USERS.with(|users| {
                users.borrow()
                    .get(&StableString::from(openchat_id.clone()))
                    .and_then(|user| user.site_principal.map(|p| p.get()))
                    .unwrap_or_else(|| {
                        Principal::from_text(openchat_id).unwrap_or_else(|_| Principal::anonymous())
                    })
            })
        }
    }
}

// Helper enum for user identification
#[derive(candid::CandidType, serde::Deserialize, Clone, Debug)]
pub enum UserIdentifier {
    Principal(Principal),
    OpenChatId(String),
}

// Struct to hold all user activity
#[derive(candid::CandidType, serde::Deserialize, Clone, Debug)]
pub struct UserActivity {
    pub chat_history: Vec<ChatMessage>,
    pub tasks: Vec<Task>,
    pub issues: Vec<Issue>,
    pub connection_status: ConnectionStatus,
}

// fn get_activity_by_principal(principal: Principal) -> UserActivity {
//     UserActivity {
//         chat_history: get_chat_history(principal),
//         tasks: get_user_tasks(principal),
//         issues: get_user_issues(principal),
//         connection_status: get_connection_status(principal),
//     }
// }

// fn get_activity_by_openchat_id(openchat_id: String) -> UserActivity {
//     // First try to get the linked principal
//     let principal = OPENCHAT_USERS.with(|users| {
//         users.borrow()
//             .get(&StableString::from(openchat_id.clone()))
//             .and_then(|user| user.site_principal.map(|p| p.get()))
//     });

//     match principal {
//         Some(p) => get_activity_by_principal(p),
//         None => {
//             // If no principal is linked, use the openchat_id as a derived principal
//             let derived_principal = Principal::from_text(openchat_id)
//                 .unwrap_or_else(|_| Principal::anonymous());
//             get_activity_by_principal(derived_principal)
//         }
//     }
// }