# JobFinder

A Next.js + TypeScript + Tailwind SaaS dashboard for searching jobs across job platforms.

## MVP

- Sign up / sign in / sign out flow (client-side demo auth for now)
- Home job search dashboard
- Dummy paginated Naukri search API
- Job cards with original-job links
- Pricing: ₹0 / ₹299 / ₹699 / ₹999 / ₹1499
- Monthly search allowances: 50 / 100 / 500 / 1,000 / 2,000
- Analytics dashboard with daily, weekly, monthly and yearly usage views
- Profile and settings
- Light / dark / system themes
- Responsive sidebar and mobile layout

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Next integration

The local `POST /api/jobs/search` endpoint intentionally exposes a stable response contract. Replace its implementation with the working Naukri API / n8n webhook later without changing the dashboard UI.

Future roadmap: real authentication, payments/subscriptions, usage credits, saved searches, alerts, LinkedIn integration, backend analytics and customer API keys.
