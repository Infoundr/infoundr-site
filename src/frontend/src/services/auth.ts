import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, ActorSubclass } from "@dfinity/agent";
import { createActor } from "../../../declarations/backend";
import type { _SERVICE } from "../../../declarations/backend/backend.did.d.ts";
import { CANISTER_ID } from '@/vite-env';
// Initialize AuthClient
let authClient: AuthClient | null = null;

// Identity Provider URLs
const II_URL = {
  local: "http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080",
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

// async function createAuthenticatedActor() {
//   try {
//     console.log("Creating authenticated actor");
//     const identity = await authClient!.getIdentity();
//     const agent = new HttpAgent({ identity });

//     // Fetch root key in development
//     if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
//       console.log("Fetching root key");
//       await agent.fetchRootKey();
//     }

//     return createActor(CANISTER_ID, { agent });
//   } catch (error) {
//     console.error("Error creating authenticated actor:", error);
//     throw error;
//   }
// }

export const loginWithII = async (): Promise<ActorSubclass<_SERVICE>> => {
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

    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity });
    
    if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
        await agent.fetchRootKey();
    }
    
    return createActor(CANISTER_ID, { agent });      
};

export const loginWithNFID = async (): Promise<ActorSubclass<_SERVICE>> => {
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

    // Create and return the authenticated actor
    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity });
    
    if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
        await agent.fetchRootKey();
    }
    
    return createActor(CANISTER_ID, { agent });
};

export const registerUser = async (name: string) => {
    try {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        const result = await actor.register_user(name);
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
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        console.log("Identity", identity);
        const agent = new HttpAgent({ identity });
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        console.log("Agent", agent);
        const actor = createActor(CANISTER_ID, { agent } );
        console.log("Actor", actor);
        return await actor.get_current_user();
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

export const checkIsAuthenticated = async () => {
    try {
        console.log("Checking authentication status");
        const authClient = await AuthClient.create();
        const isAuth = await authClient.isAuthenticated();
        console.log("AuthClient isAuthenticated:", isAuth);
        
        if (!isAuth) {
            // Check if we have a valid OpenChat session
            const openchatId = sessionStorage.getItem('openchat_id');
            if (openchatId) {
                const agent = new HttpAgent({});
                if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
                    await agent.fetchRootKey();
                }
                const actor = createActor(CANISTER_ID, { agent });
                
                // Use get_openchat_user to validate the session
                const user = await actor.get_openchat_user(openchatId);
                return user !== null && user !== undefined;
            }
            return false;
        }

        // Create authenticated actor for backend checks
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        return await actor.check_auth();
    } catch (error) {
        console.error('Error checking auth:', error);
        return false;
    }
};

export const isRegistered = async () => {
    try {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        return await actor.is_registered();
    } catch (error) {
        console.error('Error checking registration:', error);
        return false;
    }
};

export const logout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
};

// Helper function to create authenticated actor
const createAuthenticatedActor = async () => {
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity });
    
    if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
        await agent.fetchRootKey();
    }
    
    return createActor(CANISTER_ID, { agent });  
};

export const loginWithBotToken = async (token: string): Promise<{
    isValid: boolean;
    openchatId: string | null;
}> => {
    try {
        console.log("Starting token validation process");
        const agent = new HttpAgent({});
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        
        // Clean and normalize the token
        let cleanToken = token
            .replace(/^DIDL.*?,/, '') // Remove DIDL prefix
            .replace(/\s+/g, '') // Remove all whitespace
            .trim(); // Trim any remaining whitespace
            
        console.log("Cleaned token:", cleanToken);
        
        // Ensure the token is properly base64 formatted
        // Add padding if necessary
        while (cleanToken.length % 4) {
            cleanToken += '=';
        }
        
        let tokenBytes;
        try {
            // First attempt: direct base64 decode
            tokenBytes = Uint8Array.from(
                atob(cleanToken)
                    .split('')
                    .map(char => char.charCodeAt(0))
            );
        } catch (e) {
            console.log("Base64 decode failed, trying URL-safe decode");
            try {
                // Second attempt: URL-safe base64 decode
                const urlSafeToken = cleanToken
                    .replace(/-/g, '+')
                    .replace(/_/g, '/');
                tokenBytes = Uint8Array.from(
                    atob(urlSafeToken)
                        .split('')
                        .map(char => char.charCodeAt(0))
                );
            } catch (e2) {
                console.log("URL-safe decode failed, using direct encoding");
                // Last resort: direct encoding
                tokenBytes = new TextEncoder().encode(cleanToken);
            }
        }
        
        console.log("Token bytes:", Array.from(tokenBytes));
        
        // Validate token with backend
        const response = await actor.validate_dashboard_token(Array.from(tokenBytes));
        console.log("Backend response:", response);
        
        if (!response || (Array.isArray(response) && response.length === 0)) {
            console.error('Invalid or expired token');
            return { isValid: false, openchatId: null };
        }

        // Handle the response based on its type
        const openchatId = Array.isArray(response) ? response[0] : response;
        
        if (typeof openchatId === 'string' && openchatId) {
            console.log("Valid OpenChat ID found:", openchatId);
            sessionStorage.setItem('openchat_id', openchatId);
            return { isValid: true, openchatId };
        }
        
        console.error('Invalid response format from backend');
        return { isValid: false, openchatId: null };
    } catch (error) {
        console.error('Token validation error:', error);
        return { isValid: false, openchatId: null };
    }
};

// Add new function to check if OpenChat user has completed registration
export const isOpenChatUserRegistered = async (openchatId: string): Promise<boolean> => {
    try {
        const agent = new HttpAgent({});
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        const user = await actor.get_openchat_user(openchatId);
        return user !== null && user !== undefined;
    } catch (error) {
        console.error('Error checking OpenChat user registration:', error);
        return false;
    }
};

// Function to link accounts
export const linkAccounts = async (openchatId: string): Promise<boolean> => {
    try {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        
        // Link the accounts - pass both the principal and openchatId
        const principal = identity.getPrincipal();
        await actor.link_accounts(principal, openchatId);
        
        // Store both the auth session and openchat_id
        sessionStorage.setItem('is_authenticated', 'true');
        sessionStorage.setItem('openchat_id', openchatId);
        
        return true;
    } catch (error) {
        console.error('Error linking accounts:', error);
        return false;
    }
}; 