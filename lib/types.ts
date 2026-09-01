export type Tenant = {
  id: string;
  name: string;
  plan: string;
};

export type Module = {
  id: string;
  name: string;
  active: boolean;
  lastUsedAt: string | null;
};

export type ModuleUsage = {
  moduleId: string;
  spendCents: number;
  calls: number;
};

export type Usage = {
  periodStart: string;
  periodEnd: string;
  capCents: number;
  spendCents: number;
  byModule: ModuleUsage[];
};

export type DashboardData = {
  tenant: Tenant;
  modules: Module[];
  usage: Usage;
};

export type UsageBand = "neutral" | "warn" | "alarm";
