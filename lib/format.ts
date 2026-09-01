import type { UsageBand } from "./types";

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Cap is soft: 100%+ is "alarm" but never blocks usage, it's informational only.
 * Thresholds per spec: neutral <80%, warn 80-99%, alarm >=100%.
 */
export function usageBand(spendCents: number, capCents: number): UsageBand {
  if (capCents <= 0) return "neutral"; // defensive: avoid divide-by-zero / NaN on bad data
  const pct = (spendCents / capCents) * 100;
  if (pct >= 100) return "alarm";
  if (pct >= 80) return "warn";
  return "neutral";
}

export function usagePercent(spendCents: number, capCents: number): number {
  if (capCents <= 0) return 0;
  return Math.round((spendCents / capCents) * 100);
}
