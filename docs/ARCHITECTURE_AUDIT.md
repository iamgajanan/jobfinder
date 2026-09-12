# Architecture Audit — JobFinder Frontend

Date: 2026-09-12
Branch: main
Scope: read-only architecture/source audit; no product features added.

## Current architecture
- Next.js App Router with `src/app` routes.
- UI and feature components live under `src/components`.
- Backend access is proxied through `src/app/api/backend/[...path]/route.ts`.
- Authentication-related pages: login, signup, confirm-email, forgot-password, reset-password.
- Product flows include jobs, saved searches, viewed jobs, pricing/payment gate.
- CI currently installs dependencies and runs only `next build`.

## Findings
### Critical
- No critical issue conclusively established from static inspection alone; runtime/security validation is required in subsequent stabilization steps.

### High
1. CI does not run lint, type checking, tests, or dependency-lockfile enforcement; build-only validation can allow regressions.
2. The backend proxy route is a high-risk trust boundary and requires explicit method, header, body, timeout, error-redaction, and authentication review.
3. Authentication and protected-route behavior is distributed across pages/components and needs integration coverage.
4. Large page/component responsibilities (notably the main page and SavedSearches/Pricing areas) increase regression risk and should be tested before refactoring.

### Medium
1. No visible dedicated test structure/scripts in package metadata.
2. Environment configuration has example files but requires validation of required/optional variables and production fail-fast behavior.
3. Loading, empty, and error-state consistency should be verified across job and saved-search flows.
4. CI uses `npm install` rather than a reproducible lockfile-based install if a lockfile is present.

### Low
1. Architecture documentation is minimal and should describe request/data flow and ownership.
2. Dead-code/TODO/import-cycle analysis should be automated in later quality tooling.

## Recommended stabilization order
1. Establish baseline commands and CI gates: lint, typecheck, build, tests.
2. Audit backend proxy and auth boundary.
3. Add critical frontend integration tests.
4. Standardize API error/loading states.
5. Add dependency/security and architecture checks.

## Explicit non-goals
No new product features, no major rewrites, and no changes to public API contracts in this audit phase.
