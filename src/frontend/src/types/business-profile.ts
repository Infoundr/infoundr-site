export type BusinessStage =
  | "Idea"
  | "Validation"
  | "MVP"
  | "EarlyTraction"
  | "Growth"
  | "Scaling"
  | "Mature";

export type BusinessModel =
  | "B2B"
  | "B2C"
  | "B2B2C"
  | "Marketplace"
  | "SaaS"
  | "Ecommerce"
  | "Subscription"
  | "Freemium"
  | { Other: string };

export type RevenueStage =
  | "PreRevenue"
  | "FirstDollar"
  | "ConsistentRevenue"
  | "ProfitableUnit"
  | "Profitable";

export type RevenueRange =
  | "None"
  | "Under1K"
  | "K1to10"
  | "K10to50"
  | "K50to100"
  | "K100to500"
  | "K500to1M"
  | "M1to5"
  | "M5to10"
  | "M10Plus";

export type TeamSize =
  | "Solo"
  | "Size2to5"
  | "Size6to10"
  | "Size11to20"
  | "Size21to50"
  | "Size50Plus";

// ==========================
// NESTED STRUCTS
// ==========================

export interface Competitor {
  name: string;
  description?: string;
  differentiation?: string;
}

// ==========================
// MAIN BUSINESS PROFILE TYPE
// ==========================

export interface BusinessProfile {
  id: string;
  user_principal: string;

  // Basic Information
  business_name: string;
  tagline?: string;
  industry: string;
  sub_industry?: string;
  business_model?: BusinessModel;
  founded_date?: bigint; 
  location?: string;
  website?: string;

  // Team Information
  team_size?: TeamSize;
  founders_count?: number;
  key_roles_filled: string[];
  hiring_priorities: string[];

  // Business Stage & Metrics
  stage: BusinessStage;
  revenue_stage?: RevenueStage;
  monthly_revenue?: RevenueRange;
  funding_raised?: string;
  funding_goal?: string;
  runway_months?: number;

  // Product/Service
  product_description: string;
  target_market: string;
  customer_segments: string[];
  unique_value_proposition?: string;
  key_features: string[];

  // Market & Competition
  market_size?: string;
  competitors: Competitor[];
  competitive_advantage?: string;

  // Goals & Challenges
  short_term_goals: string[];
  long_term_goals: string[];
  current_challenges: string[];
  help_needed: string[];

  // Additional Context
  previous_experience?: string;
  mentorship_interests: string[];
  technologies_used: string[];

  // Metadata
  created_at: bigint;
  updated_at: bigint;
  is_complete: boolean;
  completion_percentage: number;
}

