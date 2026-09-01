"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardData } from "@/lib/types";
import { useLocalStorage } from "@/lib/useLocalStorage";
import UsagePanel from "./UsagePanel";
import ModuleGrid from "./ModuleGrid";
import DashboardSkeleton from "./DashboardSkeleton";
import DashboardError from "./DashboardError";
import styles from "./TenantDashboard.module.css";

type State =
  | { status: "loading" }
  | { status: "success"; data: DashboardData; isFromCache: boolean }
  | { status: "error"; message: string };

export default function TenantDashboard() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [cachedData, setCachedData, clearCachedData] = useLocalStorage<DashboardData | null>(
    "tenant-dashboard-state",
    null
  );
  const [showCacheNotice, setShowCacheNotice] = useState(false);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Something went wrong loading the dashboard.");
      }
      const data: DashboardData = await res.json();
      setCachedData(data);
      setState({ status: "success", data, isFromCache: false });
      setShowCacheNotice(false);
    } catch (err) {
      // If fetch fails, try to use cached data
      if (cachedData) {
        setState({ status: "success", data: cachedData, isFromCache: true });
        setShowCacheNotice(true);
      } else {
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error.",
        });
      }
    }
  }, [cachedData, setCachedData]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpgrade = (moduleId: string) => {
    if (state.status !== "success") return;

    // Find the module being upgraded
    const moduleIndex = state.data.modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    // Define upgrade spend amounts for each module
    const upgradeSpend: Record<string, number> = {
      workflow: 45000,
      billing: 52000,
    };

    const spendIncrease = upgradeSpend[moduleId] || 50000;

    // Update state: activate module and increase spend
    const updatedModules = [...state.data.modules];
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      active: true,
      lastUsedAt: new Date().toISOString(),
    };

    const updatedUsage = {
      ...state.data.usage,
      spendCents: state.data.usage.spendCents + spendIncrease,
      byModule: [
        ...state.data.usage.byModule,
        {
          moduleId,
          spendCents: spendIncrease,
          calls: Math.floor(spendIncrease / 10),
        },
      ],
    };

    const updatedData = {
      ...state.data,
      modules: updatedModules,
      usage: updatedUsage,
    };

    // Persist to cache
    setCachedData(updatedData);

    setState({
      status: "success",
      data: updatedData,
      isFromCache: false,
    });
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
              onClick={clearCachedData}
              className={styles.clearCacheBtn}
              title="Clear cached dashboard state"
            >
              Clear Cache
            </button>
          )}
        </header>

        {showCacheNotice && (
          <div className={styles.cacheNotice}>
            ℹ️ Displaying cached data. Unable to reach the server. Check your connection or{" "}
            <button onClick={load} className={styles.retryLink}>
              retry
            </button>
            .
          </div>
        )}

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
