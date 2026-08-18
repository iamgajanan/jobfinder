import { getStoredSession } from "@/lib/auth/storage";
import type { Job } from "@/lib/api/types";

export type ViewedJob = { id:string; platform:"linkedin"|"naukri"; job_id:string; job_data:Job; viewed_at:string; created_at:string; updated_at:string };

async function request<T>(path:string, init:RequestInit={}):Promise<T>{
  const session=getStoredSession();
  const headers=new Headers(init.headers);
  headers.set("Accept","application/json");
  if(init.body) headers.set("Content-Type","application/json");
  if(session?.access_token) headers.set("Authorization",`Bearer ${session.access_token}`);
  const response=await fetch(`/api/backend${path}`,{...init,headers,cache:"no-store"});
  const payload=await response.json().catch(()=>null);
  if(!response.ok) throw new Error(typeof payload?.detail === "string" ? payload.detail : `Request failed (${response.status})`);
  return payload as T;
}

export function markViewed(job:Job){return request<ViewedJob>("/jobs/viewed",{method:"POST",body:JSON.stringify(job)})}
export function listViewed(limit=50,offset=0){return request<{viewed_jobs:ViewedJob[]}>(`/jobs/viewed?limit=${limit}&offset=${offset}`)}
