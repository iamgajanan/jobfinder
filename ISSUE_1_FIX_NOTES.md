Issue 1 fix notes

- Alert history now identifies the saved search by name.
- Queued/running alerts no longer display the default zero as a completed new-job count.
- Manual test alerts poll their existing alert-status endpoint until the run completes, so the UI shows the same persisted count used by email delivery.
- Completed runs display the persisted new_jobs_count.
- No additional job search API is called by this UI update.
