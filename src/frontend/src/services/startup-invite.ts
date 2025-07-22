import { createAuthenticatedActor } from './auth';
import { GenerateStartupInviteInput, StartupInvite, StartupRegistrationInput } from '../types/startup-invites';

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

export const acceptStartupInvite = async (input: StartupRegistrationInput): Promise<boolean | string> => {
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
    }
    return 'Failed to accept startup invite';
  }
}; 