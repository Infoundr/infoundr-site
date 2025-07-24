export type Startup = {
  id: string;
  documents_submitted: number;
  updated_at: number;
  accelerator_id: string;
  founder_principal: string;
  name: string;
  contact_email: string;
  date_joined: number;
  description?: string;
  created_at: number;
  status_id: string;
  last_activity: number;
  cohort_id: string;
  engagement_score: number;
  tasks_completed: number;
  total_logins: number;
  industry?: string;
};

export type StartupFilter = {
  date_to?: number;
  date_from?: number;
  max_engagement_score?: number;
  cohort_ids?: string[];
  status_ids?: string[];
  min_engagement_score?: number;
  search_term?: string;
};
