use crate::models::agent::{
    AgentSession, AgentInteraction, AgentCredentials, AgentActivity, AgentType, AgentActivityType,
};
use crate::models::stable_string::StableString;
use crate::storage::memory::{
    AGENT_SESSIONS, AGENT_INTERACTIONS, AGENT_CREDENTIALS, AGENT_ACTIVITIES,
};
use ic_cdk::{query, update};
use ic_cdk::api::time;

// Agent Session Management
#[update]
pub fn create_agent_session(
    user_id: String,
    agent_type: AgentType,
    token: Option<String>,
    project_id: Option<String>,
    selected_repo: Option<String>,
) -> Result<String, String> {
    let session_id = format!("{}_{}_{}", user_id, agent_type_to_string(&agent_type), time());
    
    let session = AgentSession {
        user_id: user_id.clone(),
        agent_type: agent_type.clone(),
        token,
        project_id,
        selected_repo,
        created_at: time(),
        last_activity: time(),
        is_active: true,
    };

    AGENT_SESSIONS.with(|sessions| {
        sessions.borrow_mut().insert(StableString::from(session_id.clone()), session);
    });

    // Log activity
    log_agent_activity(
        user_id,
        agent_type.clone(),
        AgentActivityType::SessionCreated,
        format!("Session created for {}", agent_type_to_string(&agent_type)),
        None,
    );

    Ok(session_id)
}

#[update]
pub fn update_agent_session(
    session_id: String,
    token: Option<String>,
    project_id: Option<String>,
    selected_repo: Option<String>,
) -> Result<(), String> {
    AGENT_SESSIONS.with(|sessions| {
        let mut sessions = sessions.borrow_mut();
        if let Some(mut session) = sessions.get(&StableString::from(session_id.clone())) {
            if let Some(token) = token {
                session.token = Some(token);
            }
            if let Some(project_id) = project_id {
                session.project_id = Some(project_id);
            }
            if let Some(selected_repo) = selected_repo {
                session.selected_repo = Some(selected_repo);
            }
            session.last_activity = time();
            sessions.insert(StableString::from(session_id), session);
            Ok(())
        } else {
            Err("Session not found".to_string())
        }
    })
}

#[update]
pub fn end_agent_session(session_id: String) -> Result<(), String> {
    AGENT_SESSIONS.with(|sessions| {
        let mut sessions = sessions.borrow_mut();
        if let Some(mut session) = sessions.get(&StableString::from(session_id.clone())) {
            session.is_active = false;
            session.last_activity = time();
            let agent_type = session.agent_type.clone();
            let user_id = session.user_id.clone();
            sessions.insert(StableString::from(session_id), session);
            
            // Log activity
            log_agent_activity(
                user_id,
                agent_type.clone(),
                AgentActivityType::SessionEnded,
                format!("Session ended for {}", agent_type_to_string(&agent_type)),
                None,
            );
            
            Ok(())
        } else {
            Err("Session not found".to_string())
        }
    })
}

#[query]
pub fn get_agent_session(session_id: String) -> Option<AgentSession> {
    AGENT_SESSIONS.with(|sessions| {
        sessions.borrow().get(&StableString::from(session_id))
    })
}

#[query]
pub fn get_user_agent_sessions(user_id: String) -> Vec<AgentSession> {
    AGENT_SESSIONS.with(|sessions| {
        sessions
            .borrow()
            .iter()
            .filter(|(_, session)| session.user_id == user_id)
            .map(|(_, session)| session.clone())
            .collect()
    })
}

// Agent Credentials Management
#[update]
pub fn store_agent_credentials(
    user_id: String,
    agent_type: AgentType,
    token: String,
    token_data: Option<String>,
    workspace_id: Option<String>,
    project_ids: Vec<(String, String)>,
    selected_repo: Option<String>,
    expires_at: Option<u64>,
) -> Result<(), String> {
    let credential_id = format!("{}_{}", user_id, agent_type_to_string(&agent_type));
    
    let credentials = AgentCredentials {
        user_id: user_id.clone(),
        agent_type: agent_type.clone(),
        token,
        token_data,
        workspace_id,
        project_ids,
        selected_repo,
        created_at: time(),
        expires_at,
    };

    AGENT_CREDENTIALS.with(|creds| {
        creds.borrow_mut().insert(StableString::from(credential_id), credentials);
    });

    // Log activity
    log_agent_activity(
        user_id,
        agent_type.clone(),
        AgentActivityType::TokenStored,
        format!("Credentials stored for {}", agent_type_to_string(&agent_type)),
        None,
    );

    Ok(())
}

