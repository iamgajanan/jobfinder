"use client";

import { useEffect } from "react";
import { markViewed } from "@/lib/api/viewed";
import type { Job } from "@/lib/api/types";
import { rememberViewedJob } from "@/lib/viewedJobsState";

function inferPlatform(url: string): "linkedin" | "naukri" | null {
  const value = url.toLowerCase();
  if (value.includes("linkedin.com/jobs")) return "linkedin";
  if (value.includes("naukri.com")) return "naukri";
  return null;
}

function inferJobId(url: string) {
  try {
    const parsed = new URL(url);
    const numbers = parsed.pathname.match(/\d{5,}/g);
    return numbers?.at(-1) || parsed.pathname.replace(/^\/+|\/+$/g, "") || parsed.href;
  } catch {
    return url;
  }
}

function textFrom(card: Element, selector: string) {
  return card.querySelector(selector)?.textContent?.trim() || "";
}

function addViewedBadge(card: Element) {
  const header = card.querySelector("div.flex.justify-between.gap-3");
  const right = header?.querySelector("div.flex.items-center.gap-2");
  if (!right || right.querySelector("[data-viewed-badge]")) return;
  const badge = document.createElement("span");
  badge.setAttribute("data-viewed-badge", "true");
  badge.className = "inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-600";
  badge.textContent = "👁 Viewed";
  right.appendChild(badge);
}

export default function ViewedJobClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const viewedNav = target?.closest("button") as HTMLButtonElement | null;
      if (viewedNav?.textContent?.trim() === "Viewed jobs") {
        event.preventDefault();
        window.location.assign("/viewed-jobs");
        return;
      }

      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target !== "_blank") return;
      const platform = inferPlatform(link.href);
      if (!platform) return;
      const card = link.closest("article");
      if (!card) return;

      const job: Job = {
        id: null,
        platform,
        job_id: inferJobId(link.href),
        title: textFrom(card, "h3") || textFrom(card, "h2") || "Job listing",
        company: textFrom(card, "h3 + p") || textFrom(card, "h2 + p") || "Unknown company",
        location: textFrom(card, ".mt-4 .flex") || "Location not disclosed",
        salary: null,
        experience: null,
        work_mode: null,
        easy_apply: false,
        job_url: link.href,
        apply_url: link.href,
        description: null,
        company_logo: null,
        status: "active",
      };

      rememberViewedJob(job);
      addViewedBadge(card);
      void markViewed(job).catch(() => {});
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
