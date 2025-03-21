export interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    due_date: bigint;
    created_at: bigint;
} 