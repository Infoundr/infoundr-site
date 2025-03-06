import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { createActor } from "../../../declarations/backend";

// Initialize AuthClient
let authClient: AuthClient | null = null;

// Canister IDs
const LOCAL_CANISTER_ID = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
const MAINNET_CANISTER_ID = ""; // Add your mainnet canister ID here

export const canisterID = import.meta.env.VITE_DFX_NETWORK === 'ic' 
  ? MAINNET_CANISTER_ID 
  : LOCAL_CANISTER_ID;

// Identity Provider URLs
const II_URL = {
  local: "http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943",
  ic: "https://identity.ic0.app"
};

const NFID_URL = {
  local: "https://nfid.one/authenticate/?applicationName=Infoundr",
  ic: "https://nfid.one"
};

export async function initializeAuthClient() {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
}

async function authenticate(identityProviderUrl: string) {
  console.log("Authenticating with:", identityProviderUrl);
  const authClient = await initializeAuthClient();
  const isAuthenticated = await authClient.isAuthenticated();
  console.log("Is Authenticated:", isAuthenticated);

  if (!isAuthenticated) {
    console.log("Authenticating...");
    await new Promise((resolve, reject) => {
      authClient!.login({
        identityProvider: identityProviderUrl,
        onSuccess: resolve,
        onError: reject,
        windowOpenerFeatures: `
          left=${window.screen.width / 2 - 525 / 2},
          top=${window.screen.height / 2 - 705 / 2},
          toolbar=0,location=0,menubar=0,width=525,height=705
        `,
      });
    });
  }

  console.log("Authenticated successfully");

  return authClient.getIdentity();
}

async function createAuthenticatedActor() {
  try {
    console.log("Creating authenticated actor");
    const identity = await authClient!.getIdentity();
    const agent = new HttpAgent({ identity });

    // Fetch root key in development
    if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
      console.log("Fetching root key");
      await agent.fetchRootKey();
    }

    return createActor(canisterID, { agent });
  } catch (error) {
    console.error("Error creating authenticated actor:", error);
    throw error;
  }
}

export async function loginWithII() {
  console.log("Login with II");
  const identityProviderUrl = import.meta.env.VITE_DFX_NETWORK === 'ic' 
    ? II_URL.ic 
    : II_URL.local;
  console.log("II Provider URL:", identityProviderUrl);
  
  await authenticate(identityProviderUrl);
  return createAuthenticatedActor();
}

export async function loginWithNFID() {
  console.log("Login with NFID");
  const identityProviderUrl = import.meta.env.VITE_DFX_NETWORK === 'ic' 
    ? NFID_URL.ic 
    : NFID_URL.local;
  console.log("Identity Provider URL:", identityProviderUrl);
  
  await authenticate(identityProviderUrl);
  return createAuthenticatedActor();
}

export async function logout() {
  const authClient = await initializeAuthClient();
  await authClient.logout();
}

export async function checkIsAuthenticated() {
  const authClient = await initializeAuthClient();
  return authClient.isAuthenticated();
} 