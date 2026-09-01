import { useState } from "react";
import styles from "./ModuleSearch.module.css";

interface ModuleSearchProps {
  onFilterChange: (filter: string, status: "all" | "active" | "inactive") => void;
}

export default function ModuleSearch({ onFilterChange }: ModuleSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFilterChange(value, statusFilter);
  };

  const handleStatusChange = (status: "all" | "active" | "inactive") => {
    setStatusFilter(status);
    onFilterChange(searchTerm, status);
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Search modules..."
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        className={styles.searchInput}
      />
      <div className={styles.filterButtons}>
        {(["all", "active", "inactive"] as const).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className={`${styles.filterBtn} ${statusFilter === status ? styles.active : ""}`}
          >
            {status === "all" ? "All" : status === "active" ? "Active" : "Locked"}
          </button>
        ))}
      </div>
    </div>
  );
}
