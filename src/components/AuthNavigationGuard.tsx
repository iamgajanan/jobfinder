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
    if (pathname !== "/") return;

    const check = () => {
      // Supabase recovery links can return to the configured Site URL with
      // the recovery session in the URL fragment. Preserve that token and
      // route it to the public reset-password screen instead of /login.
      if (hasRecoveryToken()) {
        window.location.replace(`/reset-password${window.location.search}${window.location.hash}`);
        return;
      }

      if (!getStoredSession()) router.replace("/login");
    };

    check();
    window.addEventListener("pageshow", check);
    return () => window.removeEventListener("pageshow", check);
  }, [pathname, router]);

  return null;
}
