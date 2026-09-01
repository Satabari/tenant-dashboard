"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DashboardData, Module } from "@/lib/types";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useDarkMode } from "@/lib/useDarkMode";
import { fetchWithRetry } from "@/lib/retryUtils";
import UsagePanel from "./UsagePanel";
import ModuleSearch from "./ModuleSearch";
import ModuleGrid from "./ModuleGrid";
import DashboardSkeleton from "./DashboardSkeleton";
import DashboardError from "./DashboardError";
import UpgradeConfirmationDialog from "./UpgradeConfirmationDialog";
import UsageAlert from "./UsageAlert";
import PlanComparisonModal from "./PlanComparisonModal";
import ExportPanel from "./ExportPanel";
import CostEstimator from "./CostEstimator";
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
  const [upgradingModuleId, setUpgradingModuleId] = useState<string | null>(null);
  const [showPlanComparison, setShowPlanComparison] = useState(false);
  const [showCostEstimator, setShowCostEstimator] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(5); // minutes
  const [showExports, setShowExports] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data: DashboardData = await fetchWithRetry(() =>
        fetch("/api/dashboard").then((res) => {
          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }
          return res.json();
        })
      );
      setCachedData(data);
      setState({ status: "success", data, isFromCache: false });
      setShowCacheNotice(false);
      setLastSyncTime(new Date());
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

  // Auto-refresh polling
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const intervalMs = autoRefreshInterval * 60 * 1000;
    const interval = setInterval(load, intervalMs);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, load]);

  const getFilteredModules = useCallback((): Module[] => {
    if (state.status !== "success") return [];

    return state.data.modules.filter((module) => {
      const matchesSearch = module.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && module.active) ||
        (statusFilter === "inactive" && !module.active);

      return matchesSearch && matchesStatus;
    });
  }, [state, searchTerm, statusFilter]);

  const handleFilterChange = (search: string, status: "all" | "active" | "inactive") => {
    setSearchTerm(search);
    setStatusFilter(status);
  };

  const handleUpgrade = (moduleId: string) => {
    // Show confirmation dialog
    setUpgradingModuleId(moduleId);
  };

  const handleConfirmUpgrade = () => {
    if (!upgradingModuleId || state.status !== "success") return;

    const moduleId = upgradingModuleId;
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

    // Close dialog
    setUpgradingModuleId(null);
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

  const formatLastSync = (): string => {
    if (!lastSyncTime) return "Never";
    const now = new Date();
    const diffMs = now.getTime() - lastSyncTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins === 0) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
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
          <div className={styles.headerActions}>
            {state.status === "success" && (
              <>
                <button
                  onClick={() => setShowExports(!showExports)}
                  className={styles.headerBtn}
                  title="Export dashboard data"
                >
                  📊 Export
                </button>
                <button
                  onClick={() => setShowCostEstimator(!showCostEstimator)}
                  className={styles.headerBtn}
                  title="Estimate module costs"
                >
                  💰 Cost Estimator
                </button>
                <button
                  onClick={() => setShowPlanComparison(!showPlanComparison)}
                  className={styles.headerBtn}
                  title="Compare pricing plans"
                >
                  📋 Plans
                </button>
                <button
                  onClick={load}
                  className={styles.headerBtn}
                  title={`Last synced: ${formatLastSync()}`}
                >
                  🔄 Refresh
                </button>
              </>
            )}
            <button
              onClick={toggleDarkMode}
              className={styles.themeTBtn}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            {state.status === "success" && (
              <button
                onClick={clearCachedData}
                className={styles.clearCacheBtn}
                title="Clear cached dashboard state"
              >
                Clear Cache
              </button>
            )}
          </div>
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
            <UsageAlert usage={state.data.usage} capCents={state.data.capCents} />
            
            <UsagePanel usage={state.data.usage} capCents={state.data.capCents} />

            {showExports && <ExportPanel data={state.data} onClose={() => setShowExports(false)} />}

            {showCostEstimator && (
              <CostEstimator onClose={() => setShowCostEstimator(false)} />
            )}

            {showPlanComparison && (
              <PlanComparisonModal 
                currentPlan={state.data.tenant.plan}
                onClose={() => setShowPlanComparison(false)} 
              />
            )}

            <div>
              <h2 className={styles.sectionTitle}>Modules</h2>
              
              {/* Auto-refresh settings */}
              <div className={styles.autoRefreshControl}>
                <label>Auto-refresh: </label>
                <select 
                  value={autoRefreshInterval}
                  onChange={(e) => setAutoRefreshInterval(parseInt(e.target.value))}
                  className={styles.autoRefreshSelect}
                >
                  <option value="0">Off</option>
                  <option value="1">Every 1 minute</option>
                  <option value="3">Every 3 minutes</option>
                  <option value="5">Every 5 minutes</option>
                  <option value="10">Every 10 minutes</option>
                </select>
                {lastSyncTime && (
                  <span className={styles.lastSyncLabel}>
                    Last synced: {formatLastSync()}
                  </span>
                )}
              </div>

              <ModuleSearch onFilterChange={handleFilterChange} />
              <ModuleGrid 
                modules={getFilteredModules()}
                onUpgrade={handleUpgrade}
                onDeactivate={handleDeactivate}
              />
            </div>
          </div>
        )}
      </div>

      {upgradingModuleId && state.status === "success" && (
        <UpgradeConfirmationDialog
          moduleId={upgradingModuleId}
          module={state.data.modules.find((m) => m.id === upgradingModuleId)!}
          usage={state.data.usage}
          capCents={state.data.capCents}
          onConfirm={handleConfirmUpgrade}
          onCancel={() => setUpgradingModuleId(null)}
        />
      )}
    </div>
  );
}
