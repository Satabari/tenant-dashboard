import { useState } from "react";
import type { Module } from "@/lib/types";
import styles from "./CostEstimator.module.css";

export default function CostEstimator({ modules }: { modules: Module[] }) {
  const [selectedModules, setSelectedModules] = useState<string[]>(
    modules.filter((m) => m.active).map((m) => m.id)
  );

  const moduleCosts: Record<string, number> = {
    planner: 40000,
    insights: 80000,
    workflow: 45000,
    billing: 52000,
  };

  const totalCost = selectedModules.reduce(
    (sum, id) => sum + (moduleCosts[id] || 0),
    0
  );
  const monthlyPrice = (totalCost / 100).toFixed(2);

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className={styles.estimator}>
      <h3 className={styles.title}>💰 Cost Estimator</h3>
      <p className={styles.description}>Select modules to see estimated monthly cost</p>

      <div className={styles.modules}>
        {modules.map((module) => (
          <label key={module.id} className={styles.moduleCheckbox}>
            <input
              type="checkbox"
              checked={selectedModules.includes(module.id)}
              onChange={() => toggleModule(module.id)}
            />
            <span>{module.name}</span>
            <span className={styles.cost}>
              ${((moduleCosts[module.id] || 0) / 100).toFixed(2)}
            </span>
          </label>
        ))}
      </div>

      <div className={styles.totalRow}>
        <span className={styles.label}>Estimated Total:</span>
        <span className={styles.total}>${monthlyPrice}/month</span>
      </div>
    </div>
  );
}
