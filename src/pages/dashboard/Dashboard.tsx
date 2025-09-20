import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, KeyRound, TrendingUp, Users } from "lucide-react";
import Breadcrumb from "@/components/common/breadcrumb";

const Dashboard: React.FC = () => {
  // Mock statistics data
  const stats = [
    {
      title: "Tổng Dự án",
      value: "12",
      change: "+2 tháng này",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Tổng Căn hộ",
      value: "248",
      change: "+15 tuần này",
      icon: KeyRound,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Đã bán",
      value: "156",
      change: "+8 tuần này",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Khách hàng",
      value: "89",
      change: "+12 tháng này",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Tổng quan về tình hình kinh doanh bất động sản
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Dự án gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Vinhomes Grand Park",
                  location: "Quận 9, TP.HCM",
                  status: "Đang bán",
                  apartments: 85,
                },
                {
                  name: "Masteri Thảo Điền",
                  location: "Quận 2, TP.HCM",
                  status: "Sắp mở bán",
                  apartments: 120,
                },
                {
                  name: "Landmark 81",
                  location: "Quận Bình Thạnh, TP.HCM",
                  status: "Đã bàn giao",
                  apartments: 200,
                },
              ].map((project, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {project.name}
                    </h4>
                    <p className="text-sm text-gray-600">{project.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {project.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {project.apartments} căn hộ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Thống kê nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Căn hộ còn trống</span>
                <span className="font-semibold text-blue-600">92 căn</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đang đặt cọc</span>
                <span className="font-semibold text-yellow-600">15 căn</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cho thuê</span>
                <span className="font-semibold text-green-600">28 căn</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bảo trì</span>
                <span className="font-semibold text-red-600">3 căn</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">
                    Tổng doanh thu tháng
                  </span>
                  <span className="font-bold text-green-600 text-lg">
                    ₫2.4 tỷ
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
