import type { Session } from "../api/types";

const SESSION_KEY = "jobfinder_session";

export function getStoredSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_KEY);
}

export function clearStoredSession() {
  setStoredSession(null);
}
