import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconLoader2,
  IconArrowLeft,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconUsers,
  IconCurrencyDollar,
  IconBolt,
  IconUserCheck,
  IconAward,
  IconActivity,
} from "@tabler/icons-react";
import { toast } from "sonner";
import TeamService from "@/services/api/TeamService";
import { formatCurrency } from "@/utils/format";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

// Import new dashboard components

interface TeamDashboard {
  teamOverview: {
    teamName: string;
    leaderName: string;
    totalMembers: number;
    activeMembers: number;
    teamCreatedDate: string;
  };
  customerMetrics: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    newCustomersLastMonth: number;
    customerGrowthPercentage: number;
    customersWithDeals: number;
    conversionRate: number;
  };
  revenueMetrics: {
    totalRevenueThisMonth: number;
    totalRevenueLastMonth: number;
    revenueGrowthPercentage: number;
    averageRevenuePerMember: number;
    totalCommissionThisMonth: number;
    totalCommissionLastMonth: number;
    commissionGrowthPercentage: number;
  };
  dealMetrics: {
    totalDeals: number;
    dealsThisMonth: number;
    dealsLastMonth: number;
    dealGrowthPercentage: number;
    signedDealsThisMonth: number;
    signedDealsLastMonth: number;
    signedDealGrowthPercentage: number;
    averageDealValue: number;
    pendingDeals: number;
  };
  memberPerformance: Array<{
    memberName: string;
    memberId: string;
    customersAssigned: number;
    dealsThisMonth: number;
    revenueThisMonth: number;
    commissionThisMonth: number;
    performanceScore: number;
  }>;
  pipelineFunnel: Array<{
    pipelineName: string;
    customerCount: number;
    percentage: number;
  }>;
}

