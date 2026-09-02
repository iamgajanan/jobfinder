"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredSession } from "@/lib/auth/storage";

export default function AuthNavigationGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/") return;
    const check = () => {
      if (!getStoredSession()) router.replace("/login");
    };
    check();
    window.addEventListener("pageshow", check);
    return () => window.removeEventListener("pageshow", check);
  }, [pathname, router]);

  return null;
}
