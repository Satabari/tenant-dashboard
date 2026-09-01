"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardData } from "@/lib/types";
import UsagePanel from "./UsagePanel";
import ModuleGrid from "./ModuleGrid";
import DashboardSkeleton from "./DashboardSkeleton";
import DashboardError from "./DashboardError";
import styles from "./TenantDashboard.module.css";

type State =
  | { status: "loading" }
  | { status: "success"; data: DashboardData }
  | { status: "error"; message: string };

export default function TenantDashboard() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(5); // 5 minutes in minutes
  const [lastPolled, setLastPolled] = useState<Date | null>(null);

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
      setLastPolled(new Date());
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error.",
      });
    }
  }, []);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalMs = autoRefreshInterval * 60 * 1000; // Convert minutes to ms
    const interval = setInterval(load, intervalMs);

    return () => clearInterval(interval);
  }, [autoRefresh, autoRefreshInterval, load]);

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
          <div className={styles.headerSettings}>
            <label className={styles.autoRefreshLabel}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                title="Enable auto-refresh"
              />
              <span>Auto-refresh</span>
            </label>
            {autoRefresh && (
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className={styles.intervalSelect}
                title="Auto-refresh interval"
              >
                <option value={1}>1 min</option>
                <option value={3}>3 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
              </select>
            )}
            {lastPolled && (
              <span className={styles.lastPolled} title="Last polling timestamp">
                Last: {lastPolled.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
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
      </div>
    </div>
  );
}
