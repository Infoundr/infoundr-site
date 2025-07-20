import { Principal } from '@dfinity/principal';

// For Candid variants
export type InviteStatus = { Used: null } | { Revoked: null } | { Expired: null } | { Pending: null };
export type InviteType = { Link: null } | { Code: null };

// For Candid opt types (represented as arrays with 0 or 1 elements)
type OptionalText = [] | [string];
type OptionalNat64 = [] | [bigint];
type OptionalPrincipal = [] | [Principal];

export interface GenerateStartupInviteInput {
  accelerator_id: string;
  program_name: string;
  invite_type: InviteType;
  startup_name: string;
  email: OptionalText;
  expiry_days: OptionalNat64;
}

export interface StartupInvite {
  status: InviteStatus;
  accelerator_id: Principal;
  program_name: string;
  registered_principal: OptionalPrincipal;
  invite_id: string;
  invite_code: string;
  invite_type: InviteType;
  used_at: OptionalNat64;
  startup_name: string;
  created_at: bigint;
  email: OptionalText;
  expiry: bigint;
  registered_at: OptionalNat64;
}

export interface StartupRegistrationInput {
  invite_code: string;
  startup_name: string;
  email: string;
  founder_name: string;
} 