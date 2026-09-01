import type { Module } from "@/lib/types";
import ModuleCard from "./ModuleCard";
import styles from "./ModuleGrid.module.css";

export default function ModuleGrid({
  modules,
  onUpgrade,
}: {
  modules: Module[];
  onUpgrade: (moduleId: string) => void;
}) {
  if (modules.length === 0) {
    return <p className={styles.empty}>No modules configured for this tenant yet.</p>;
  }

  return (
    <div className={styles.grid}>
      {modules.map((m) => (
        <ModuleCard key={m.id} module={m} onUpgrade={onUpgrade} />
      ))}
    </div>
  );
}
