import { getStoredSession } from "@/lib/auth/storage";
import type { Job } from "@/lib/api/types";

export type ViewedJob = { id:string; platform:"linkedin"|"naukri"; job_id:string; job_data:Job; viewed_at:string; created_at:string; updated_at:string };

type ViewedResponse = { viewed_jobs:ViewedJob[] };
const CACHE_TTL_MS = 10_000;
const cache = new Map<string,{data:ViewedResponse;expiresAt:number}>();
const inflight = new Map<string,Promise<ViewedResponse>>();
const markInflight = new Map<string,Promise<ViewedJob>>();

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

function cacheKey(limit:number,offset:number){return `${limit}:${offset}`;}
function markKey(job:Job){return `${job.platform}:${job.job_id}`;}

export function markViewed(job:Job){
  const key=markKey(job);
  const existing=markInflight.get(key);
  if(existing) return existing;

  const promise=request<ViewedJob>("/jobs/viewed",{method:"POST",body:JSON.stringify(job)})
    .then(result=>{
      cache.clear();
      return result;
    })
    .finally(()=>markInflight.delete(key));

  markInflight.set(key,promise);
  return promise;
}

export function listViewed(limit=50,offset=0){
  const key=cacheKey(limit,offset);
  const cached=cache.get(key);
  if(cached && cached.expiresAt>Date.now()) return Promise.resolve(cached.data);
  if(cached) cache.delete(key);
  const existing=inflight.get(key);
  if(existing) return existing;
  const promise=request<ViewedResponse>(`/jobs/viewed?limit=${limit}&offset=${offset}`)
    .then(data=>{cache.set(key,{data,expiresAt:Date.now()+CACHE_TTL_MS});return data})
    .finally(()=>inflight.delete(key));
  inflight.set(key,promise);
  return promise;
}
