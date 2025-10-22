// Dashboard API Response Types
export interface CustomerMetrics {
  currentMonthCount: number;
  previousMonthCount: number;
  percentageChange: number;
}

export interface ConversionMetrics {
  newCustomersCount: number;
  signedContractCount: number;
  conversionRate: number;
}

export interface RevenueMetric {
  date: string;
  revenue: number;
}

export interface PipelineFunnelItem {
  pipelineName: string;
  count: number;
  percentage: number;
}

export interface SaleDashboardResponse {
  error: null | string;
  content: {
    customerMetrics: CustomerMetrics;
    conversionMetrics: ConversionMetrics;
    revenueMetrics: RevenueMetric[];
    pipelineFunnel: PipelineFunnelItem[];
  };
}

// Chart configuration types
export interface ChartConfig {
  [key: string]: {
    label: string;
    color?: string;
  };
}
