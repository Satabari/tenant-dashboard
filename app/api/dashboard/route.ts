import { NextRequest, NextResponse } from "next/server";
import type { DashboardData } from "@/lib/types";

const MOCK_DATA: DashboardData = {
  tenant: { id: "acme-corp", name: "Acme Corp", plan: "Growth" },
  modules: [
    { id: "planner", name: "Planner", active: true, lastUsedAt: "2026-08-29T10:12:00Z" },
    { id: "insights", name: "Insights", active: true, lastUsedAt: "2026-08-31T07:45:00Z" },
    { id: "workflow", name: "Workflow", active: false, lastUsedAt: null },
    { id: "billing", name: "Billing Ops", active: false, lastUsedAt: null },
  ],
  usage: {
    periodStart: "2026-08-01",
    periodEnd: "2026-08-31",
    capCents: 500000,
    spendCents: 218400,
    byModule: [
      { moduleId: "insights", spendCents: 154200, calls: 48210 },
      { moduleId: "planner", spendCents: 64200, calls: 19980 },
    ],
  },
};

// GET /api/dashboard
// GET /api/dashboard?mode=error   -> simulates a failed fetch, for demoing the error state
// GET /api/dashboard?mode=empty   -> simulates a tenant wit₹h no modules yet
// GET /api/dashboard?mode=alarm   -> simulates spend over the cap
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode");

  // Small artificial delay so the loading state is visible in a live demo.
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (mode === "error") {
    return NextResponse.json(
      { message: "Could not reach the usage service." },
      { status: 503 }
    );
  }

  if (mode === "empty") {
    return NextResponse.json({
      ...MOCK_DATA,
      modules: [],
    } satisfies DashboardData);
  }

  if (mode === "alarm") {
    return NextResponse.json({
      ...MOCK_DATA,
      usage: { ...MOCK_DATA.usage, spendCents: 271000 },
    } satisfies DashboardData);
  }

  return NextResponse.json(MOCK_DATA);
}
