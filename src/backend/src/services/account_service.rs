use crate::storage::memory::CONNECTED_ACCOUNTS;
use crate::models::connected_accounts::{ConnectedAccounts, AsanaAccount, GitHubAccount};
use ic_cdk::{update, query};
use candid::Principal;

// Asana connection management
#[update]
pub fn store_asana_connection(
    user: Principal,
    token: String,
    workspace_id: String,
    project_ids: Vec<(String, String)>
) {
    CONNECTED_ACCOUNTS.with(|accounts| {
        let mut accounts = accounts.borrow_mut();
        let mut user_accounts = accounts
            .get(&user.into())
            .unwrap_or(ConnectedAccounts {
                asana: None,
                github: None,
            });
        
        user_accounts.asana = Some(AsanaAccount {
            token,
            workspace_id,
            project_ids,
        });
        
        accounts.insert(user.into(), user_accounts);
    });
}

// GitHub connection management
#[update]
pub fn store_github_connection(
    user: Principal,
    token: String,
    selected_repo: Option<String>
) {
    CONNECTED_ACCOUNTS.with(|accounts| {
        let mut accounts = accounts.borrow_mut();
        let mut user_accounts = accounts
            .get(&user.into())
            .unwrap_or(ConnectedAccounts {
                asana: None,
                github: None,
            });
        
        user_accounts.github = Some(GitHubAccount {
            token,
            selected_repo,
        });
        
        accounts.insert(user.into(), user_accounts);
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
pub fn update_github_selected_repo(user: Principal, repo: String) -> Result<(), String> {
    CONNECTED_ACCOUNTS.with(|accounts| {
        let mut accounts = accounts.borrow_mut();
        if let Some(mut user_accounts) = accounts.get(&user.into()) {
            if let Some(ref mut github) = user_accounts.github {
                github.selected_repo = Some(repo);
                accounts.insert(user.into(), user_accounts);
                Ok(())
            } else {
                Err("GitHub account not connected".to_string())
            }
        } else {
            Err("User accounts not found".to_string())
        }
    })
}