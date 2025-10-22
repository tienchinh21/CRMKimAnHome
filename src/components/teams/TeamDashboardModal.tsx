import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import TeamService from "@/services/api/TeamService";
import { formatCurrency } from "@/utils/format";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TeamDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}

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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const TeamDashboardModal: React.FC<TeamDashboardModalProps> = ({
  isOpen,
  onClose,
  teamId,
}) => {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<TeamDashboard | null>(null);

  useEffect(() => {
    if (isOpen && teamId) {
      loadDashboard();
    }
  }, [isOpen, teamId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await TeamService.getTeamDashboard(teamId);
      setDashboard(response.data.content);
    } catch (error) {
      console.error("Error loading team dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!dashboard && loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!dashboard) {
    return null;
  }

  const dealChartData = [
    {
      name: "Tháng này",
      deals: dashboard.dealMetrics.dealsThisMonth,
      signed: dashboard.dealMetrics.signedDealsThisMonth,
    },
    {
      name: "Tháng trước",
      deals: dashboard.dealMetrics.dealsLastMonth,
      signed: dashboard.dealMetrics.signedDealsLastMonth,
    },
  ];

  const revenueChartData = [
    {
      name: "Tháng này",
      revenue: dashboard.revenueMetrics.totalRevenueThisMonth,
      commission: dashboard.revenueMetrics.totalCommissionThisMonth,
    },
    {
      name: "Tháng trước",
      revenue: dashboard.revenueMetrics.totalRevenueLastMonth,
      commission: dashboard.revenueMetrics.totalCommissionLastMonth,
    },
  ];

  const memberChartData = dashboard.memberPerformance.map((member) => ({
    name: member.memberName.substring(0, 10),
    revenue: member.revenueThisMonth,
    score: member.performanceScore,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Tổng quan đội nhóm: {dashboard.teamOverview.teamName}
          </DialogTitle>
          <DialogDescription>
            Trưởng nhóm: {dashboard.teamOverview.leaderName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Tổng thành viên
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboard.teamOverview.totalMembers}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboard.teamOverview.activeMembers} hoạt động
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Tổng khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboard.customerMetrics.totalCustomers}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboard.customerMetrics.newCustomersThisMonth} mới tháng này
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Tổng giao dịch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboard.dealMetrics.totalDeals}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboard.dealMetrics.signedDealsThisMonth} ký hợp đồng
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Doanh thu tháng này
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(dashboard.revenueMetrics.totalRevenueThisMonth)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  +{dashboard.revenueMetrics.revenueGrowthPercentage.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deal Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Giao dịch</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dealChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="deals" fill="#3b82f6" name="Tổng giao dịch" />
                    <Bar dataKey="signed" fill="#10b981" name="Ký hợp đồng" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Doanh thu & Hoa hồng</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      name="Doanh thu"
                    />
                    <Line
                      type="monotone"
                      dataKey="commission"
                      stroke="#f59e0b"
                      name="Hoa hồng"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pipeline Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Phễu bán hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboard.pipelineFunnel}
                      dataKey="customerCount"
                      nameKey="pipelineName"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {dashboard.pipelineFunnel.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Member Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hiệu suất thành viên</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={memberChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" name="Doanh thu" />
                    <Bar dataKey="score" fill="#3b82f6" name="Điểm" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Member Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chi tiết hiệu suất thành viên</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 font-medium text-gray-600">
                        Tên thành viên
                      </th>
                      <th className="text-right py-2 px-2 font-medium text-gray-600">
                        Khách hàng
                      </th>
                      <th className="text-right py-2 px-2 font-medium text-gray-600">
                        Giao dịch
                      </th>
                      <th className="text-right py-2 px-2 font-medium text-gray-600">
                        Doanh thu
                      </th>
                      <th className="text-right py-2 px-2 font-medium text-gray-600">
                        Hoa hồng
                      </th>
                      <th className="text-right py-2 px-2 font-medium text-gray-600">
                        Điểm
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.memberPerformance.map((member) => (
                      <tr key={member.memberId} className="border-b border-gray-100">
                        <td className="py-2 px-2">{member.memberName}</td>
                        <td className="text-right py-2 px-2">
                          {member.customersAssigned}
                        </td>
                        <td className="text-right py-2 px-2">
                          {member.dealsThisMonth}
                        </td>
                        <td className="text-right py-2 px-2 text-green-600 font-medium">
                          {formatCurrency(member.revenueThisMonth)}
                        </td>
                        <td className="text-right py-2 px-2 text-blue-600 font-medium">
                          {formatCurrency(member.commissionThisMonth)}
                        </td>
                        <td className="text-right py-2 px-2">
                          <Badge variant="outline">
                            {member.performanceScore.toFixed(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamDashboardModal;

