import { createAuthenticatedActor } from './auth';

export const getLinkedWorkspaceAccounts = async (): Promise<string[]> => {
  try {
    const actor = await createAuthenticatedActor();
    const linkedAccounts = await actor.get_linked_workspace_accounts();
    
    return linkedAccounts;
  } catch (error) {
    console.error('Failed to fetch linked workspace accounts:', error);
    return [];
  }
};

export const hasLinkedWorkspaceAccounts = async (): Promise<boolean> => {
  try {
    const actor = await createAuthenticatedActor();
    const hasLinked = await actor.has_linked_workspace_accounts();
    
    return hasLinked;
  } catch (error) {
    console.error('Failed to check linked workspace accounts:', error);
    return false;
  }
};
