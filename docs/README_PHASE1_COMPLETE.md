# JobFinder Frontend — Phase 1 Complete

## Status

**Phase 1: COMPLETE**

The frontend on `main` is integrated with the real backend and now includes authentication, dashboard/search, pricing and Razorpay checkout, saved searches, scheduled/test alerts, alert history, persisted saved-search results and Viewed Jobs.

## User flows

### Authentication
- Real signup/login/session flow.
- Session refresh handling through the centralized client.
- Logout and consistent auth/API errors.
- Same-origin proxying keeps internal backend infrastructure details out of browser-facing code.

### Dashboard and search
- Real account, plan, used-search and remaining-search information.
- Live LinkedIn/Naukri search filters.
- Explicit Search action; rerenders/navigation do not trigger expensive scraping automatically.
- Search results include external job links.

### Pricing and payments
Current plans:

| Plan | Price | Search allocation |
|---|---:|---:|
| Free | ₹0 | 50 |
| Starter | ₹299 | 100 |
| Growth | ₹599 | 500 |
| Pro | ₹999 | 1,000 |
| Business | ₹1,499 | 2,000 |

Razorpay Standard Checkout is integrated through the backend order/verification flow. The browser never receives Razorpay secrets.

Monthly paid upgrades display the prorated current-month charge. Example: ₹299 → ₹599 shows ₹300 payable now and ₹599/month after the upgrade. The backend remains authoritative for the final amount.

### Saved Searches

Users can create, edit, delete and run reusable searches. Filters include platform, title, location, experience, work mode, freshness and Easy Apply where supported.

Saved searches also support Daily/Weekly alert preferences.

Interactive run results are persisted locally so reloads, tab changes and mobile browser session behavior do not unnecessarily erase the visible result. Stale snapshots are cleared after edit/delete.

### Alerts

The UI shows saved-search name, frequency, next/last run, status, new-job count, email status and recent alert jobs.

The manual **Test Alert Now** flow is synchronous from the UI perspective:

```text
click Test Alert
      ↓
loading state
      ↓
backend completes alert search + email
      ↓
one refresh of alert history
      ↓
final result shown
```

The previous repeated polling loop was removed.

### Viewed Jobs

The product tracks only **Viewed**. Opening a job card/link can immediately show the Viewed state and update the viewed count without rerunning job search.

A dedicated Viewed Jobs screen is available from navigation.

The product deliberately does not infer Applied, Application Submitted, Interview, Rejected or Offer status because opening an external job page does not prove that any application action occurred.

## Performance improvements

The frontend now:

- deduplicates concurrent/repeated saved-search reads
- caches saved-search reads briefly and invalidates after mutations
- deduplicates viewed-job reads and shares in-flight requests
- avoids search API calls when marking a job Viewed
- removes repeated alert status/jobs polling
- refreshes alert history only after the manual alert completes
- keeps search operations explicit

For production-style local performance testing:

```bash
npm run build
npm start
```

## Architecture

```text
Next.js App Router
   |
   +--> authentication
   +--> dashboard/search
   +--> pricing/payment UI
   +--> saved searches
   +--> job alerts/history
   +--> viewed jobs
   |
   +--> typed centralized API client
           |
           +--> same-origin proxy
                   |
                   +--> backend application
```

The frontend is not the source of truth for payment, quota, saved-search persistence, alert execution or viewed-job persistence. Those remain backend/database responsibilities.

## Security/documentation rule

This frontend document intentionally does **not** publish backend API endpoint paths, internal backend URLs, database connection details or server secrets. Backend implementation details belong in the backend repository documentation.

## Validation

Focused checks cover the changed behavior: production build/type checking, saved-search CRUD/persistence, alert/test-alert UI, payment/prorated upgrade UI, Viewed Jobs behavior and request-deduplication paths.

Unrelated test suites are not required for focused frontend-only documentation or UI changes.

## Phase 1 completion note

**Frontend Phase 1 is complete on `main`.**
