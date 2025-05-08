/// <reference types="vite/client" />

// Canister IDs
export const MAINNET_CANISTER_ID = "g7ko2-fyaaa-aaaam-qdlea-cai"; 
export const LOCAL_CANISTER_ID = "72j4w-6qaaa-aaaab-qacxq-cai";

// Environment Configuration
export const ENV = {
  // Host configuration - always use icp0.io for mainnet
  host: import.meta.env.VITE_DFX_NETWORK === 'ic' 
    ? 'https://icp0.io'
    : 'http://localhost:8080'
};

// Use the appropriate canister ID based on environment
export const CANISTER_ID = import.meta.env.VITE_DFX_NETWORK === 'ic'
  ? MAINNET_CANISTER_ID
  : LOCAL_CANISTER_ID;

// Mock user for development
export const MOCK_USER = {
  principal: "mock-principal",
  name: "Development User",
  openchat_id: "mock-openchat-id"
};