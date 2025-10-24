// src/frontend/src/components/dashboard/ProfileSummaryCard.tsx
import React, { useEffect, useState } from "react";
import { getMyBusinessProfile } from "../../services/business-profile";
import type { BusinessProfile } from "../../types/business-profile";
import Button  from "../common/Button";
import { useNavigate } from "react-router-dom";

const ProfileSummaryCard: React.FC<{ className?: string }> = ({ className }) => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const p = await getMyBusinessProfile();
      setProfile(p);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className={className}>Loading...</div>;

  if (!profile) {
    return (
      <div className={`p-4 border rounded ${className ?? ""}`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-lg font-semibold">No Business Profile</div>
            <div className="text-sm text-gray-600">Complete your profile to get tailored AI help.</div>
          </div>
          <div>
            <Button variant="primary" onClick={() => navigate("/dashboard/profile")}>Create Profile</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 border rounded ${className ?? ""}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-lg font-semibold">{profile.business_name}</div>
          <div className="text-sm text-gray-600">{profile.tagline}</div>
        </div>
        <div>
          <Button variant="primary" onClick={() => navigate("/dashboard/profile")}>Edit</Button>
        </div>
      </div>

    //only updated fragment for display section
    <div className="text-sm text-gray-700 mb-2">
      {profile.location ? <span>📍 {profile.location} • </span> : null}
      <span>
      🏭{" "}
      {typeof profile.business_model === "string"
      ? profile.business_model
      : profile.business_model?.Other ?? "—"}
     </span>
    <span> • 🚀 {profile.stage ?? "—"}</span>
    </div>

    <div className="mt-2">
    <div className="text-xs text-gray-500">Profile Completion</div>
    <div className="w-full bg-gray-200 h-2 rounded mt-1">
    <div
      className="h-2 bg-blue-600 rounded"
      style={{ width: `${profile.completion_percentage ?? 0}%` }}
    />
    </div>
    <div className="text-xs text-gray-600 mt-1">
    {profile.completion_percentage ?? 0}% complete
  </div>
  </div>
  </div>

  );
};

export default ProfileSummaryCard;
