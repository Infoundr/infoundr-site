export interface AnalyticsDataPoint {
    date: string;
    requests_made: number;
    lines_of_code_edited: number;
    ai_interactions: number;
    tasks_completed: number;
    timestamp_ns: number;
}

export interface ChartDataset {
    label: string;
    data: number[];
    background_color: string;
    border_color: string;
}

export interface AnalyticsChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface AnalyticsSummary {
    requests_made: number;
    lines_of_agent_edits: number;
    ai_interactions: number;
    tasks_completed: number;
    chart_data: AnalyticsChartData;
}

export interface UserAnalytics {
    user_id: string;
    period_start: string;
    period_end: string;
    total_requests: number;
    total_lines_edited: number;
    total_ai_interactions: number;
    total_tasks_completed: number;
    daily_data: AnalyticsDataPoint[];
}
