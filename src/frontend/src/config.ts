/// <reference types="vite/client" />

// Canister IDs
export const MAINNET_CANISTER_ID = "g7ko2-fyaaa-aaaam-qdlea-cai"; 
export const LOCAL_CANISTER_ID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
export const PLAYGROUND_CANISTER_ID = 'ocpcu-jaaaa-aaaab-qab6q-cai';

// Environment Configuration
export const ENV = {
  // Host configuration - use icp0.io for mainnet, localhost:4943 for local development
  host: import.meta.env.VITE_DFX_NETWORK === 'ic' 
    ? 'https://icp0.io'
    : import.meta.env.VITE_IC_HOST || 'http://localhost:4943'
};

// Use the appropriate canister ID based on environment
export const CANISTER_ID =
  import.meta.env.VITE_DFX_NETWORK === 'ic'
    ? (import.meta.env.VITE_ENV_MODE === 'playground'
        ? PLAYGROUND_CANISTER_ID
        : MAINNET_CANISTER_ID)
    : LOCAL_CANISTER_ID;

// Debug: Log the canister ID and environment at runtime
console.log('[Infoundr] ENV:', import.meta.env.VITE_DFX_NETWORK, 'MODE:', import.meta.env.VITE_ENV_MODE, 'CANISTER_ID:', CANISTER_ID);

if (typeof window !== 'undefined') {
  const expectedMainnet = MAINNET_CANISTER_ID;
  const expectedLocal = LOCAL_CANISTER_ID;
  const expectedPlayground = PLAYGROUND_CANISTER_ID;
  const current = CANISTER_ID;
  const env = import.meta.env.VITE_DFX_NETWORK;
  const mode = import.meta.env.VITE_ENV_MODE;
  if (env === 'ic' && mode === 'playground' && current !== expectedPlayground) {
    console.warn('[Infoundr] WARNING: Frontend is running in playground mode but CANISTER_ID does not match PLAYGROUND_CANISTER_ID!');
  }
  if (env === 'ic' && mode !== 'playground' && current !== expectedMainnet) {
    console.warn('[Infoundr] WARNING: Frontend is running in mainnet mode but CANISTER_ID does not match MAINNET_CANISTER_ID!');
  }
  if (env === 'local' && current !== expectedLocal) {
    console.warn('[Infoundr] WARNING: Frontend is running in local mode but CANISTER_ID does not match LOCAL_CANISTER_ID!');
  }
}

// Mock user for development
export const MOCK_USER = {
  principal: "mock-principal",
  name: "Development User",
  openchat_id: "mock-openchat-id"
};