import type { Module, ModuleUsage } from "@/lib/types";
import ModuleCard from "./ModuleCard";
import styles from "./ModuleGrid.module.css";

export default function ModuleGrid({
  modules,
  usage,
  onUpgrade,
}: {
  modules: Module[];
  usage: ModuleUsage[];
  onUpgrade: (moduleId: string) => void;
}) {
  if (modules.length === 0) {
    return <p className={styles.empty}>No modules configured for this tenant yet.</p>;
  }

  return (
    <div className={styles.grid}>
      {modules.map((m) => {
        const moduleUsage = usage.find((u) => u.moduleId === m.id);
        return (
          <ModuleCard 
            key={m.id} 
            module={m} 
            onUpgrade={onUpgrade}
            usage={moduleUsage}
          />
        );
      })}
    </div>
  );
}
