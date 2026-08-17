import { clearStoredSession, getStoredSession, setStoredSession } from "../auth/storage";
import type { AccountResponse, AlertRun, AuthResponse, CreateOrderRequest, CreateOrderResponse, CreateSavedSearchRequest, CurrentUser, JobSearchRequest, JobSearchResponse, PaymentHistoryResponse, PaymentResult, PlansResponse, SavedSearch, SavedSearchAlertJob, SavedSearchAlertStatus, SavedSearchesResponse, UpdateSavedSearchRequest, VerifyPaymentRequest } from "./types";

type ApiErrorBody = { detail?: string | { message?: string } };
export class ApiError extends Error { constructor(public readonly status:number,message:string){super(message);this.name="ApiError";} }
async function parseResponse<T>(response:Response):Promise<T>{const payload=(await response.json().catch(()=>null)) as T|ApiErrorBody|null;if(response.ok)return payload as T;const detail=(payload as ApiErrorBody|null)?.detail;const message=typeof detail==="string"?detail:detail?.message||`Request failed with status ${response.status}`;throw new ApiError(response.status,message)}
async function request<T>(path:string,init:RequestInit={},retryOnUnauthorized=true):Promise<T>{const headers=new Headers(init.headers);if(init.body&&!headers.has("Content-Type"))headers.set("Content-Type","application/json");const session=getStoredSession();if(session?.access_token)headers.set("Authorization",`Bearer ${session.access_token}`);const response=await fetch(`/api/backend${path}`,{...init,headers,cache:"no-store"});if(response.status===401&&retryOnUnauthorized&&session?.refresh_token){try{const refreshed=await requestRefresh(session.refresh_token);setStoredSession(refreshed);return request<T>(path,init,false)}catch{clearStoredSession()}}return parseResponse<T>(response)}
async function requestRefresh(refreshToken:string){const response=await fetch("/api/backend/auth/refresh",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:refreshToken}),cache:"no-store"});return parseResponse<NonNullable<AuthResponse["session"]>>(response)}
export const api={
 signup:(payload:{email:string;password:string;full_name?:string})=>request<AuthResponse>("/auth/signup",{method:"POST",body:JSON.stringify(payload)}),
 login:(payload:{email:string;password:string})=>request<AuthResponse>("/auth/login",{method:"POST",body:JSON.stringify(payload)}),
 logout:()=>request<void>("/auth/logout",{method:"POST"}),
 me:()=>request<CurrentUser>("/auth/me"),
 account:()=>request<AccountResponse>("/account/me"),
 searchJobs:(payload:JobSearchRequest)=>request<JobSearchResponse>("/jobs/search",{method:"POST",body:JSON.stringify(payload)}),
 plans:()=>request<PlansResponse>("/plans"),
 createOrder:(payload:CreateOrderRequest)=>request<CreateOrderResponse>("/payments/orders",{method:"POST",body:JSON.stringify(payload)}),
 verifyPayment:(payload:VerifyPaymentRequest)=>request<PaymentResult>("/payments/verify",{method:"POST",body:JSON.stringify(payload)}),
 paymentHistory:()=>request<PaymentHistoryResponse>("/payments/history"),
 savedSearches:()=>request<SavedSearchesResponse>("/saved-searches"),
 createSavedSearch:(payload:CreateSavedSearchRequest)=>request<SavedSearch>("/saved-searches",{method:"POST",body:JSON.stringify(payload)}),
 updateSavedSearch:(id:string,payload:UpdateSavedSearchRequest)=>request<SavedSearch>(`/saved-searches/${id}`,{method:"PUT",body:JSON.stringify(payload)}),
 deleteSavedSearch:(id:string)=>request<void>(`/saved-searches/${id}`,{method:"DELETE"}),
 testSavedSearchAlert:(id:string)=>request<{message:string;run:Record<string,unknown>}>(`/saved-searches/${id}/alert-test`,{method:"POST"}),
 alertStatus:(id:string)=>request<SavedSearchAlertStatus>(`/saved-searches/${id}/alert-status`),
 alertJobs:(id:string,limit=20)=>request<SavedSearchAlertJob[]>(`/saved-searches/${id}/alert-jobs?limit=${limit}`),
};
export function saveAuthResponse(response:AuthResponse){setStoredSession(response.session,response.user)}
