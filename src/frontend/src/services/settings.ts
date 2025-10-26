import { _SERVICE } from "../../../declarations/backend/backend.did";
import { createAuthenticatedActor } from './auth';
import { createSubscriptionService } from './subscription';

export interface SettingsUserData {
    name: string;
    email: string;
    plan: string;
}

export class SettingsService {
    private actor: _SERVICE | null = null;

    constructor() {
        this.initializeActor();
    }

    private async initializeActor() {
        try {
            this.actor = await createAuthenticatedActor();
        } catch (error) {
            console.error('Failed to create authenticated actor for user service:', error);
            throw error;
        }
    }

    private async ensureActor(): Promise<_SERVICE> {
        if (!this.actor) {
            await this.initializeActor();
        }
        if (!this.actor) {
            throw new Error('Failed to create authenticated actor');
        }
        return this.actor;
    }

    /**
     * Get current user data including name, email, and subscription plan
     */
    async getCurrentUserData(): Promise<SettingsUserData> {
        try {
            const actor = await this.ensureActor();
            
            // Get current user from auth service
            const { getCurrentUser } = await import('./auth');
            const currentUser = await getCurrentUser();
            
            if (!currentUser || !currentUser[0]) {
                throw new Error('No user data found');
            }

            // Check subscription status
            const subscriptionService = createSubscriptionService(actor);
            const isPro = await subscriptionService.isUserPro();
            
            return {
                name: currentUser[0].name || "User",
                email: (currentUser[0].email as unknown as string) || "user@example.com",
                plan: isPro ? "Pro Plan" : "Free Plan"
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    /**
     * Update user display name
     * TODO: Implement backend API call when backend supports it
     */
    async updateDisplayName(newName: string): Promise<void> {
        try {
            const actor = await this.ensureActor();
            
            // TODO: Implement backend API call to update display name
            // For now, just log the action
            console.log('Updating display name to:', newName);
            
            // When backend supports it, uncomment this:
            // const result = await actor.update_display_name(newName);
            // if ('Err' in result) {
            //     throw new Error(result.Err);
            // }
        } catch (error) {
            console.error('Error updating display name:', error);
            throw error;
        }
    }

    /**
     * Get user subscription status
     */
    async getSubscriptionStatus(): Promise<{ isPro: boolean; plan: string }> {
        try {
            const actor = await this.ensureActor();
            const subscriptionService = createSubscriptionService(actor);
            const isPro = await subscriptionService.isUserPro();
            
            return {
                isPro,
                plan: isPro ? "Pro Plan" : "Free Plan"
            };
        } catch (error) {
            console.error('Error fetching subscription status:', error);
            throw error;
        }
    }
}

// Factory function to create settings service
export const createSettingsService = (): SettingsService => {
    return new SettingsService();
};
