import { _SERVICE } from "../../../declarations/backend/backend.did";

// Mock chat history data
export const mockChatHistory = [
    {
        timestamp: BigInt(Date.now() * 1_000_000),
        bot_name: "AI Assistant",
        question_asked: "How can I improve my startup's marketing strategy?",
        content: "Here are some key strategies to improve your startup's marketing: 1. Focus on content marketing 2. Leverage social media 3. Build an email list 4. Implement SEO best practices"
    },
    {
        timestamp: BigInt((Date.now() - 86400000) * 1_000_000), // 1 day ago
        bot_name: "AI Assistant",
        question_asked: "What are the best practices for fundraising?",
        content: "Key fundraising best practices include: 1. Prepare a solid pitch deck 2. Network with investors 3. Have clear financial projections 4. Understand your valuation"
    }
] as const;

export const mockTasks = [
    {
        id: "1",
        title: "Update Marketing Strategy",
        description: "Revise the marketing plan based on recent market analysis",
        due_date: BigInt((Date.now() + 86400000) * 1_000_000), // Tomorrow
        status: "pending"
    },
    {
        id: "2",
        title: "Prepare Investor Pitch",
        description: "Create presentation for upcoming investor meeting",
        due_date: BigInt((Date.now() + 172800000) * 1_000_000), // 2 days from now
        status: "completed"
    },
    {
        id: "3",
        title: "Product Roadmap Review",
        description: "Review and update the product development timeline",
        due_date: BigInt((Date.now() + 259200000) * 1_000_000), // 3 days from now
        status: "pending"
    }
];

export const mockGithubIssues = [
    {
        id: "1",
        title: "Implement user authentication",
        description: "Add secure user authentication system using OAuth",
        created_at: BigInt((Date.now() - 259200000) * 1_000_000), // 3 days ago
        html_url: "https://github.com/your-repo/issues/1"
    },
    {
        id: "2",
        title: "Fix mobile responsiveness",
        description: "Improve mobile UI and fix layout issues on smaller screens",
        created_at: BigInt((Date.now() - 172800000) * 1_000_000), // 2 days ago
        html_url: "https://github.com/your-repo/issues/2"
    },
    {
        id: "3",
        title: "Add dark mode support",
        description: "Implement dark mode theme and toggle functionality",
        created_at: BigInt((Date.now() - 86400000) * 1_000_000), // 1 day ago
        html_url: "https://github.com/your-repo/issues/3"
    }
];

// Use mock data when in local development or when explicitly set in environment
export const useMockData = import.meta.env.VITE_AUTH_MODE === 'mock';

// Mock actor implementation for testing
export const mockActor: _SERVICE = {
    get_chat_history: async () => {
        console.log("Mock actor: get_chat_history called");
        return mockChatHistory;
    },
    get_user_tasks: async () => mockTasks,
    get_user_issues: async () => mockGithubIssues,
    // Add other required methods with empty implementations
    get_user_profile: async () => ({ name: "Test User", email: "test@example.com" }),
    update_user_profile: async () => ({ success: true }),
    create_task: async () => ({ id: "new-task" }),
    update_task: async () => ({ success: true }),
    delete_task: async () => ({ success: true }),
    sync_github_issues: async () => ({ success: true }),
    add_chat_message: async () => ({ success: true }),
    check_auth: async () => ({ authenticated: true }),
    ensure_openchat_user: async () => ({ success: true }),
    generate_dashboard_token: async () => ({ token: "mock-token" }),
    get_user_identifier: async () => ({ Principal: "mock-principal" }),
    get_user_settings: async () => ({ settings: {} }),
    update_user_settings: async () => ({ success: true }),
    get_user_notifications: async () => ([]),
    mark_notification_read: async () => ({ success: true }),
    get_user_analytics: async () => ({ data: {} }),
    get_user_integrations: async () => ([]),
    add_integration: async () => ({ success: true }),
    remove_integration: async () => ({ success: true }),
    get_user_workflows: async () => ([]),
    create_workflow: async () => ({ id: "new-workflow" }),
    update_workflow: async () => ({ success: true }),
    delete_workflow: async () => ({ success: true }),
    get_user_documents: async () => ([]),
    upload_document: async () => ({ id: "new-document" }),
    delete_document: async () => ({ success: true }),
    get_user_calendar: async () => ([]),
    add_calendar_event: async () => ({ id: "new-event" }),
    update_calendar_event: async () => ({ success: true }),
    delete_calendar_event: async () => ({ success: true }),
    get_user_contacts: async () => ([]),
    add_contact: async () => ({ id: "new-contact" }),
    update_contact: async () => ({ success: true }),
    delete_contact: async () => ({ success: true }),
    get_user_notes: async () => ([]),
    add_note: async () => ({ id: "new-note" }),
    update_note: async () => ({ success: true }),
    delete_note: async () => ({ success: true }),
    get_user_reminders: async () => ([]),
    add_reminder: async () => ({ id: "new-reminder" }),
    update_reminder: async () => ({ success: true }),
    delete_reminder: async () => ({ success: true })
} as unknown as _SERVICE; 