// Modern Chart configurations with premium styling
const dealChartConfig = {
  deals: {
    label: "Tổng giao dịch",
    color: "hsl(var(--chart-1))",
  },
  signed: {
    label: "Ký hợp đồng",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const revenueChartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "hsl(var(--chart-1))",
  },
  commission: {
    label: "Hoa hồng",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const performanceChartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "hsl(var(--chart-1))",
  },
  performance: {
    label: "Điểm hiệu suất",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const pipelineChartConfig = {
  customers: {
    label: "Khách hàng",
    color: "hsl(var(--chart-1))",
  },
  new: {
    label: "Mới",
    color: "hsl(var(--chart-2))",
  },
  negotiation: {
    label: "Đàm phán",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// ============ MEMOIZED COMPONENTS ============

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

const MetricCard = memo<MetricCardProps>(
  ({ title, value, description, icon, trend, trendLabel, className = "" }) => {
    const isPositive = trend !== undefined && trend >= 0;
    const TrendIcon = isPositive ? IconTrendingUp : IconTrendingDown;

    return (
      <Card className={`relative overflow-hidden ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="rounded-lg bg-primary/10 p-3">{icon}</div>
              {trend !== undefined && (
                <div
                  className={`flex items-center space-x-1 text-xs ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendIcon className="h-3 w-3" />
                  <span>{Math.abs(trend).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
          {trendLabel && (
            <div className="mt-2 text-xs text-muted-foreground">
              {trendLabel}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

MetricCard.displayName = "MetricCard";

interface OverviewCardsProps {
  dashboard: TeamDashboard;
}

const OverviewCards = memo<OverviewCardsProps>(({ dashboard }) => {
  const metrics = useMemo(
    () => [
      {
        title: "Tổng thành viên",
        value: dashboard.teamOverview.totalMembers,
        description: `${dashboard.teamOverview.activeMembers} hoạt động`,
        icon: <IconUsers className="h-5 w-5 text-primary" />,
        trendLabel: "Trưởng nhóm: " + dashboard.teamOverview.leaderName,
      },
      {
        title: "Tổng khách hàng",
        value: dashboard.customerMetrics.totalCustomers,
        description: `${dashboard.customerMetrics.newCustomersThisMonth} mới tháng này`,
        icon: <IconTarget className="h-5 w-5 text-blue-600" />,
        trend: dashboard.customerMetrics.customerGrowthPercentage,
        trendLabel: `Tỷ lệ chuyển đổi: ${dashboard.customerMetrics.conversionRate.toFixed(
          1
        )}%`,
      },
      {
        title: "Tổng giao dịch",
        value: dashboard.dealMetrics.totalDeals,
        description: `${dashboard.dealMetrics.signedDealsThisMonth} ký hợp đồng`,
        icon: <IconBolt className="h-5 w-5 text-yellow-600" />,
        trend: dashboard.dealMetrics.dealGrowthPercentage,
        trendLabel: `Giá trị TB: ${formatCurrency(
          dashboard.dealMetrics.averageDealValue
        )}`,
      },
      {
        title: "Doanh thu tháng này",
        value: formatCurrency(dashboard.revenueMetrics.totalRevenueThisMonth),
        description: `Hoa hồng: ${formatCurrency(
          dashboard.revenueMetrics.totalCommissionThisMonth
        )}`,
        icon: <IconCurrencyDollar className="h-5 w-5 text-green-600" />,
        trend: dashboard.revenueMetrics.revenueGrowthPercentage,
        trendLabel: `TB/người: ${formatCurrency(
          dashboard.revenueMetrics.averageRevenuePerMember
        )}`,
      },
    ],
    [dashboard]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
});

OverviewCards.displayName = "OverviewCards";

// Revenue Area Chart Component
interface RevenueChartProps {
  data: Array<any>;
  title: string;
  description: string;
}

const RevenueAreaChart = memo<RevenueChartProps>(
  ({ data, title, description }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconActivity className="h-5 w-5 text-green-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={revenueChartConfig} className="h-[300px]">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                name === "revenue" ? "Doanh thu" : "Hoa hồng",
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="var(--color-revenue)"
              fill="var(--color-revenue)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="commission"
              stackId="2"
              stroke="var(--color-commission)"
              fill="var(--color-commission)"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
);

RevenueAreaChart.displayName = "RevenueAreaChart";

// Deal Bar Chart Component
interface DealBarChartProps {
  data: Array<any>;
  title: string;
  description: string;
}

const DealBarChart = memo<DealBarChartProps>(({ data, title, description }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <IconBolt className="h-5 w-5 text-yellow-600" />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer config={dealChartConfig} className="h-[300px]">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="deals"
            fill="var(--color-deals)"
            radius={[4, 4, 0, 0]}
            name="Tổng giao dịch"
          />
          <Bar
            dataKey="signed"
            fill="var(--color-signed)"
            radius={[4, 4, 0, 0]}
            name="Ký hợp đồng"
          />
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
));

DealBarChart.displayName = "DealBarChart";

// Performance Line Chart Component
interface PerformanceLineChartProps {
  data: Array<any>;
  title: string;
  description: string;
}

const PerformanceLineChart = memo<PerformanceLineChartProps>(
  ({ data, title, description }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconAward className="h-5 w-5 text-purple-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={performanceChartConfig} className="h-[300px]">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="member"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 8)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              yAxisId="revenue"
              orientation="left"
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              yAxisId="performance"
              orientation="right"
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, name) => [
                name === "revenue" ? formatCurrency(Number(value)) : value,
                name === "revenue" ? "Doanh thu" : "Điểm hiệu suất",
              ]}
            />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={3}
              dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="performance"
              type="monotone"
              dataKey="performance"
              stroke="var(--color-performance)"
              strokeWidth={3}
              dot={{ fill: "var(--color-performance)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
);

PerformanceLineChart.displayName = "PerformanceLineChart";

// Pipeline Pie Chart Component
interface PipelinePieChartProps {
  data: Array<any>;
  title: string;
  description: string;
}

const PipelinePieChart = memo<PipelinePieChartProps>(
  ({ data, title, description }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTarget className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={pipelineChartConfig} className="h-[300px]">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value) => [value, "Khách hàng"]}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
);

PipelinePieChart.displayName = "PipelinePieChart";

interface ChartsProps {
  dealChartData: Array<any>;
  revenueChartData: Array<any>;
  memberChartData: Array<any>;
  pipelineChartData: Array<any>;
}

const DashboardCharts = memo<ChartsProps>(
  ({ dealChartData, revenueChartData, memberChartData, pipelineChartData }) => (
    <div className="space-y-6">
      {/* First Row - Revenue and Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueAreaChart
          data={revenueChartData}
          title="Doanh thu & Hoa hồng"
          description="Xu hướng tăng trưởng theo tháng"
        />
        <DealBarChart
          data={dealChartData}
          title="Giao dịch"
          description="So sánh tháng này và tháng trước"
        />
      </div>

      {/* Second Row - Performance and Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceLineChart
          data={memberChartData}
          title="Hiệu suất thành viên"
          description="Doanh thu và điểm đánh giá"
        />
        <PipelinePieChart
          data={pipelineChartData}
          title="Phân bố Pipeline"
          description="Khách hàng theo giai đoạn"
        />
      </div>
    </div>
  )
);

DashboardCharts.displayName = "DashboardCharts";

interface MemberTableProps {
  memberPerformance: TeamDashboard["memberPerformance"];
}

const MemberPerformanceTable = memo<MemberTableProps>(
  ({ memberPerformance }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUserCheck className="h-5 w-5 text-indigo-600" />
            Chi tiết hiệu suất thành viên
          </CardTitle>
          <CardDescription>
            Bảng xếp hạng và thống kê chi tiết từng thành viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                    Thành viên
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">
                    Khách hàng
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">
                    Giao dịch
                  </th>
                  <th className="text-right py-4 px-4 font-semibold text-muted-foreground">
                    Doanh thu
                  </th>
                  <th className="text-right py-4 px-4 font-semibold text-muted-foreground">
                    Hoa hồng
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">
                    Điểm hiệu suất
                  </th>
                </tr>
              </thead>
              <tbody>
                {memberPerformance
                  .sort((a, b) => b.performanceScore - a.performanceScore)
                  .map((member, index) => (
                    <tr
                      key={member.memberId}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{member.memberName}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {member.memberId.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <Badge variant="outline" className="font-medium">
                          {member.customersAssigned}
                        </Badge>
                      </td>
                      <td className="text-center py-4 px-4">
                        <Badge variant="secondary" className="font-medium">
                          {member.dealsThisMonth}
                        </Badge>
                      </td>
                      <td className="text-right py-4 px-4">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(member.revenueThisMonth)}
                        </p>
                      </td>
                      <td className="text-right py-4 px-4">
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(member.commissionThisMonth)}
                        </p>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="font-medium text-red-600">
                          {member.performanceScore.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {memberPerformance.length}
              </p>
              <p className="text-sm text-muted-foreground">Tổng thành viên</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  memberPerformance.reduce(
                    (sum, member) => sum + member.revenueThisMonth,
                    0
                  )
                )}
              </p>
              <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  memberPerformance.reduce(
                    (sum, member) => sum + member.commissionThisMonth,
                    0
                  )
                )}
              </p>
              <p className="text-sm text-muted-foreground">Tổng hoa hồng</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

MemberPerformanceTable.displayName = "MemberPerformanceTable";

// ============ MAIN COMPONENT ============

const TeamDashboard: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<TeamDashboard | null>(null);

  // ✅ Memoized loadDashboard function
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TeamService.getTeamDashboard(teamId!);

      console.log("Full response:", response);

      // ✅ Fix: Handle different response structures
      // API returns: { data: { content: {...} } } or { data: {...} }
      let data = response?.data?.content || response?.data;

      console.log("Extracted data:", data);

      if (!data) {
        throw new Error("Không có dữ liệu từ API");
      }

      setDashboard(data);
      toast.success("Tải dữ liệu thành công!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi tải dữ liệu";
      console.error("Error loading team dashboard:", error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  // ✅ Load dashboard only when teamId changes (not when loadDashboard changes)
  useEffect(() => {
    if (teamId) {
      loadDashboard();
    }
  }, [teamId]); // ⚠️ IMPORTANT: Remove loadDashboard from dependency to prevent infinite loop

  // ✅ Memoized handlers
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // ✅ handleRetry doesn't need loadDashboard in dependency
  // because loadDashboard is already memoized with teamId
  const handleRetry = useCallback(() => {
    if (teamId) {
      loadDashboard();
    }
  }, [teamId, loadDashboard]);

  // ✅ Memoized chart data - MUST be called before any early returns
  const dealChartData = useMemo(() => {
    if (!dashboard) return [];
    return [
      {
        month: "Tháng này",
        deals: dashboard.dealMetrics.dealsThisMonth,
        signed: dashboard.dealMetrics.signedDealsThisMonth,
      },
      {
        month: "Tháng trước",
        deals: dashboard.dealMetrics.dealsLastMonth,
        signed: dashboard.dealMetrics.signedDealsLastMonth,
      },
    ];
  }, [dashboard?.dealMetrics]);

  const revenueChartData = useMemo(() => {
    if (!dashboard) return [];
    return [
      {
        month: "Tháng trước",
        revenue: dashboard.revenueMetrics.totalRevenueLastMonth,
        commission: dashboard.revenueMetrics.totalCommissionLastMonth,
      },
      {
        month: "Tháng này",
        revenue: dashboard.revenueMetrics.totalRevenueThisMonth,
        commission: dashboard.revenueMetrics.totalCommissionThisMonth,
      },
    ];
  }, [dashboard?.revenueMetrics]);

  const memberChartData = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.memberPerformance.map((member) => ({
      member: member.memberName.substring(0, 8),
      revenue: member.revenueThisMonth,
      performance: member.performanceScore,
    }));
  }, [dashboard?.memberPerformance]);

  const pipelineChartData = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.pipelineFunnel.map((pipeline) => ({
      name: pipeline.pipelineName,
      value: pipeline.customerCount,
      percentage: pipeline.percentage,
    }));
  }, [dashboard?.pipelineFunnel]);

  // ✅ Loading state
  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <IconLoader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  // ✅ Error state
  if (error && !dashboard) {
    return (
      <div className="p-6">
        <Button onClick={handleBack} variant="outline" className="mb-4">
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRetry} variant="default">
            <IconRefresh className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // ✅ No data state
  if (!dashboard) {
    return (
      <div className="p-6">
        <Button onClick={handleBack} variant="outline" className="mb-4">
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="text-center py-12">
          <p className="text-gray-600">Không thể tải dữ liệu dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <IconArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">
                  {dashboard.teamOverview.teamName}
                </h1>
              </div>
              <p className="text-muted-foreground">
                Trưởng nhóm: {dashboard.teamOverview.leaderName} • Tạo ngày:{" "}
                {dashboard.teamOverview.teamCreatedDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                {loading ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconRefresh className="h-4 w-4" />
                )}
                Làm mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Overview Cards */}
        <OverviewCards dashboard={dashboard} />

        {/* Charts Section */}
        <DashboardCharts
          dealChartData={dealChartData}
          revenueChartData={revenueChartData}
          memberChartData={memberChartData}
          pipelineChartData={pipelineChartData}
        />

        {/* Member Performance Table */}
        <MemberPerformanceTable
          memberPerformance={dashboard.memberPerformance}
        />
      </div>
    </div>
  );
};

export default TeamDashboard;
