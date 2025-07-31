# Agent Service Documentation

## Overview

The Agent Service is a new backend service designed to support AI-powered agents that can perform various tasks for users, including:

1. **Scheduling meetings** (Calendar integration)
2. **Sending emails** (Gmail integration)
3. **Assigning and managing tasks** (Asana integration)
4. **Managing GitHub requests** (GitHub integration)

This service follows the same architectural patterns as the existing account service and provides comprehensive data storage and management for agent interactions.

## Architecture

### Models (`src/backend/src/models/agent.rs`)

The agent service defines several key data structures:

#### `AgentSession`
- Manages active user sessions with different agent types
- Tracks tokens, project IDs, and selected repositories
- Maintains session state (active/inactive) and timestamps

#### `AgentCredentials`
- Stores authentication tokens and OAuth data for each service
- Supports workspace IDs, project IDs, and repository selections
- Includes expiration tracking for token management

#### `AgentInteraction`
- Records all user-agent interactions
- Stores messages, responses, success status, and metadata
- Enables conversation history and analytics

#### `AgentActivity`
- Tracks all agent-related activities for audit and analytics
- Supports various activity types (session creation, token storage, etc.)
- Includes metadata for detailed activity tracking

#### `AgentType`
- Enum defining supported agent types:
  - `GitHub` - For GitHub operations
  - `Asana` - For project management
  - `Gmail` - For email operations
  - `Calendar` - For scheduling
  - `InFoundr` - Unified agent

### Service (`src/backend/src/services/agent_service.rs`)

The agent service provides comprehensive functionality:

#### Session Management
- `create_agent_session()` - Create new agent sessions
- `update_agent_session()` - Update session data
- `end_agent_session()` - Mark sessions as inactive
- `get_agent_session()` - Retrieve specific sessions
- `get_user_agent_sessions()` - Get all sessions for a user

#### Credentials Management
- `store_agent_credentials()` - Store authentication tokens
- `update_agent_credentials()` - Update existing credentials
- `get_agent_credentials()` - Retrieve credentials for specific agent
- `get_user_agent_credentials()` - Get all credentials for a user

#### Interaction Management
- `store_agent_interaction()` - Record user-agent interactions
- `get_agent_interaction()` - Retrieve specific interactions
- `get_user_agent_interactions()` - Get user's interaction history
- `get_agent_type_interactions()` - Get interactions for specific agent type

#### Activity Tracking
- `log_agent_activity()` - Record agent activities
- `get_user_agent_activities()` - Get user's activity history

#### Status and Analytics
- `get_agent_status()` - Get comprehensive user agent status
- `cleanup_expired_sessions()` - Clean up old sessions
- `cleanup_expired_credentials()` - Clean up expired tokens

### Storage (`src/backend/src/storage/memory.rs`)

The service uses stable storage with the following maps:

- `AGENT_SESSIONS` - Stores active and inactive sessions
- `AGENT_INTERACTIONS` - Stores all user-agent interactions
- `AGENT_CREDENTIALS` - Stores authentication tokens and data
- `AGENT_ACTIVITIES` - Stores activity logs

## Integration with Python Agent

The Rust backend service is designed to work seamlessly with your Python agent system. Here's how they integrate:

### Data Flow

1. **Python Agent** receives user requests and processes them
2. **Python Agent** calls Rust backend to store/retrieve data
3. **Rust Backend** provides persistent storage and data management
4. **Python Agent** uses stored credentials and session data

### Key Integration Points

#### Session Management
```rust
// Create session when user starts using an agent
create_agent_session(user_id, AgentType::GitHub, Some(token), None, None)

// Update session with new data
update_agent_session(session_id, Some(new_token), None, Some(repo))
```

#### Credentials Storage
```rust
// Store GitHub credentials
store_agent_credentials(
    user_id,
    AgentType::GitHub,
    token,
    None,
    None,
    vec![],
    Some("owner/repo"),
    None
)
```

#### Interaction Logging
```rust
// Log successful interaction
store_agent_interaction(
    user_id,
    AgentType::GitHub,
    "Create issue for login bug",
    "Issue #123 created successfully",
    true,
    Some(r#"{"issue_id": "123"}"#)
)
```

## Usage Examples

### Setting up a GitHub Agent Session

```rust
// 1. Create session
let session_id = create_agent_session(
    "user_123".to_string(),
    AgentType::GitHub,
    Some("github_pat_token".to_string()),
    None,
    None
)?;

// 2. Store credentials
store_agent_credentials(
    "user_123".to_string(),
    AgentType::GitHub,
    "github_pat_token".to_string(),
    None,
    None,
    vec![],
    Some("owner/repo".to_string()),
    None
)?;

// 3. Log interaction
store_agent_interaction(
    "user_123".to_string(),
    AgentType::GitHub,
    "List all open issues".to_string(),
    "Found 5 open issues".to_string(),
    true,
    None
)?;
```

### Managing Multiple Agent Types

```rust
// User can have multiple active sessions
create_agent_session("user_123", AgentType::GitHub, Some(token), None, None)?;
create_agent_session("user_123", AgentType::Asana, Some(token), None, None)?;
create_agent_session("user_123", AgentType::Gmail, Some(token), None, None)?;

// Get status overview
let status = get_agent_status("user_123".to_string());
println!("Active sessions: {}", status.active_sessions);
println!("Connected agents: {}", status.connected_agents);
```

## Testing

The service includes comprehensive integration tests (`src/backend/tests/agent_integration_tests.rs`) that verify:

- Session creation and management
- Credentials storage and retrieval
- Interaction logging and retrieval
- Status reporting and analytics
- Cleanup operations

## Benefits

1. **Persistent Storage** - All agent data is stored on the Internet Computer
2. **Scalable** - Supports multiple users and agent types
3. **Auditable** - Complete activity and interaction logging
4. **Secure** - Token management with expiration tracking
5. **Analytics Ready** - Rich data for user behavior analysis
6. **Integration Friendly** - Designed to work with external Python agents

## Next Steps

1. **Build and Deploy** - Compile and deploy the updated backend
2. **Update Python Agent** - Modify Python agent to use Rust backend calls
3. **Add Authentication** - Implement proper user authentication
4. **Add Rate Limiting** - Implement usage limits and quotas
5. **Add Analytics** - Build dashboards for agent usage analytics
6. **Add Notifications** - Implement real-time notifications for agent activities

## File Structure

```
src/backend/src/
├── models/
│   └── agent.rs                 # Agent data models
├── services/
│   └── agent_service.rs         # Agent service implementation
├── storage/
│   └── memory.rs                # Updated with agent storage
├── lib.rs                       # Updated with agent imports
└── tests/
    └── agent_integration_tests.rs # Integration tests
``` 