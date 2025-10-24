// src/frontend/src/pages/Dashboard/layouts/BusinessProfile.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getMyBusinessProfile,
  saveBusinessProfile,
  getProfileCompletion,
} from "../../../services/business-profile";
import type { BusinessProfile } from "../../../types/business-profile";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/common/Tabs";
import  Button  from "../../../components/common/Button";
import Card, {CardContent} from "../../../components/common/Card";

type FormValues = Partial<BusinessProfile> & {
  customer_segments_str?: string;
  key_features_str?: string;
  key_roles_filled_str?: string;
  hiring_priorities_str?: string;
  short_term_goals_str?: string;
  long_term_goals_str?: string;
  current_challenges_str?: string;
  help_needed_str?: string;
  mentorship_interests_str?: string;
  technologies_used_str?: string;
};

const ORDER = ["basic", "team", "metrics", "product", "goals"];

const BusinessProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>("basic");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [completion, setCompletion] = useState(0);

  const { register, control, handleSubmit, reset, watch, setValue } =
    useForm<FormValues>({
      defaultValues: {
        business_name: "",
        tagline: "",
        industry: "",
        sub_industry: "",
        business_model: undefined,
        founded_date: undefined,
        location: "",
        website: "",
        team_size: undefined,
        founders_count: undefined,
        key_roles_filled: [],
        hiring_priorities: [],
        stage: "Idea",
        revenue_stage: undefined,
        monthly_revenue: undefined,
        funding_raised: "",
        funding_goal: "",
        runway_months: undefined,
        product_description: "",
        target_market: "",
        customer_segments: [],
        unique_value_proposition: "",
        key_features: [],
        market_size: "",
        competitors: [],
        competitive_advantage: "",
        short_term_goals: [],
        long_term_goals: [],
        current_challenges: [],
        help_needed: [],
        previous_experience: "",
        mentorship_interests: [],
        technologies_used: [],
      },
    });

  const watched = watch();

   useEffect(() => {
    (async () => {
      const profile = await getMyBusinessProfile();
      if (profile) {
        const formatted: FormValues = {
          ...profile,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          customer_segments_str: profile.customer_segments?.join(", ") ?? "",
          key_features_str: profile.key_features?.join(", ") ?? "",
          key_roles_filled_str: profile.key_roles_filled?.join(", ") ?? "",
          hiring_priorities_str: profile.hiring_priorities?.join(", ") ?? "",
          short_term_goals_str: profile.short_term_goals?.join(", ") ?? "",
          long_term_goals_str: profile.long_term_goals?.join(", ") ?? "",
          current_challenges_str: profile.current_challenges?.join(", ") ?? "",
          help_needed_str: profile.help_needed?.join(", ") ?? "",
          mentorship_interests_str: profile.mentorship_interests?.join(", ") ?? "",
          technologies_used_str: profile.technologies_used?.join(", ") ?? "",
        };
        reset(formatted);

        // ✅ use backend service to get profile completion
        const completionObj = await getProfileCompletion(profile.user_principal);
        if (completionObj) {
          setCompletion(completionObj.completion);
        }
      } else {
        if (searchParams.get("onboarding") === "true") {
          setCurrentTab("basic");
        }
      }
      setLoading(false);
    })();
  }, [reset, searchParams]);

  const toArray = (s?: string | string[]) =>
    typeof s === "string"
      ? s
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : Array.isArray(s)
      ? s
      : [];

  const buildPayload = (values: FormValues): BusinessProfile => {
    const now = BigInt(Date.now());
    const payload = {
      id: (values.id as string) || (crypto && (crypto as any).randomUUID ? (crypto as any).randomUUID() : ""),
      user_principal: (values.user_principal as string) || "",
      business_name: values.business_name?.trim() || "",
      tagline: values.tagline || null,
      industry: values.industry || "",
      sub_industry: values.sub_industry || null,
      business_model: (values.business_model as any) || undefined,
      founded_date: (values.founded_date as any) || undefined,
      location: values.location || undefined,
      website: values.website || undefined,
      team_size: (values.team_size as any) || undefined,
      founders_count: values.founders_count || undefined,
      key_roles_filled: toArray(values.key_roles_filled_str) || values.key_roles_filled || [],
      hiring_priorities: toArray(values.hiring_priorities_str) || values.hiring_priorities || [],
      stage: (values.stage as any) || ("Idea" as any),
      revenue_stage: (values.revenue_stage as any) || undefined,
      monthly_revenue: (values.monthly_revenue as any) || undefined,
      funding_raised: values.funding_raised || undefined,
      funding_goal: values.funding_goal || undefined,
      runway_months: values.runway_months || undefined,
      product_description: values.product_description?.trim() || "",
      target_market: values.target_market?.trim() || "",
      customer_segments: toArray(values.customer_segments_str) || values.customer_segments || [],
      unique_value_proposition: values.unique_value_proposition || undefined,
      key_features: toArray(values.key_features_str) || values.key_features || [],
      market_size: values.market_size || undefined,
      competitors: values.competitors || [],
      competitive_advantage: values.competitive_advantage || undefined,
      short_term_goals: toArray(values.short_term_goals_str) || values.short_term_goals || [],
      long_term_goals: toArray(values.long_term_goals_str) || values.long_term_goals || [],
      current_challenges: toArray(values.current_challenges_str) || values.current_challenges || [],
      help_needed: toArray(values.help_needed_str) || values.help_needed || [],
      previous_experience: values.previous_experience || undefined,
      mentorship_interests: toArray(values.mentorship_interests_str) || values.mentorship_interests || [],
      technologies_used: toArray(values.technologies_used_str) || values.technologies_used || [],
      created_at: (values.created_at as any) || now,
      updated_at: now,
      is_complete: completion >= 90,
      completion_percentage: completion,
    } as unknown as BusinessProfile;

    return payload;
  };

  const onSaveDraft = async (values: FormValues) => {
    const payload = buildPayload(values);
    const ok = await saveBusinessProfile(payload);
    if (ok) {
      alert("Draft saved");
    } else {
      alert("Error saving draft");
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    try {
    if (values.competitors && typeof values.competitors === "string") {
      JSON.parse(values.competitors); // throw if invalid
    }
  } catch (err) {
    alert("Competitors JSON is invalid");
    return;
  }
    const payload = buildPayload(values);
    const ok = await saveBusinessProfile(payload);
    if (ok) {
      alert("Profile saved!");
      navigate("/dashboard");
    } else {
      alert("Error saving profile");
    }
  };

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Business Profile</h1>
          <p className="text-sm text-gray-600">
            Help us understand your business to provide better AI recommendations.
          </p>
        </div>

        <div className="text-right">
          <div className="mb-2 text-sm text-gray-700">Progress: {completion}%</div>
          <div className="flex gap-2">
            <Button variant="primary" type="button" onClick={() => onSaveDraft(watch())}>
              Save Draft
            </Button>
            <Button variant="primary" type="button" onClick={async () => {
              const values = watch();
              const payload = buildPayload(values);
              payload.is_complete = true; // mark profile complete
              const ok = await saveBusinessProfile(payload);
              if (ok) {
                alert("Profile marked complete!");
                navigate("/dashboard");
              } else {
                alert("Error marking profile complete");
              }
            }}>
              Complete
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-5 gap-2 w-full mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="product">Product & Market</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          {/* Step 1 - Basic Info */}
          <TabsContent value="basic">
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Business Name *</label>
                  <input
                    {...register("business_name", { required: true, maxLength: 100 })}
                    className="border rounded-lg w-full p-2"
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Tagline</label>
                  <input
                    {...register("tagline", { maxLength: 200 })}
                    className="border rounded-lg w-full p-2"
                    placeholder="Short tagline"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Industry *</label>
                  <select {...register("industry", { required: true })} className="border rounded-lg w-full p-2">
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Sub-industry</label>
                  <input {...register("sub_industry")} className="border rounded-lg w-full p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Business Model</label>
                  <select {...register("business_model" as any)} className="border rounded-lg w-full p-2">
                    <option value="">Select model</option>
                    <option value="B2B">B2B</option>
                    <option value="B2C">B2C</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Marketplace">Marketplace</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Founded (Year)</label>
                    <input {...register("founded_date" as any)} type="number" className="border rounded-lg w-full p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Location</label>
                    <input {...register("location")} className="border rounded-lg w-full p-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Website</label>
                  <input {...register("website")} className="border rounded-lg w-full p-2" placeholder="https://your-site.com" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2 - Team */}
          <TabsContent value="team">
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Team Size</label>
                  <select {...register("team_size" as any)} className="border rounded-lg w-full p-2">
                    <option value="">Select team size</option>
                    <option value="Solo">Solo</option>
                    <option value="Size2to5">2-5</option>
                    <option value="Size6to10">6-10</option>
                    <option value="Size11to20">11-20</option>
                    <option value="Size21to50">21-50</option>
                    <option value="Size50Plus">50+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Number of Founders</label>
                  <input type="number" {...register("founders_count" as any)} min={1} max={10} className="border rounded-lg w-full p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Key Roles Filled (comma-separated)</label>
                  <input {...register("key_roles_filled_str")} className="border rounded-lg w-full p-2" placeholder="Engineering, Marketing" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Hiring Priorities (comma-separated)</label>
                  <input {...register("hiring_priorities_str")} className="border rounded-lg w-full p-2" placeholder="Sales, Product" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3 - Metrics */}
          <TabsContent value="metrics">
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Business Stage</label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {["Idea","Validation","MVP","EarlyTraction","Growth","Scaling","Mature"].map(s => (
                      <label key={s} className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          value={s}
                          {...register("stage" as any)}
                          defaultChecked={s === "Idea"}
                        />
                        <span className="text-sm">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Revenue Stage</label>
                  <select {...register("revenue_stage" as any)} className="border rounded-lg w-full p-2">
                    <option value="">Select revenue stage</option>
                    <option value="PreRevenue">Pre-revenue</option>
                    <option value="FirstDollar">First Dollar</option>
                    <option value="ConsistentRevenue">Consistent</option>
                    <option value="ProfitableUnit">Profitable Unit</option>
                    <option value="Profitable">Profitable</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Monthly Revenue Range</label>
                    <select {...register("monthly_revenue" as any)} className="border rounded-lg w-full p-2">
                      <option value="">Select range</option>
                      <option value="None">&lt;$1K</option>
                      <option value="K1to10">$1K-$10K</option>
                      <option value="K10to50">$10K-$50K</option>
                      <option value="K50to100">$50K-$100K</option>
                      <option value="K100to500">$100K-$500K</option>
                      <option value="K500to1M">$500K-$1M</option>
                      <option value="M1to5">$1M-$5M</option>
                      <option value="M5to10">$5M-$10M</option>
                      <option value="M10Plus">$10M</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Runway (months)</label>
                    <input type="number" {...register("runway_months" as any)} min={0} max={60} className="border rounded-lg w-full p-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Funding Raised</label>
                  <input {...register("funding_raised")} className="border rounded-lg w-full p-2" placeholder="$500K Seed" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Funding Goal</label>
                  <input {...register("funding_goal")} className="border rounded-lg w-full p-2" placeholder="$2M Series A" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4 - Product & Market */}
          <TabsContent value="product">
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Product Description *</label>
                  <textarea {...register("product_description", { required: true, maxLength: 500 })} className="border rounded-lg w-full p-2" rows={4} />
                </div>

                <div>
                  <label className="block text-sm font-medium">Target Market *</label>
                  <textarea {...register("target_market", { required: true, maxLength: 300 })} className="border rounded-lg w-full p-2" rows={3} />
                </div>

                <div>
                  <label className="block text-sm font-medium">Customer Segments (comma-separated)</label>
                  <input {...register("customer_segments_str")} className="border rounded-lg w-full p-2" placeholder="SMBs, eCommerce" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Unique Value Proposition</label>
                  <textarea {...register("unique_value_proposition")} className="border rounded-lg w-full p-2" rows={3} />
                </div>

                <div>
                  <label className="block text-sm font-medium">Key Features (comma-separated)</label>
                  <input {...register("key_features_str")} className="border rounded-lg w-full p-2" placeholder="Feature A, Feature B" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Market Size</label>
                  <input {...register("market_size")} className="border rounded-lg w-full p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Competitors (JSON array)</label>
                  <textarea {...register("competitors" as any)} className="border rounded-lg w-full p-2" placeholder='[{"name":"ACME","description":"..."}, ...]' />
                  <p className="text-xs text-gray-500">Tip: provide a small JSON list like: [{'{'}"name":"X","description":"..."{'}'}]  or save empty</p>
                </div>

                <div>
                  <label className="block text-sm font-medium">Competitive Advantage</label>
                  <textarea {...register("competitive_advantage")} className="border rounded-lg w-full p-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 5 - Goals & Challenges */}
          <TabsContent value="goals">
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Short-term Goals (comma-separated)</label>
                  <input {...register("short_term_goals_str")} className="border rounded-lg w-full p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Long-term Goals (comma-separated)</label>
                  <input {...register("long_term_goals_str")} className="border rounded-lg w-full p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Current Challenges (comma-separated)</label>
                  <input {...register("current_challenges_str")} className="border rounded-lg w-full p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Help Needed (comma-separated)</label>
                  <input {...register("help_needed_str")} className="border rounded-lg w-full p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Mentorship Interests (comma-separated)</label>
                  <input {...register("mentorship_interests_str")} className="border rounded-lg w-full p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Technologies Used (comma-separated)</label>
                  <input {...register("technologies_used_str")} className="border rounded-lg w-full p-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          {currentTab !== "basic" ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const prevIndex = ORDER.indexOf(currentTab) - 1;
                setCurrentTab(ORDER[Math.max(0, prevIndex)]);
              }}
            >
              Previous
            </Button>
          ) : (
            <div />
          )}

          {currentTab !== "goals" ? (
            <div className="flex gap-2">
              <Button variant="primary"
                type="button"
                onClick={() => {
                  const nextIndex = ORDER.indexOf(currentTab) + 1;
                  setCurrentTab(ORDER[Math.min(ORDER.length - 1, nextIndex)]);
                }}
              >
                Next
              </Button>
              <Button variant="primary" type="button" onClick={() => onSaveDraft(watch())}>
                Save Draft
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => onSaveDraft(watch())}>
                Save Draft
              </Button>
              <Button variant="primary" type="submit">Save Profile</Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default BusinessProfilePage;
