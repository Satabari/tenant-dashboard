import styles from "./PlanComparisonModal.module.css";

interface PlanComparisonModalProps {
  isOpen: boolean;
  currentPlan: string;
  onClose: () => void;
}

const PLANS = [
  {
    name: "Starter",
    monthlyPrice: "$99",
    modules: ["Planner"],
    apiCallsPerMonth: "10,000",
    supportLevel: "Email",
  },
  {
    name: "Growth",
    monthlyPrice: "$499",
    modules: ["Planner", "Insights"],
    apiCallsPerMonth: "100,000",
    supportLevel: "Priority",
    highlighted: true,
  },
  {
    name: "Pro",
    monthlyPrice: "$999",
    modules: ["Planner", "Insights", "Workflow", "Billing Ops"],
    apiCallsPerMonth: "Unlimited",
    supportLevel: "24/7 Dedicated",
  },
];

export default function PlanComparisonModal({
  isOpen,
  currentPlan,
  onClose,
}: PlanComparisonModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <h2 className={styles.title}>Plan Comparison</h2>

        <div className={styles.plansGrid}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`${styles.planCard} ${
                plan.name === currentPlan ? styles.current : ""
              } ${plan.highlighted ? styles.highlighted : ""}`}
            >
              <h3 className={styles.planName}>{plan.name}</h3>
              <p className={styles.price}>{plan.monthlyPrice}/mo</p>

              <div className={styles.features}>
                <div className={styles.feature}>
                  <span className={styles.label}>Modules:</span>
                  <span className={styles.value}>{plan.modules.join(", ")}</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.label}>API Calls:</span>
                  <span className={styles.value}>{plan.apiCallsPerMonth}/month</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.label}>Support:</span>
                  <span className={styles.value}>{plan.supportLevel}</span>
                </div>
              </div>

              {plan.name === currentPlan && (
                <p className={styles.currentBadge}>Your Current Plan</p>
              )}
            </div>
          ))}
        </div>

        <p className={styles.footer}>
          Need more flexibility? Contact our sales team for custom plans.
        </p>
      </div>
    </>
  );
}
