export type StartupCohort = {
  id: string;
  accelerator_id: string;
  name: string;
  description?: string;
  start_date?: number;
  end_date?: number;
  created_at: number;
  is_active: boolean;
};
