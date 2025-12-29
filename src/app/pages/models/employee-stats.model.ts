// employees-stats.model.ts
export interface KPI {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  terminations: number;
  turnoverRate: number;
  avgTenure: number;
}

export interface HiringTrend {
  date: string;
  newHires: number;
}
