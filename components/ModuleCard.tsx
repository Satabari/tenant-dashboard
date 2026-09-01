import type { Module, ModuleUsage } from "@/lib/types";
import { formatShortDate } from "@/lib/format";
import ModuleAnalytics from "./ModuleAnalytics";
import styles from "./ModuleCard.module.css";

export default function ModuleCard({
  module,
  onUpgrade,
  usage,
}: {
  module: Module;
  onUpgrade: (moduleId: string) => void;
  usage?: ModuleUsage;
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
          {usage && <ModuleAnalytics usage={usage} />}
        </>
      )}
    </div>
  );
}
