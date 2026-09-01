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

    setState({
      status: "success",
      data: {
        ...state.data,
        modules: updatedModules,
        usage: updatedUsage,
      },
    });
  };

  const handleDeactivate = (moduleId: string) => {
    if (state.status !== "success") return;

    // Find the module being deactivated
    const moduleIndex = state.data.modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    // Find the usage entry for this module
    const usageIndex = state.data.usage.byModule.findIndex((u) => u.moduleId === moduleId);
    if (usageIndex === -1) return;

    // Get the spend to recover
    const moduleSpend = state.data.usage.byModule[usageIndex].spendCents;

    // Update state: deactivate module and recover spend
    const updatedModules = [...state.data.modules];
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      active: false,
      lastUsedAt: null,
    };

    const updatedByModule = state.data.usage.byModule.filter((_, idx) => idx !== usageIndex);
    const updatedUsage = {
      ...state.data.usage,
      spendCents: Math.max(0, state.data.usage.spendCents - moduleSpend),
      byModule: updatedByModule,
    };

    setState({
      status: "success",
      data: {
        ...state.data,
        modules: updatedModules,
        usage: updatedUsage,
      },
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.plan}>
            {state.status === "success" ? `${state.data.tenant.plan} plan` : "\u00A0"}
          </p>
          <h1 className={styles.tenantName}>
            {state.status === "success" ? state.data.tenant.name : "Dashboard"}
          </h1>
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
              <ModuleGrid 
                modules={state.data.modules} 
                onUpgrade={handleUpgrade}
                onDeactivate={handleDeactivate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
