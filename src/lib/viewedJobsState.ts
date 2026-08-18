import type { Job } from "@/lib/api/types";

const STORAGE_KEY = "jobfinder.viewed-job-keys";

export const viewedJobKey = (job: Job) => `${job.platform}:${job.job_id}`;

export function readViewedJobKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []);
  } catch {
    return new Set();
  }
}

export function writeViewedJobKeys(keys: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys]));
  } catch {
    // Local storage is only a UI fallback; backend persistence remains authoritative.
  }
}

export function rememberViewedJob(job: Job) {
  const keys = readViewedJobKeys();
  keys.add(viewedJobKey(job));
  writeViewedJobKeys(keys);
  return keys;
}
