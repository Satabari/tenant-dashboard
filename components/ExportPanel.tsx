import type { DashboardData } from "@/lib/types";
import { exportUsageCSV, downloadCSV, generatePDFReport } from "@/lib/export";
import styles from "./ExportPanel.module.css";

export default function ExportPanel({ data }: { data: DashboardData }) {
  const handleExportCSV = () => {
    const csv = exportUsageCSV(data);
    downloadCSV(csv, `usage-report-${Date.now()}.csv`);
  };

  const handleExportReport = () => {
    generatePDFReport(data);
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Export Data</h3>
      <div className={styles.buttons}>
        <button onClick={handleExportCSV} className={styles.btn}>
          📊 Export CSV
        </button>
        <button onClick={handleExportReport} className={styles.btn}>
          📄 Export Report
        </button>
      </div>
    </div>
  );
}
