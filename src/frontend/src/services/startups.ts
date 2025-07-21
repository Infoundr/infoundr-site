import { createAuthenticatedActor } from './auth';
import type { Startup } from '../types/startups';
import type { StartupFilter } from '../types/startups';
import type { StartupCohort } from '../types/cohorts';
import type { StartupStatus } from '../types/statuses';

export const listStartups = async (
  filter: StartupFilter = {},
  searchText: string = ''
): Promise<{ items: Startup[]; total: number }> => {
  const actor = await createAuthenticatedActor();
  const result = await actor.list_startups([]);

  if ('Ok' in result) {
    const startups = result.Ok.map((startup) => ({
      id: startup.id,
      name: startup.name,
      contact_email: startup.contact_email,
      founder_principal: startup.founder_principal.toText(),
      cohort_id: startup.cohort_id,
      status_id: startup.status_id,
      engagement_score: startup.engagement_score,
      tasks_completed: startup.tasks_completed,
      total_logins: startup.total_logins,
      documents_submitted: startup.documents_submitted,
      updated_at: Number(startup.updated_at),
      created_at: Number(startup.created_at),
      date_joined: Number(startup.date_joined),
      accelerator_id: startup.accelerator_id.toText(),
      description: startup.description.length > 0 ? startup.description[0] : undefined,
      industry: startup.industry.length > 0 ? startup.industry[0] : undefined,
      last_activity: Number(startup.last_activity),
    }));

    return {
      items: startups,
      total: startups.length, // total is just the length of the returned array
    };
  } else {
    console.error('Error listing startups:', result.Err);
    return { items: [], total: 0 };
  }
};


//Get all startup cohorts for the accelerator
 
export const listStartupCohorts = async (): Promise<StartupCohort[]> => {
  const actor = await createAuthenticatedActor();
  const result = await actor.list_startup_cohorts();

  if ('Ok' in result) {
    return result.Ok.map((cohort) => ({
      ...cohort,
      accelerator_id: cohort.accelerator_id.toText(),
      start_date: cohort.start_date.length > 0 ? Number(cohort.start_date[0]) : undefined,
      end_date: cohort.end_date.length > 0 ? Number(cohort.end_date[0]) : undefined,
      description: cohort.description.length > 0 ? cohort.description[0] : undefined,
      created_at: Number(cohort.created_at),
    }));
  } else {
    console.error('Error listing startup cohorts:', result.Err);
    return [];
  }
};

  //Get all startup statuses for the accelerator
 
export const listStartupStatuses = async (): Promise<StartupStatus[]> => {
  const actor = await createAuthenticatedActor();
  const result = await actor.list_startup_statuses();

  if ('Ok' in result) {
    return result.Ok.map((status) => ({
      ...status,
      accelerator_id: status.accelerator_id.toText(),
      description: status.description.length > 0 ? status.description[0] : undefined,
      created_at: Number(status.created_at),
    }));
  } else {
    console.error('Error listing startup statuses:', result.Err);
    return [];
  }
}; 

