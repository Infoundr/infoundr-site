import { createAuthenticatedActor } from './auth';
import { GenerateStartupInviteInput, StartupInvite } from '../types/startup-invites';
import type { StartupRegistrationInput } from '../types/startup-invites';

interface CandidInput {
  accelerator_id: string;
  program_name: string;
  invite_type: GenerateStartupInviteInput['invite_type'];
  startup_name: string;
  email: string[];
  expiry_days: bigint[];
}

export const generateStartupInvite = async (input: GenerateStartupInviteInput): Promise<StartupInvite | string> => {
  try {
    console.log('generateStartupInvite: Creating authenticated actor...');
    const actor = await createAuthenticatedActor();
    console.log('generateStartupInvite: Actor created successfully');

    console.log('generateStartupInvite: Calling backend with input:', input);
    const result = await actor.generate_startup_invite(input);
    console.log('generateStartupInvite: Received response from backend:', result);
    
    if ('Ok' in result) {
      console.log('generateStartupInvite: Success, returning invite data');
      return result.Ok;
    } else {
      console.error('generateStartupInvite: Error from backend:', result.Err);
      return result.Err;
    }
  } catch (error) {
    console.error('generateStartupInvite: Exception occurred:', error);
    if (error instanceof Error) {
      console.error('generateStartupInvite: Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return 'Failed to generate startup invite';
  }
};

export const acceptStartupInvite = async (input: StartupRegistrationInput): Promise<true | string> => {
  try {
    console.log('acceptStartupInvite: Creating authenticated actor...');
    const actor = await createAuthenticatedActor();
    console.log('acceptStartupInvite: Actor created successfully');
    
    console.log('acceptStartupInvite: Calling backend with input:', input);
    const result = await actor.accept_startup_invite(input);
    console.log('acceptStartupInvite: Received response from backend:', result);
    
    if ('Ok' in result) {
      console.log('acceptStartupInvite: Success');
      return true;
    } else {
      console.error('acceptStartupInvite: Error from backend:', result.Err);
      return result.Err;
    }
  } catch (error) {
    console.error('acceptStartupInvite: Exception occurred:', error);
    if (error instanceof Error) {
      console.error('acceptStartupInvite: Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      // Handle specific backend errors
      if (error.message.includes('BorrowMutError')) {
        return 'Server is temporarily busy processing invites. Please try again in a moment.';
      }
      if (error.message.includes('ic0.trap')) {
        return 'Server encountered an internal error. Please try again or contact support.';
      }
      if (error.message.includes('Canister')) {
        return 'Unable to connect to server. Please check your connection and try again.';
      }
    }
    return 'Failed to accept invite';
  }
}; 

export const listStartupInvites = async (accelerator_id: string): Promise<StartupInvite[]> => {
  try {
    const actor = await createAuthenticatedActor();
    const result = await actor.list_startup_invites(accelerator_id);
    if (Array.isArray(result)) {
      return result;
    } else {
      console.error('Unexpected response from list_startup_invites:', result);
      return [];
    }
  } catch (error) {
    console.error('Error listing startup invites:', error);
    return [];
  }
}; 

// Function to validate invite code and get basic info
// Since there's no get_invite_by_code, we simulate this by attempting to fetch accelerator info
export const validateInviteCode = async (inviteCode: string): Promise<{ isValid: boolean; acceleratorName?: string; programName?: string; startupName?: string } | string> => {
  try {
    // For now, we'll assume the invite is valid and return placeholder data
    // In a real scenario, you might need a backend method to validate just the code
    // without accepting the invite
    console.log('Validating invite code:', inviteCode);
    
    // Since we can't get invite details directly, we'll return a basic validation
    // The real details will be filled when the invite is actually accepted
    return {
      isValid: true,
      // We could potentially extract some info from URL patterns or other sources
      acceleratorName: undefined, // Will be filled from actual invite data
      programName: undefined,
      startupName: undefined
    };
  } catch (error) {
    console.error('Error validating invite code:', error);
    return 'Failed to validate invite code';
  }
}; 