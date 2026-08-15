export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  status: string;
  plan_code: string;
};

export type Session = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number | null;
  expires_at: number | null;
};

export type AuthResponse = {
  user: UserProfile;
  session: Session | null;
  email_confirmation_required: boolean;
};

export type CurrentUser = {
  id: string;
  email: string | null;
  profile: UserProfile;
};

export type UsageResponse = {
  plan_code: string;
  plan_name: string;
  granted_searches: number;
  used_searches: number;
  remaining_searches: number;
};

export type AccountResponse = {
  user: UserProfile;
  usage: UsageResponse;
};

export type JobSearchRequest = {
  platform?: "linkedin" | "naukri";
  job_title: string;
  location: string;
  experience?: string | null;
  work_mode?: "remote" | "onsite" | "hybrid" | "any" | null;
  posted_within?: string | null;
  easy_apply?: boolean;
};

export type Job = {
  id: string | null;
  platform: string;
  job_id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  experience: string | null;
  work_mode: string | null;
  easy_apply: boolean;
  job_url: string;
  apply_url: string | null;
  description: string | null;
  company_logo: string | null;
  status: string;
};

export type JobSearchResponse = {
  jobs: Job[];
};

export type Plan = {
  code: string;
  name: string;
  price_inr_paise: number;
  search_limit: number;
  billing_interval: string | null;
  metadata: Record<string, unknown> | null;
};

export type PlansResponse = {
  plans: Plan[];
};

export type CreateOrderRequest = {
  plan_code: string;
};

export type CreateOrderResponse = {
  order_id: string;
  amount_inr_paise: number;
  currency: string;
  plan_code: string;
  plan_name: string;
  search_limit: number;
  razorpay_key_id: string;
};

export type VerifyPaymentRequest = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type PaymentResult = {
  status: string;
  plan_code: string;
  granted_searches: number;
  remaining_searches: number;
};

export type PaymentHistoryItem = {
  id: string;
  plan_code: string;
  plan_name: string;
  provider: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  amount_inr_paise: number;
  currency: string;
  status: string;
  refunded_inr_paise: number;
  paid_at: string | null;
  created_at: string;
};

export type PaymentHistoryResponse = {
  payments: PaymentHistoryItem[];
};
