"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardData } from "@/lib/types";
import UsagePanel from "./UsagePanel";
import ModuleGrid from "./ModuleGrid";
import DashboardSkeleton from "./DashboardSkeleton";
import DashboardError from "./DashboardError";
import PlanComparisonModal from "./PlanComparisonModal";
import styles from "./TenantDashboard.module.css";

type State =
  | { status: "loading" }
  | { status: "success"; data: DashboardData }
  | { status: "error"; message: string };

export default function TenantDashboard() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [showPlanComparison, setShowPlanComparison] = useState(false);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Something went wrong loading the dashboard.");
      }
      const data: DashboardData = await res.json();
      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error.",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpgrade = (moduleId: string) => {
    // Real implementation: open upgrade modal / route to billing with moduleId.
    console.log("Upgrade requested for module:", moduleId);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.plan}>
              {state.status === "success" ? `${state.data.tenant.plan} plan` : "\u00A0"}
            </p>
            <h1 className={styles.tenantName}>
              {state.status === "success" ? state.data.tenant.name : "Dashboard"}
            </h1>
          </div>
          {state.status === "success" && (
            <button
              className={styles.viewPlansBtn}
              onClick={() => setShowPlanComparison(true)}
              title="View and compare plans"
            >
              View Plans
            </button>
          )}
        </header>

        {state.status === "loading" && <DashboardSkeleton />}

        {state.status === "error" && (
          <DashboardError message={state.message} onRetry={load} />
        )}

        {state.status === "success" && (
          <div className={styles.content}>
            <UsagePanel usage={state.data.usage} />
            <div>
              <h2 className={styles.sectionTitle}>Modules</h2>
              <ModuleGrid modules={state.data.modules} onUpgrade={handleUpgrade} />
            </div>
          </div>
        )}

        {state.status === "success" && (
          <PlanComparisonModal
            isOpen={showPlanComparison}
            currentPlan={state.data.tenant.plan}
            onClose={() => setShowPlanComparison(false)}
          />
        )}
      </div>
    </div>
  );
}
