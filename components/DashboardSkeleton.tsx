import styles from "./DashboardSkeleton.module.css";

export default function DashboardSkeleton() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Loading dashboard">
      <div className={styles.panel} />
      <div className={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={styles.card} />
        ))}
      </div>
    </div>
  );
}
