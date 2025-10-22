// src/frontend/src/components/dashboard/ProfileCompletionBanner.tsx
import React, { useEffect, useState } from "react";
import { getMyBusinessProfile, getProfileCompletion } from "../../services/business-profile";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import type { BusinessProfile } from "../../types/business-profile";

const ProfileCompletionBanner: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [completion, setCompletion] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const p = await getMyBusinessProfile();
      if (p) {
        setProfile(p);
        const completionObj = await getProfileCompletion(p.user_principal);
        if (completionObj) {
          setCompletion(completionObj.completion);
        }
      }
    })();
  }, []);

  if (!profile) return null;

  if (completion >= 100) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Complete your business profile to get better AI recommendations!
            <button
              className="font-medium underline ml-2"
              onClick={() => navigate("/dashboard/profile")}
            >
              Complete Now ({completion}%)
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;

