import type { Usage } from "@/lib/types";
import { formatCents, formatShortDate, usageBand, usagePercent } from "@/lib/format";
import styles from "./UsagePanel.module.css";

const BAND_STYLE = {
  neutral: { bar: "var(--accent)", text: "var(--ink-muted)", chipBg: null as string | null },
  warn: { bar: "var(--warn)", text: "var(--warn)", chipBg: "var(--warn-bg)" },
  alarm: { bar: "var(--alarm)", text: "var(--alarm)", chipBg: "var(--alarm-bg)" },
};

export default function UsagePanel({ usage }: { usage: Usage }) {
  const pct = usagePercent(usage.spendCents, usage.capCents);
  const band = usageBand(usage.spendCents, usage.capCents);
  const barPct = Math.min(pct, 100);
  const style = BAND_STYLE[band];

  return (
    <section className={styles.panel}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>API spend this period</h2>
        <span className={styles.period}>
          {formatShortDate(usage.periodStart)} – {formatShortDate(usage.periodEnd)}
        </span>
      </div>

      <div className={styles.figureRow}>
        <span className={styles.spend}>{formatCents(usage.spendCents)}</span>
        <span className={styles.cap}>of {formatCents(usage.capCents)} cap</span>
        {band !== "neutral" && (
          <span
            className={styles.chip}
            style={{ color: style.text, background: style.chipBg ?? undefined }}
          >
            {band === "alarm" ? "Over cap" : "Approaching cap"}
          </span>
        )}
      </div>

      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="API spend against monthly cap"
      >
        <div className={styles.fill} style={{ width: `${barPct}%`, background: style.bar }} />
      </div>

      <p className={styles.footnote}>
        {pct}% of cap used. The cap is a soft limit — going over it doesn&apos;t interrupt
        service.
      </p>
    </section>
  );
}
