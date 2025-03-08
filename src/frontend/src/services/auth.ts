import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { createActor } from "../../../declarations/backend";
import { backend } from "../../../declarations/backend";

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

export const loginWithII = async () => {
    const authClient = await AuthClient.create();
    
    const isAuthenticated = await new Promise<boolean>((resolve) => {
        authClient.login({
            identityProvider: II_URL.local,
            onSuccess: () => resolve(true),
            onError: () => resolve(false),
            windowOpenerFeatures: `
              left=${window.screen.width / 2 - 525 / 2},
              top=${window.screen.height / 2 - 705 / 2},
              toolbar=0,location=0,menubar=0,width=525,height=705
            `,
        });
    });

    if (!isAuthenticated) {
        throw new Error("Authentication failed");
    }

    return isAuthenticated;
};

export const loginWithNFID = async () => {
    const authClient = await AuthClient.create();
    
    const isAuthenticated = await new Promise<boolean>((resolve) => {
        authClient.login({
            identityProvider: NFID_URL.local,
            onSuccess: () => resolve(true),
            onError: () => resolve(false),
            windowOpenerFeatures: `
              left=${window.screen.width / 2 - 525 / 2},
              top=${window.screen.height / 2 - 705 / 2},
              toolbar=0,location=0,menubar=0,width=525,height=705
            `,
        });
    });

    if (!isAuthenticated) {
        throw new Error("Authentication failed");
    }

    return isAuthenticated;
};

export const registerUser = async (name: string) => {
    try {
        const result = await backend.register_user(name);
        if ('Err' in result) {
            throw new Error(result.Err);
        }
        return result.Ok;
    } catch (error) {
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        return await backend.get_current_user();
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

export const checkIsAuthenticated = async () => {
    try {
        const authClient = await AuthClient.create();
        if (!authClient.isAuthenticated()) {
            return false;
        }
        return await backend.check_auth();
    } catch (error) {
        console.error('Error checking auth:', error);
        return false;
    }
};

export const isRegistered = async () => {
    try {
        return await backend.is_registered();
    } catch (error) {
        console.error('Error checking registration:', error);
        return false;
    }
};

export const logout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
}; 