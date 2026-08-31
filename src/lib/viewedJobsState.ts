import type { Job } from "@/lib/api/types";

const STORAGE_PREFIX = "jobfinder.viewed-job-keys";
const USER_KEY = "jobfinder_user";

function currentUserKey() {
  if (typeof window === "undefined") return `${STORAGE_PREFIX}:anonymous`;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    const user = raw ? JSON.parse(raw) as { id?: string } : null;
    return user?.id ? `${STORAGE_PREFIX}:${user.id}` : `${STORAGE_PREFIX}:anonymous`;
  } catch {
    return `${STORAGE_PREFIX}:anonymous`;
  }
}

export const viewedJobKey = (job: Job) => `${job.platform}:${job.job_id}`;

export function readViewedJobKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(currentUserKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []);
  } catch {
    return new Set();
  }
}

export function writeViewedJobKeys(keys: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(currentUserKey(), JSON.stringify([...keys]));
    // Remove the old global key so state from the previous implementation
    // cannot leak into another account on the same browser.
    window.localStorage.removeItem(STORAGE_PREFIX);
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
