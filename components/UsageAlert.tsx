import { usageBand, usagePercent } from "@/lib/format";
import type { Usage } from "@/lib/types";
import styles from "./UsageAlert.module.css";

interface UsageAlertProps {
  usage: Usage;
  thresholds?: { warning: number; critical: number };
}

export default function UsageAlert({
  usage,
  thresholds = { warning: 80, critical: 100 },
}: UsageAlertProps) {
  const percent = usagePercent(usage.spendCents, usage.capCents);
  const band = usageBand(usage.spendCents, usage.capCents);

  if (band === "neutral") return null;

  const isWarning = band === "warn";
  const isCritical = band === "alarm";

  return (
    <div className={`${styles.alert} ${isWarning ? styles.warning : styles.critical}`}>
      <span className={styles.icon}>
        {isWarning ? "⚠️" : "🚨"}
      </span>
      <div className={styles.content}>
        <p className={styles.title}>
          {isCritical
            ? "Usage Exceeds Cap"
            : `Usage At ${percent}% of Cap`}
        </p>
        <p className={styles.message}>
          {isCritical
            ? "You have exceeded your monthly API spend cap. The cap is a soft limit — service is not interrupted."
            : `You are using ${percent}% of your monthly cap. Consider upgrading your plan if needed.`}
        </p>
      </div>
    </div>
  );
}
