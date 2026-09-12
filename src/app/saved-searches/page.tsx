"use client";

import SavedSearches from "@/components/SavedSearches";
import TestAlertPanel from "@/components/TestAlertPanel";

export default function SavedSearchesPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] p-4 text-[var(--fg)] md:p-8">
      <div className="mx-auto max-w-6xl">
        <TestAlertPanel />
        <SavedSearches />
      </div>
    </main>
  );
}