#[update]
pub fn update_agent_credentials(
    user_id: String,
    agent_type: AgentType,
    token: Option<String>,
    token_data: Option<String>,
    workspace_id: Option<String>,
    project_ids: Option<Vec<(String, String)>>,
    selected_repo: Option<String>,
    expires_at: Option<u64>,
) -> Result<(), String> {
    let credential_id = format!("{}_{}", user_id, agent_type_to_string(&agent_type));
    
    AGENT_CREDENTIALS.with(|creds| {
        let mut creds = creds.borrow_mut();
        if let Some(mut credential) = creds.get(&StableString::from(credential_id.clone())) {
            if let Some(token) = token {
                credential.token = token;
            }
            if let Some(token_data) = token_data {
                credential.token_data = Some(token_data);
            }
            if let Some(workspace_id) = workspace_id {
                credential.workspace_id = Some(workspace_id);
            }
            if let Some(project_ids) = project_ids {
                credential.project_ids = project_ids;
            }
            if let Some(selected_repo) = selected_repo {
                credential.selected_repo = Some(selected_repo);
            }
            if let Some(expires_at) = expires_at {
                credential.expires_at = Some(expires_at);
            }
            creds.insert(StableString::from(credential_id), credential);
            Ok(())
        } else {
            Err("Credentials not found".to_string())
        }
    })
}

#[query]
pub fn get_agent_credentials(user_id: String, agent_type: AgentType) -> Option<AgentCredentials> {
    let credential_id = format!("{}_{}", user_id, agent_type_to_string(&agent_type));
    AGENT_CREDENTIALS.with(|creds| {
        creds.borrow().get(&StableString::from(credential_id))
    })
}

#[query]
pub fn get_user_agent_credentials(user_id: String) -> Vec<AgentCredentials> {
    AGENT_CREDENTIALS.with(|creds| {
        creds
            .borrow()
            .iter()
            .filter(|(_, credential)| credential.user_id == user_id)
            .map(|(_, credential)| credential.clone())
            .collect()
    })
}

// Agent Interaction Management
#[update]
pub fn store_agent_interaction(
    user_id: String,
    agent_type: AgentType,
    message: String,
    response: String,
    success: bool, 
    metadata: Option<String>,
) -> Result<String, String> {
    let interaction_id = format!("{}_{}_{}", user_id, agent_type_to_string(&agent_type), time());
    
    let interaction = AgentInteraction {
        id: interaction_id.clone(),
        user_id: user_id.clone(),
        agent_type: agent_type.clone(),
        message,
        response,
        timestamp: time(),
        success,
        metadata,
    };

    AGENT_INTERACTIONS.with(|interactions| {
        interactions.borrow_mut().insert(
            (StableString::from(interaction_id.clone()), time()),
            interaction,
        );
    });

    // Log activity
    log_agent_activity(
        user_id,
        agent_type.clone(),
        AgentActivityType::InteractionCompleted,
        format!("Interaction completed for {}", agent_type_to_string(&agent_type)),
        None,
    );

    Ok(interaction_id)
}

#[query]
pub fn get_agent_interaction(interaction_id: String) -> Option<AgentInteraction> {
    AGENT_INTERACTIONS.with(|interactions| {
        interactions
            .borrow()
            .iter()
            .find(|(_, interaction)| interaction.id == interaction_id)
            .map(|(_, interaction)| interaction.clone())
    })
}

#[query]
pub fn get_user_agent_interactions(user_id: String, limit: Option<u32>) -> Vec<AgentInteraction> {
    let limit = limit.unwrap_or(50);
    AGENT_INTERACTIONS.with(|interactions| {
        let mut user_interactions: Vec<AgentInteraction> = interactions
            .borrow()
            .iter()
            .filter(|(_, interaction)| interaction.user_id == user_id)
            .map(|(_, interaction)| interaction.clone())
            .collect();
        
        // Sort by timestamp descending (most recent first)
        user_interactions.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        
        // Take only the limit
        user_interactions.truncate(limit as usize);
        user_interactions
    })
}

#[query]
pub fn get_agent_type_interactions(user_id: String, agent_type: AgentType, limit: Option<u32>) -> Vec<AgentInteraction> {
    let limit = limit.unwrap_or(50);
    AGENT_INTERACTIONS.with(|interactions| {
        let mut type_interactions: Vec<AgentInteraction> = interactions
            .borrow()
            .iter()
            .filter(|(_, interaction)| {
                interaction.user_id == user_id && interaction.agent_type == agent_type
            })
            .map(|(_, interaction)| interaction.clone())
            .collect();
        
        // Sort by timestamp descending (most recent first)
        type_interactions.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        
        // Take only the limit
        type_interactions.truncate(limit as usize);
        type_interactions
    })
}

