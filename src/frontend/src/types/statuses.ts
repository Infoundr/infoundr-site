export type StartupStatus = {
  id: string;
  accelerator_id: string;
  name: string;
  color: string;
  sort_order: number;
  description?: string;
  created_at: number;
  is_active: boolean;
};
