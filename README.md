# Tenant Dashboard

Reference build for the frontend practical brief: multi-tenant module grid + usage panel.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Demo the different states

The mock API route (`app/api/dashboard/route.ts`) supports a `mode` query param.
Edit the `fetch` call in `components/TenantDashboard.tsx`, or hit the route directly:

- `/api/dashboard` — default (matches the sample data in the brief)
- `/api/dashboard?mode=error` — simulates a failed request (503)
- `/api/dashboard?mode=empty` — tenant with zero modules
- `/api/dashboard?mode=alarm` — spend over the cap (tests the "alarm" band)

## Structure

```
app/
  api/dashboard/route.ts   mock API route handler
  layout.tsx               root layout
  page.tsx                 root page (renders TenantDashboard)
  globals.css              design tokens as CSS custom properties
components/
  TenantDashboard.tsx       owns fetch + loading/error/success state
  UsagePanel.tsx            spend figure + progress bar + threshold bands
  ModuleGrid.tsx / ModuleCard.tsx   the 2x2 module grid, locked vs active
  DashboardSkeleton.tsx     shape-matched loading state
  DashboardError.tsx        error state with retry
lib/
  types.ts                  shared TS types
  format.ts                 pure helpers: formatCents, usageBand, usagePercent
```

`usageBand()` and `usagePercent()` are pure functions with no component
dependencies — easy to point to if asked how you'd unit test this.
