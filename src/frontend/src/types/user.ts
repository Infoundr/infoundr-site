import { Principal } from '@dfinity/principal';

export interface User {
    principal: Principal;
    name: string;
    created_at: bigint;
    email?: string;
    subscription_tier: 'Enterprise' | 'Free' | 'Professional';
}

export interface OpenChatUser {
    openchat_id: string;
    site_principal?: Principal;
    first_interaction: bigint;
    last_interaction: bigint;
}

// Add type for the backend response
export type OpenChatUserResponse = [] | [OpenChatUser]; 