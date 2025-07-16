import { createAuthenticatedActor } from './auth';
import type { Accelerator, AcceleratorStats } from '../types/accelerator';

export const getMyAccelerator = async (): Promise<Accelerator | null> => {
    try {
        const actor = await createAuthenticatedActor();
        const result = await actor.get_my_accelerator("");
        
        if ('Err' in result) {
            console.error('Error getting accelerator:', result.Err);
            return null;
        }
        
        // result.Ok is [] | [Accelerator], so we need to check if it's an array with one element
        if (!result.Ok || result.Ok.length === 0) {
            console.log('No accelerator found for current user');
            return null;
        }
        
        // Convert the backend Accelerator type to our frontend type
        const accelerator = result.Ok[0];
        return {
            id: accelerator.id,
            graduated_startups: Number(accelerator.graduated_startups),
            active_startups: Number(accelerator.active_startups),
            logo: accelerator.logo,
            name: accelerator.name,
            email: accelerator.email,
            website: accelerator.website,
            team_members: accelerator.team_members.map(member => ({
                status: member.status,
                principal: member.principal,
                token: member.token,
                role: member.role,
                email: member.email
            })),
            total_startups: Number(accelerator.total_startups),
            recent_activity: accelerator.recent_activity.map(activity => ({
                activity_type: activity.activity_type,
                description: activity.description,
                timestamp: activity.timestamp
            })),
            email_verified: accelerator.email_verified,
            invites_sent: Number(accelerator.invites_sent)
        };
    } catch (error) {
        console.error('Error fetching accelerator data:', error);
        return null;
    }
};

export const getAcceleratorStats = async (): Promise<AcceleratorStats | null> => {
    try {
        const accelerator = await getMyAccelerator();
        
        if (!accelerator) {
            return null;
        }
        
        return {
            total_startups: accelerator.total_startups,
            invites_sent: accelerator.invites_sent,
            active_startups: accelerator.active_startups,
            graduated_startups: accelerator.graduated_startups
        };
    } catch (error) {
        console.error('Error fetching accelerator stats:', error);
        return null;
    }
}; 