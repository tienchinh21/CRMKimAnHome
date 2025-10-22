import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  TrendingDown,
  DollarSign,
  Target,
  UserCheck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Breadcrumb from "@/components/common/breadcrumb";
import DashboardService from "@/services/api/DashboardService";
import type { SaleDashboardResponse } from "@/types/dashboard";
import { formatCurrency } from "@/utils/format";
import { colors, chartColors } from "@/styles/dashboard-tokens";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] =
    useState<SaleDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth context to get user profile and roles
  const { userProfile } = useAuth();

  // Check if user has SALE role specifically
  const hasSaleRole = userProfile?.roleNames?.includes("SALE") || false;

  // Set default values to current month and year
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const currentYear = currentDate.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);

  // Chart configurations
  const revenueChartConfig = {
    revenue: {
      label: "Doanh thu",
      color: colors.primary.light,
    },
  } satisfies ChartConfig;

  const pipelineChartConfig = {
    count: {
      label: "Số lượng",
    },
  } satisfies ChartConfig;

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    // Check if user has SALE role before loading data
    if (!hasSaleRole) {
      setError("Bạn cần có role SALE để xem dashboard này");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await DashboardService.getSaleDashboard(
        selectedMonth,
        selectedYear
      );
      setDashboardData(response);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, hasSaleRole]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Generate month options
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, "0");
      const monthName = new Date(2024, i).toLocaleDateString("vi-VN", {
        month: "long",
      });
      return { value: month, label: monthName };
    });
  }, []);

  // Generate year options (current year ± 5 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => {
      const year = (currentYear - 5 + i).toString();
      return { value: year, label: year };
    });
  }, []);

  // Process revenue data for chart
  const processedRevenueData = useMemo(() => {
    if (!dashboardData?.content?.revenueMetrics) return [];

    return dashboardData.content.revenueMetrics.map((item) => ({
      date: item.date,
      revenue: item.revenue,
    }));
  }, [dashboardData]);

  // Process pipeline data for pie chart
  const processedPipelineData = useMemo(() => {
    if (!dashboardData?.content?.pipelineFunnel) return [];

    return dashboardData.content.pipelineFunnel.map((item, index) => ({
      name: item.pipelineName,
      value: item.count,
      percentage: item.percentage,
      fill: Object.values(chartColors)[index % 5], // Use chart colors from tokens
    }));
  }, [dashboardData]);

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    if (!dashboardData?.content?.revenueMetrics) return 0;
    return dashboardData.content.revenueMetrics.reduce(
      (sum, item) => sum + item.revenue,
      0
    );
  }, [dashboardData]);

  // Metric cards data
  const metricCards = useMemo(() => {
    if (!dashboardData?.content) return [];

    const { customerMetrics, conversionMetrics } = dashboardData.content;

    return [
      {
        title: "Khách hàng tháng này",
        value: customerMetrics.currentMonthCount.toString(),
        change: `${customerMetrics.percentageChange > 0 ? "+" : ""}${
          customerMetrics.percentageChange
        }%`,
        changeType:
          customerMetrics.percentageChange >= 0 ? "positive" : "negative",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Khách hàng mới",
        value: conversionMetrics.newCustomersCount.toString(),
        change: `${conversionMetrics.conversionRate}% chuyển đổi`,
        changeType: "neutral",
        icon: UserCheck,
        color: "text-blue-700",
        bgColor: "bg-blue-50",
      },
      {
        title: "Hợp đồng đã ký",
        value: conversionMetrics.signedContractCount.toString(),
        change: "Tháng này",
        changeType: "neutral",
        icon: Target,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
      },
      {
        title: "Tổng doanh thu",
        value: formatCurrency(totalRevenue.toString()),
        change: "Tháng này",
        changeType: "neutral",
        icon: DollarSign,
        color: "text-slate-600",
        bgColor: "bg-slate-50",
      },
    ];
  }, [dashboardData, totalRevenue]);

  // Access denied UI - Only SALE role can access this dashboard
  if (!hasSaleRole) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Dashboard dành cho nhân viên kinh doanh
            </h2>
            <p className="text-gray-600 mb-4">
              Dashboard này chỉ dành cho role{" "}
              <span className="font-semibold text-indigo-600">SALE</span> (Nhân
              viên kinh doanh).
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Vui lòng liên hệ quản trị viên để được cấp role phù hợp hoặc truy
              cập dashboard dành cho role của bạn.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Role hiện tại:</strong>{" "}
                {userProfile?.roleNames?.join(", ") || "Chưa có role"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Kinh Doanh
          </h1>
          <p className="text-gray-600 mt-2">
            Tổng quan doanh số và hiệu suất kinh doanh - Dành cho nhân viên SALE
          </p>
        </div>

        {/* Time Range Selectors */}
        <div className="flex items-center gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={`Tháng ${currentMonth}`} />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder={currentYear} />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((stat, index) => {
          const Icon = stat.icon;
          const ChangeIcon =
            stat.changeType === "positive"
              ? TrendingUp
              : stat.changeType === "negative"
              ? TrendingDown
              : null;

          return (
            <Card key={index} className="hover:shadow-md transition-shadow p-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1">
                  {ChangeIcon && (
                    <ChangeIcon
                      className={`h-4 w-4 ${
                        stat.changeType === "positive"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    />
                  )}
                  <p
                    className={`text-sm ${
                      stat.changeType === "positive"
                        ? "text-blue-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <div className="mb-6">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              Doanh thu theo ngày
            </CardTitle>
            <p className="text-sm text-gray-600">
              Biểu đồ doanh thu trong tháng được chọn
            </p>
          </div>
          <div className="h-[300px]">
            <ChartContainer
              config={revenueChartConfig}
              className="aspect-auto h-[300px] w-full"
            >
              <AreaChart data={processedRevenueData}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={colors.primary.light}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors.primary.light}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("vi-VN", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("vi-VN", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                      formatter={(value) => [
                        formatCurrency(value.toString()),
                        "Doanh thu",
                      ]}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="url(#fillRevenue)"
                  stroke={colors.primary.light}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </Card>

        {/* Pipeline Funnel Chart */}
        <Card className="p-6">
          <div className="mb-6">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              Phân bố Pipeline
            </CardTitle>
            <p className="text-sm text-gray-600">
              Tỷ lệ khách hàng theo từng giai đoạn
            </p>
          </div>
          <div className="h-[300px]">
            <ChartContainer
              config={pipelineChartConfig}
              className="aspect-auto h-[300px] w-full"
            >
              <PieChart>
                <Pie
                  data={processedPipelineData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {processedPipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, props) => [
                        `${value} khách hàng`,
                        props.payload.name,
                      ]}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
