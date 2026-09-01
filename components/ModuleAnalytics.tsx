import type { ModuleUsage } from "@/lib/types";
import { formatCents } from "@/lib/format";
import styles from "./ModuleAnalytics.module.css";

export default function ModuleAnalytics({ usage }: { usage: ModuleUsage }) {
  const costPerCall = usage.calls > 0 ? usage.spendCents / usage.calls : 0;

  return (
    <div className={styles.analytics}>
      <div className={styles.stat}>
        <span className={styles.label}>Spend</span>
        <span className={styles.value}>{formatCents(usage.spendCents)}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>Calls</span>
        <span className={styles.value}>{usage.calls.toLocaleString()}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>Per Call</span>
        <span className={styles.value}>${(costPerCall / 100).toFixed(4)}</span>
      </div>
    </div>
  );
}
