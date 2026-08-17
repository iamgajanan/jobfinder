"use client";

import { useRouter } from "next/navigation";
import SavedSearches from "@/components/SavedSearches";
import TestAlertPanel from "@/components/TestAlertPanel";
import type { SavedSearch } from "@/lib/api/types";
import { api } from "@/lib/api/client";

export default function SavedSearchesPage() {
  const router = useRouter();

  async function runSavedSearch(savedSearch: SavedSearch) {
    const result = await api.searchJobs({
      platform: savedSearch.platform,
      job_title: savedSearch.job_title,
      location: savedSearch.location,
      experience: savedSearch.experience,
      work_mode: savedSearch.work_mode,
      posted_within: savedSearch.posted_within,
      easy_apply: savedSearch.easy_apply,
    });

    // Keep results available when mobile Safari evicts sessionStorage while the tab is backgrounded.
    localStorage.setItem("jobfinder_saved_search_results", JSON.stringify(result.jobs));
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] p-4 text-[var(--fg)] md:p-8">
      <div className="mx-auto max-w-6xl">
        <TestAlertPanel />
        <SavedSearches onRun={runSavedSearch} />
      </div>
    </main>
  );
}