// Agent Activity Management
#[update]
pub fn log_agent_activity(
    user_id: String,
    agent_type: AgentType,
    activity_type: AgentActivityType,
    description: String,
    metadata: Option<String>,
) {
    let activity = AgentActivity {
        user_id: user_id.clone(),
        agent_type: agent_type.clone(),
        activity_type,
        description,
        timestamp: time(),
        metadata,
    };

    AGENT_ACTIVITIES.with(|activities| {
        activities.borrow_mut().insert(
            (StableString::from(user_id), time()),
            activity,
        );
    });
}

#[query]
pub fn get_user_agent_activities(user_id: String, limit: Option<u32>) -> Vec<AgentActivity> {
    let limit = limit.unwrap_or(100);
    AGENT_ACTIVITIES.with(|activities| {
        let mut user_activities: Vec<AgentActivity> = activities
            .borrow()
            .iter()
            .filter(|((activity_user_id, _), _)| activity_user_id.as_str() == user_id)
            .map(|(_, activity)| activity.clone())
            .collect();
        
        // Sort by timestamp descending (most recent first)
        user_activities.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        
        // Take only the limit
        user_activities.truncate(limit as usize);
        user_activities
    })
}

// Utility Functions
fn agent_type_to_string(agent_type: &AgentType) -> String {
    match agent_type {
        AgentType::GitHub => "github".to_string(),
        AgentType::Asana => "asana".to_string(),
        AgentType::Gmail => "gmail".to_string(),
        AgentType::Calendar => "calendar".to_string(),
        AgentType::InFoundr => "infoundr".to_string(),
    }
}

// Agent Status and Statistics
#[query]
pub fn get_agent_status(user_id: String) -> AgentStatus {
    let sessions = get_user_agent_sessions(user_id.clone());
    let credentials = get_user_agent_credentials(user_id.clone());
    let recent_interactions = get_user_agent_interactions(user_id.clone(), Some(10));
    let recent_activities = get_user_agent_activities(user_id.clone(), Some(20));

    AgentStatus {
        user_id,
        active_sessions: sessions.iter().filter(|s| s.is_active).count() as u32,
        total_sessions: sessions.len() as u32,
        connected_agents: credentials.len() as u32,
        recent_interactions: recent_interactions.len() as u32,
        recent_activities: recent_activities.len() as u32,
        last_activity: sessions.iter().map(|s| s.last_activity).max().unwrap_or(0),
    }
}

#[derive(candid::CandidType, serde::Deserialize, Clone, Debug)]
pub struct AgentStatus {
    pub user_id: String,
    pub active_sessions: u32,
    pub total_sessions: u32,
    pub connected_agents: u32,
    pub recent_interactions: u32,
    pub recent_activities: u32,
    pub last_activity: u64,
}

// Cleanup Functions
#[update]
pub fn cleanup_expired_sessions() -> u32 {
    let current_time = time();
    let mut cleaned_count = 0;

    AGENT_SESSIONS.with(|sessions| {
        let mut sessions = sessions.borrow_mut();
        let expired_sessions: Vec<String> = sessions
            .iter()
            .filter(|(_, session)| {
                // Mark sessions as inactive if they haven't been active for 24 hours
                session.is_active && (current_time - session.last_activity) > 86400_000_000_000 // 24 hours in nanoseconds
            })
            .map(|(session_id, _)| session_id.as_str().to_string())
            .collect();

        for session_id in expired_sessions {
            if let Some(mut session) = sessions.get(&StableString::from(session_id.clone())) {
                session.is_active = false;
                sessions.insert(StableString::from(session_id), session);
                cleaned_count += 1;
            }
        }
    });

    cleaned_count
}

#[update]
pub fn cleanup_expired_credentials() -> u32 {
    let current_time = time();
    let mut cleaned_count = 0;

    AGENT_CREDENTIALS.with(|creds| {
        let mut creds = creds.borrow_mut();
        let expired_creds: Vec<String> = creds
            .iter()
            .filter(|(_, credential)| {
                if let Some(expires_at) = credential.expires_at {
                    current_time > expires_at
                } else {
                    false
                }
            })
            .map(|(cred_id, _)| cred_id.as_str().to_string())
            .collect();

        for cred_id in expired_creds {
            creds.remove(&StableString::from(cred_id));
            cleaned_count += 1;
        }
    });

    cleaned_count
} 