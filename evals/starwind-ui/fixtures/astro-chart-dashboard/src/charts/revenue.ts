export interface RevenueRow {
  month: string;
  revenue: number;
  expenses: number;
}

export const revenueData: RevenueRow[] = [
  { month: "January", revenue: 18600, expenses: 12400 },
  { month: "February", revenue: 30500, expenses: 17800 },
  { month: "March", revenue: 23700, expenses: 15100 },
  { month: "April", revenue: 27300, expenses: 16900 },
  { month: "May", revenue: 20900, expenses: 14300 },
  { month: "June", revenue: 31400, expenses: 18200 },
];
