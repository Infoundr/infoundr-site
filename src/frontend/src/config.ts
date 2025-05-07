/// <reference types="vite/client" />

// Canister IDs
export const MAINNET_CANISTER_ID = "g7ko2-fyaaa-aaaam-qdlea-cai"; 
export const LOCAL_CANISTER_ID = "72j4w-6qaaa-aaaab-qacxq-cai";

// Environment Configuration
export const ENV = {
  // Set this to 'local', 'playground', or 'mainnet'
  mode: import.meta.env.VITE_ENV_MODE || 'local',
  
  // Authentication mode: 'backend' for full auth, 'mock' for development
  authMode: import.meta.env.VITE_AUTH_MODE || 'backend',
  
  // Host configuration
  host: import.meta.env.VITE_DFX_NETWORK === 'ic' 
    ? (import.meta.env.VITE_IC_HOST || 'https://ic0.app')
    : 'http://localhost:8080'
};

// Use the appropriate canister ID based on environment
export const CANISTER_ID = ENV.mode === 'mainnet' 
  ? MAINNET_CANISTER_ID 
  : LOCAL_CANISTER_ID;

// Mock user for development
export const MOCK_USER = {
  principal: "mock-principal",
  name: "Development User",
  openchat_id: "mock-openchat-id"
};