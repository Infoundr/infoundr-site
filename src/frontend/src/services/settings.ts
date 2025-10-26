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
     */
    async updateDisplayName(newName: string): Promise<void> {
        try {
            const actor = await this.ensureActor();
            
            const result = await actor.update_display_name(newName);
            
            if ('Err' in result) {
                throw new Error(result.Err);
            }
            
            console.log('Display name updated successfully:', newName);
        } catch (error) {
            console.error('Error updating display name:', error);
            throw error;
        }
    }

    /**
     * Get current user's display name
     */
    async getDisplayName(): Promise<string> {
        try {
            const actor = await this.ensureActor();
            const result = await actor.get_display_name();
            
            if ('Ok' in result) {
                return result.Ok;
            } else {
                throw new Error(result.Err);
            }
        } catch (error) {
            console.error('Error fetching display name:', error);
            throw error;
        }
    }

    /**
     * Get current user's profile information
     */
    async getUserProfile(): Promise<any> {
        try {
            const actor = await this.ensureActor();
            const result = await actor.get_user_profile();
            
            if ('Ok' in result) {
                return result.Ok;
            } else {
                throw new Error(result.Err);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    /**
     * Update user email
     */
    async updateEmail(newEmail: string): Promise<void> {
        try {
            const actor = await this.ensureActor();
            
            const result = await actor.update_email(newEmail);
            
            if ('Err' in result) {
                throw new Error(result.Err);
            }
            
            console.log('Email updated successfully:', newEmail);
        } catch (error) {
            console.error('Error updating email:', error);
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
