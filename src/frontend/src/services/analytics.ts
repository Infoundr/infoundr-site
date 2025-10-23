import { _SERVICE } from "../../../declarations/backend/backend.did";
import { AnalyticsDataPoint, AnalyticsSummary, UserAnalytics } from '../types/analytics';

export class AnalyticsService {
    constructor(private actor: _SERVICE) {}

    /**
     * Get analytics summary for a user
     */
    async getAnalyticsSummary(days: number): Promise<AnalyticsSummary> {
        try {
            const result = await this.actor.get_user_analytics_summary(days);
            
            if ('Ok' in result) {
                return {
                    requests_made: result.Ok.requests_made,
                    lines_of_agent_edits: result.Ok.lines_of_agent_edits,
                    ai_interactions: result.Ok.ai_interactions,
                    tasks_completed: result.Ok.tasks_completed,
                    chart_data: {
                        labels: result.Ok.chart_data.labels,
                        datasets: result.Ok.chart_data.datasets.map(dataset => ({
                            label: dataset.label,
                            data: Array.from(dataset.data),
                            background_color: dataset.background_color,
                            border_color: dataset.border_color,
                        })),
                    },
                };
            } else {
                throw new Error(result.Err);
            }
        } catch (error) {
            console.error('Error fetching analytics summary:', error);
            throw error;
        }
    }

    /**
     * Get detailed analytics for a user
     */
    async getUserAnalytics(days: number): Promise<UserAnalytics> {
        try {
            const result = await this.actor.get_user_analytics(days);
            
            if ('Ok' in result) {
                return {
                    user_id: result.Ok.user_id,
                    period_start: result.Ok.period_start,
                    period_end: result.Ok.period_end,
                    total_requests: result.Ok.total_requests,
                    total_lines_edited: result.Ok.total_lines_edited,
                    total_ai_interactions: result.Ok.total_ai_interactions,
                    total_tasks_completed: result.Ok.total_tasks_completed,
                    daily_data: result.Ok.daily_data.map(data => ({
                        date: data.date,
                        requests_made: data.requests_made,
                        lines_of_code_edited: data.lines_of_code_edited,
                        ai_interactions: data.ai_interactions,
                        tasks_completed: data.tasks_completed,
                        timestamp_ns: Number(data.timestamp_ns),
                    })),
                } as UserAnalytics;
            } else {
                throw new Error(result.Err);
            }
        } catch (error) {
            console.error('Error fetching user analytics:', error);
            throw error;
        }
    }

    /**
     * Update analytics data for a user
     */
    async updateUserAnalytics(): Promise<void> {
        try {
            const result = await this.actor.update_user_analytics();
            
            if ('Err' in result) {
                throw new Error(result.Err);
            }
        } catch (error) {
            console.error('Error updating user analytics:', error);
            throw error;
        }
    }

    /**
     * Record analytics data for a user
     */
    async recordAnalyticsData(
        requestsMade: number,
        linesOfCodeEdited: number,
        aiInteractions: number,
        tasksCompleted: number
    ): Promise<void> {
        try {
            const result = await this.actor.record_analytics_data(
                requestsMade,
                linesOfCodeEdited,
                aiInteractions,
                tasksCompleted
            );
            
            if ('Err' in result) {
                throw new Error(result.Err);
            }
        } catch (error) {
            console.error('Error recording analytics data:', error);
            throw error;
        }
    }
}

// Factory function to create analytics service
export const createAnalyticsService = (actor: _SERVICE): AnalyticsService => {
    return new AnalyticsService(actor);
};
