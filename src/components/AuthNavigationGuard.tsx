"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredSession } from "@/lib/auth/storage";

function hasRecoveryToken() {
  if (typeof window === "undefined") return false;

  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const type = query.get("type") || hash.get("type");
  const accessToken = query.get("access_token") || hash.get("access_token");

  return type === "recovery" && Boolean(accessToken);
}

export default function AuthNavigationGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const check = () => {
      // Supabase recovery links normally redirect directly to /reset-password,
      // but if Supabase falls back to the configured Site URL (or an older
      // reset link points at /login), the recovery session is still returned
      // in the URL fragment. Never send a recovery session to the login form.
      if (hasRecoveryToken()) {
        if (pathname !== "/reset-password") {
          window.location.replace(`/reset-password${window.location.search}${window.location.hash}`);
        }
        return;
      }

      // Only protect the dashboard route. Public auth pages, including
      // /reset-password, must remain accessible without a stored app session.
      if (pathname === "/" && !getStoredSession()) router.replace("/login");
    };

    check();
    window.addEventListener("pageshow", check);
    return () => window.removeEventListener("pageshow", check);
  }, [pathname, router]);

  return null;
}
