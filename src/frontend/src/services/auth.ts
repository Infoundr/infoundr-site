import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, ActorSubclass } from "@dfinity/agent";
import { createActor } from "../../../declarations/backend";
import type { _SERVICE } from "../../../declarations/backend/backend.did.d.ts";
import { CANISTER_ID, MOCK_USER } from '../config';

// Initialize AuthClient
let authClient: AuthClient | null = null;

// Identity Provider URLs
const II_URL = {
  local: "http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080",
  playground: "https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=rdmx6-jaaaa-aaaaa-aaadq-cai",
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
            identityProvider: import.meta.env.VITE_DFX_NETWORK === 'ic' ? II_URL.ic : II_URL.local,
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
        
        // Check for mock authentication first
        if (import.meta.env.VITE_AUTH_MODE === 'mock') {
            const mockPrincipal = sessionStorage.getItem('user_principal');
            return mockPrincipal === MOCK_USER.principal;
        }
        
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

        // If Internet Identity is authenticated, check if we have a stored principal
        const storedPrincipal = sessionStorage.getItem('user_principal');
        if (storedPrincipal) {
            console.log("Found stored principal, considering authenticated");
            return true;
        }

        // Create authenticated actor for backend checks
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        
        try {
            const backendAuth = await actor.check_auth();
            console.log("Backend check_auth result:", backendAuth);
            return backendAuth;
        } catch (backendError) {
            console.log("Backend check_auth failed, but user is authenticated with II:", backendError);
            // If backend check fails but user is authenticated with II, still consider them authenticated
            // Store the principal for future use
            const userPrincipal = identity.getPrincipal();
            sessionStorage.setItem('user_principal', userPrincipal.toString());
            return true;
        }
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
export const createAuthenticatedActor = async () => {
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
    slackId?: string | null;
    platform?: string;
}> => {
    try {
        console.log("Starting token validation process with token:", token);
        const agent = new HttpAgent({});
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            console.log("Fetching root key for local development");
            await agent.fetchRootKey();
        }
        
        console.log("Creating actor with canister ID:", CANISTER_ID);
        const actor = createActor(CANISTER_ID, { agent });
        
        // Improved token cleaning
        let cleanToken = token
            .replace(/^DIDL.*?,/, '') // Remove DIDL prefix and comma
            .replace(/\\u0000/g, '') // Remove unicode nulls
            .replace(/\\u0001/g, '') // Remove unicode ones
            .replace(/\\/g, '')      // Remove stray backslashes
            .replace(/\s+/g, '')      // Remove all whitespace
            .trim();
        
        console.log("Cleaned token:", cleanToken);
        
        // Ensure the token is properly base64 formatted
        while (cleanToken.length % 4) {
            cleanToken += '=';
        }
        
        let tokenBytes;
        try {
            console.log("Attempting direct base64 decode");
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
        console.log("About to call validate_dashboard_token");
        
        // Validate token with backend
        let response = await actor.validate_dashboard_token(Array.from(tokenBytes));
        console.log("Backend response:", response);

        // Candid returns [TokenValidationResult] or []
        const result = Array.isArray(response) ? response[0] : undefined;

        if (!result || !result.platform || !result.platform_id) {
            console.error('Invalid or expired token');
            return { isValid: false, openchatId: null };
        }

        if (result.platform === 'slack') {
            sessionStorage.setItem('slack_id', result.platform_id);
            return { isValid: true, openchatId: null, slackId: result.platform_id, platform: 'slack' };
        } else if (result.platform === 'openchat') {
            sessionStorage.setItem('openchat_id', result.platform_id);
            return { isValid: true, openchatId: result.platform_id, platform: 'openchat' };
        } else {
            // fallback for unknown platform
            return { isValid: true, openchatId: result.platform_id, platform: result.platform };
        }
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

// Function to sign up an accelerator
export const signUpAccelerator = async (name: string, email: string, website: string) => {
    try {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        const result = await actor.sign_up_accelerator({ name, email, website });
        
        if ('Err' in result) {
            throw new Error(result.Err);
        }
        return result.Ok;
    } catch (error) {
        console.error('Error signing up accelerator:', error);
        throw error;
    }
};

// Function to log accelerator login activity
export const logAcceleratorLogin = async () => {
    try {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        
        if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
        }
        
        const actor = createActor(CANISTER_ID, { agent });
        
        const result = await actor.get_my_accelerator();
        
        if ('Err' in result) {
            console.warn('Accelerator login tracking failed:', result.Err);
            return false;
        }
        
        console.log('Accelerator login activity logged successfully');
        return true;
    } catch (error) {
        console.error('Error logging accelerator login:', error);
        return false;
    }
};