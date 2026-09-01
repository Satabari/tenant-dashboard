import styles from "./DashboardError.module.css";

export default function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className={styles.box} role="alert">
      <p className={styles.title}>Dashboard didn&apos;t load</p>
      <p className={styles.message}>{message}</p>
      <button className={styles.retryBtn} onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
