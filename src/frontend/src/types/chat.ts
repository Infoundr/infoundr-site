export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    question_asked?: string;
    timestamp: bigint;
    bot_name?: string;
} 