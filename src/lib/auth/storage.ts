import type { Session, UserProfile } from "../api/types";

const SESSION_KEY = "jobfinder_session";
const USER_KEY = "jobfinder_user";
const ACCESS_COOKIE = "jobfinder_access_token";

function setAccessCookie(accessToken: string | null) {
  if (typeof document === "undefined") return;
  document.cookie = accessToken
    ? `${ACCESS_COOKIE}=${encodeURIComponent(accessToken)}; Path=/; SameSite=Lax`
    : `${ACCESS_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function isValidSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<Session>;
  return typeof session.access_token === "string" && session.access_token.length > 0
    && typeof session.refresh_token === "string" && session.refresh_token.length > 0;
}

export function getStoredSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidSession(parsed)) {
      clearStoredSession();
      return null;
    }
    return parsed;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function setStoredSession(session: Session | null, user?: UserProfile) {
  if (typeof window === "undefined") return;
  if (session && isValidSession(session)) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAccessCookie(session.access_token);
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(USER_KEY);
  setAccessCookie(null);
}

export function clearStoredSession() {
  setStoredSession(null);
}
