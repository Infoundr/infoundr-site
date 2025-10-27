import { _SERVICE } from "../../../declarations/backend/backend.did";

export class SubscriptionService {
    constructor(private actor: _SERVICE) {}

    /**
     * Check if current user has Pro subscription
     */
    async isUserPro(): Promise<boolean> {
        try {
            return await this.actor.is_user_pro();
        } catch (error) {
            console.error('Error checking user subscription status:', error);
            return false;
        }
    }

    /**
     * Get current user subscription details
     */
    async getCurrentUserSubscription() {
        try {
            return await this.actor.get_current_user_subscription();
        } catch (error) {
            console.error('Error getting user subscription:', error);
            return null;
        }
    }
}

// Factory function to create subscription service
export const createSubscriptionService = (actor: _SERVICE): SubscriptionService => {
    return new SubscriptionService(actor);
};
