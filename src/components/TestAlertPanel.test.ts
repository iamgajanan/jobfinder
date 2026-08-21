import type { AlertRun } from "@/lib/api/types";

function displayedNewJobCount(run: AlertRun) {
  return run.status === "queued" || run.status === "running" ? "—" : String(run.new_jobs_count);
}

test("does not show queued zero as a completed new-job count", () => {
  const run = {
    id: "run-1",
    saved_search_name: "React Pune",
    scheduled_for: "2026-08-21T10:00:00Z",
    status: "queued",
    created_at: "2026-08-21T10:00:00Z",
    started_at: null,
    completed_at: null,
    new_jobs_count: 0,
    result_summary: null,
    error_message: null,
  } satisfies AlertRun;

  expect(displayedNewJobCount(run)).toBe("—");
});

test("shows the exact count after an alert completes", () => {
  const run = {
    id: "run-2",
    saved_search_name: "Test Job",
    scheduled_for: "2026-08-21T10:00:00Z",
    status: "completed",
    created_at: "2026-08-21T10:00:00Z",
    started_at: "2026-08-21T10:00:01Z",
    completed_at: "2026-08-21T10:00:08Z",
    new_jobs_count: 8,
    result_summary: { jobs_found: 8, new_jobs: 8 },
    error_message: null,
  } satisfies AlertRun;

  expect(displayedNewJobCount(run)).toBe("8");
  expect(run.saved_search_name).toBe("Test Job");
});
