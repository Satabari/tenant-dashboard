import type { Module } from "@/lib/types";
import { formatShortDate } from "@/lib/format";
import styles from "./ModuleCard.module.css";

export default function ModuleCard({
  module,
  onUpgrade,
  onDeactivate,
}: {
  module: Module;
  onUpgrade: (moduleId: string) => void;
  onDeactivate: (moduleId: string) => void;
}) {
  const locked = !module.active;

  return (
    <div className={`${styles.card} ${locked ? styles.locked : ""}`}>
      <div className={styles.headerRow}>
        <h3 className={`${styles.name} ${locked ? styles.locked : ""}`}>{module.name}</h3>
        {!locked && <span className={styles.dot} aria-hidden="true" />}
      </div>

      {locked ? (
        <>
          <p className={styles.lockedMeta}>Not included in your plan</p>
          <button className={styles.upgradeBtn} onClick={() => onUpgrade(module.id)}>
            Upgrade
          </button>
        </>
      ) : (
        <>
          <p className={styles.meta}>
            Last used {module.lastUsedAt ? formatShortDate(module.lastUsedAt) : "—"}
          </p>
          <button 
            className={styles.deactivateBtn} 
            onClick={() => onDeactivate(module.id)}
          >
            Deactivate
          </button>
        </>
      )}
    </div>
  );
}
