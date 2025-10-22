import { createAuthenticatedActor } from "./auth";
import { Principal } from "@dfinity/principal";
import type { BusinessProfile } from "../types/business-profile";

// Helper to get actor
const getActor = async () => {
  try {
    return await createAuthenticatedActor();
  } catch (err) {
    console.error("Failed to create authenticated actor:", err);
    throw err;
  }
};

// Helper: safely build a backend-compatible payload from frontend BusinessProfile
const makeBackendProfilePayload = (profile: BusinessProfile): any => {
  const payload: any = { ...profile };

  // Convert user_principal string -> Principal
  try {
    payload.user_principal = Principal.fromText(profile.user_principal);
  } catch (e) {
    // If invalid, pass anonymous principal (or handle as you prefer)
    console.warn("Invalid principal string, sending anonymous principal instead", profile.user_principal);
    payload.user_principal = Principal.anonymous();
  }

  // Convert created_at / updated_at to bigint if present and not already bigint
  if (profile.created_at !== undefined && profile.created_at !== null) {
    try {
      // if frontend uses number or bigint-like, ensure it's BigInt
      payload.created_at = BigInt(profile.created_at as any);
    } catch {
      payload.created_at = BigInt(0);
    }
  } else {
    payload.created_at = BigInt(0);
  }

  if (profile.updated_at !== undefined && profile.updated_at !== null) {
    try {
      payload.updated_at = BigInt(profile.updated_at as any);
    } catch {
      payload.updated_at = BigInt(0);
    }
  } else {
    payload.updated_at = BigInt(0);
  }

  return payload;
};

//  get_my_business_profile 
export const getMyBusinessProfile = async (): Promise<BusinessProfile | null> => {
  try {
    const actor = await getActor();
    const result: any = await actor.get_my_business_profile();

    if ("Ok" in result) {
      const arr = result.Ok as [] | [any];
      if (Array.isArray(arr) && arr.length > 0) {
        const profile = arr[0];
        if (profile.user_principal && typeof profile.user_principal.toText === "function") {
          profile.user_principal = profile.user_principal.toText();
        }
        return profile as BusinessProfile;
      }
      return null;
    }

    // Err case
    console.error("getMyBusinessProfile Err:", result.Err);
    return null;
  } catch (err) {
    console.error("getMyBusinessProfile exception:", err);
    return null;
  }
};

// save_business_profile 
export const saveBusinessProfile = async (profile: BusinessProfile): Promise<boolean> => {
  try {
    const actor = await getActor();
    const payload = makeBackendProfilePayload(profile);
    const result: any = await actor.save_business_profile(payload);

    if ("Ok" in result) return true;
    console.error("saveBusinessProfile Err:", result.Err);
    return false;
  } catch (err) {
    console.error("saveBusinessProfile exception:", err);
    return false;
  }
};

//update_business_profile_field
export const updateBusinessProfileField = async (
  field: string,
  value: string | string[]
): Promise<boolean> => {
  try {
    const actor = await getActor();
    const payloadValue = Array.isArray(value) ? value.join(",") : value;
    const result: any = await actor.update_business_profile_field(field, payloadValue);
    if ("Ok" in result) return true;
    console.error("updateBusinessProfileField Err:", result.Err);
    return false;
  } catch (err) {
    console.error("updateBusinessProfileField exception:", err);
    return false;
  }
};


//list_business_profiles 
export const listBusinessProfiles = async (): Promise<BusinessProfile[] | null> => {
  try {
    const actor = await getActor();
    const result: any = await actor.list_business_profiles();
    if (Array.isArray(result)) {
      return result.map((p: any) => {
        if (p.user_principal && typeof p.user_principal.toText === "function") {
          p.user_principal = p.user_principal.toText();
        }
        return p as BusinessProfile;
      });
    }

    console.error("listBusinessProfiles unexpected response:", result);
    return null;
  } catch (err) {
    console.error("listBusinessProfiles exception:", err);
    return null;
  }
};

//get_business_profile 
export const getBusinessProfile = async (principalId: string): Promise<BusinessProfile | null> => {
  try {
    const actor = await getActor();
    const principal = Principal.fromText(principalId);
    const result: any = await actor.get_business_profile(principal);

    if ("Ok" in result) {
      const arr = result.Ok as [] | [any];
      if (Array.isArray(arr) && arr.length > 0) {
        const profile = arr[0];
        if (profile.user_principal && typeof profile.user_principal.toText === "function") {
          profile.user_principal = profile.user_principal.toText();
        }
        return profile as BusinessProfile;
      }
      return null;
    }

    console.error("getBusinessProfile Err:", result.Err);
    return null;
  } catch (err) {
    console.error("getBusinessProfile exception:", err);
    return null;
  }
};

//delete_business_profile 
export const deleteBusinessProfile = async (principalId: string): Promise<boolean> => {
  try {
    const actor = await getActor();
    const principal = Principal.fromText(principalId); 

    const result = await actor.delete_business_profile(principal);

    if ("Ok" in result) {
      console.log("Business profile deleted successfully");
      return true;
    }

    console.error("Failed to delete profile:", result.Err);
    return false;
  } catch (error) {
    console.error("deleteBusinessProfile error:", error);
    return false;
  }
};

//get_profile_completion 
export const getProfileCompletion = async (
  principalId: string
): Promise<{ completion: number; is_complete: boolean } | null> => {
  try {
    const actor = await getActor();
    const principal = Principal.fromText(principalId);
    const result: any = await actor.get_profile_completion(principal);

    if ("Ok" in result) {
      const tuple = result.Ok as [number, boolean];
      return { completion: Number(tuple[0]), is_complete: Boolean(tuple[1]) };
    }

    console.error("getProfileCompletion Err:", result.Err);
    return null;
  } catch (err) {
    console.error("getProfileCompletion exception:", err);
    return null;
  }
};
