import { formatCents } from "@/lib/format";
import styles from "./UpgradeConfirmationDialog.module.css";

interface UpgradeConfirmationDialogProps {
  isOpen: boolean;
  moduleName: string;
  upgradeCost: number;
  currentSpend: number;
  cap: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function UpgradeConfirmationDialog({
  isOpen,
  moduleName,
  upgradeCost,
  currentSpend,
  cap,
  onConfirm,
  onCancel,
}: UpgradeConfirmationDialogProps) {
  if (!isOpen) return null;

  const newSpend = currentSpend + upgradeCost;
  const percentOfCap = Math.round((newSpend / cap) * 100);
  const willExceedCap = newSpend > cap;

  return (
    <>
      <div className={styles.overlay} onClick={onCancel} />
      <div className={styles.dialog}>
        <h2 className={styles.title}>Upgrade Module</h2>
        
        <div className={styles.content}>
          <p className={styles.moduleInfo}>
            You are about to upgrade <strong>{moduleName}</strong>
          </p>

          <div className={styles.costBreakdown}>
            <div className={styles.row}>
              <span>Current spend:</span>
              <span>{formatCents(currentSpend)}</span>
            </div>
            <div className={styles.row}>
              <span>Upgrade cost:</span>
              <span className={styles.cost}>{formatCents(upgradeCost)}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.row}>
              <span>New total:</span>
              <span className={willExceedCap ? styles.exceeded : ""}>
                {formatCents(newSpend)}
              </span>
            </div>
            <div className={styles.row}>
              <span>Monthly cap:</span>
              <span>{formatCents(cap)}</span>
            </div>
            <div className={styles.row}>
              <span>Usage:</span>
              <span className={willExceedCap ? styles.exceeded : ""}>
                {percentOfCap}%
              </span>
            </div>
          </div>

          {willExceedCap && (
            <div className={styles.warning}>
              ⚠️ This upgrade will exceed your monthly cap. The cap is a soft limit — going
              over it doesn't interrupt service.
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            Confirm Upgrade
          </button>
        </div>
      </div>
    </>
  );
}
