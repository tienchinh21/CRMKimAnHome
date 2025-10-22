/**
 * TeamMembersTab Component
 * Hiển thị danh sách thành viên trong team và khách hàng của họ
 * Chỉ dành cho role LEADER
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, User, Phone, Mail, Building2 } from "lucide-react";
import { toast } from "sonner";
import TeamService from "@/services/api/TeamService";
import type { TeamMember, TeamMemberCustomer } from "@/types";

const TeamMembersTab: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamMembersCustomers, setTeamMembersCustomers] = useState<
    TeamMemberCustomer[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Load team members
  const loadTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await TeamService.getMyTeams();
      if (response.content) {
        setTeamMembers(response.content);
        if (response.content.length > 0) {
          setSelectedMemberId(response.content[0].id);
        }
      }
    } catch (error) {
      console.error("❌ Error loading team members:", error);
      toast.error("Không thể tải danh sách thành viên");
    } finally {
      setLoading(false);
    }
  };

  // Load team members customers
  const loadTeamMembersCustomers = async () => {
    setLoading(true);
    try {
      const response = await TeamService.getTeamMembersCustomers(
        currentPage,
        pageSize
      );
      if (response.content?.response) {
        setTeamMembersCustomers(response.content.response);
      }
    } catch (error) {
      console.error("❌ Error loading team members customers:", error);
      toast.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadTeamMembers();
  }, []);

  // Load customers when page changes
  useEffect(() => {
    loadTeamMembersCustomers();
  }, [currentPage]);

  const selectedMember = teamMembers.find((m) => m.id === selectedMemberId);

  return (
    <div className="space-y-6">
      {/* Team Members Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Thành viên trong đội nhóm
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có thành viên nào trong đội nhóm
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Đội nhóm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedMemberId === member.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedMemberId(member.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.fullName}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <User className="h-8 w-8 text-gray-400" />
                          )}
                          {member.fullName}
                          {member.leader && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Trưởng nhóm
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.leader ? "Trưởng nhóm" : "Nhân viên"}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phoneNumber}</TableCell>
                      <TableCell>{member.teamName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members Customers Section */}
      {selectedMember && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Khách hàng của {selectedMember.fullName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Đang tải dữ liệu...
              </div>
            ) : teamMembersCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không có khách hàng nào
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên khách hàng</TableHead>
                      <TableHead>Nguồn</TableHead>
                      <TableHead>Nhu cầu</TableHead>
                      <TableHead>Dự án</TableHead>
                      <TableHead>Pipeline</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembersCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.fullName}
                        </TableCell>
                        <TableCell>{customer.sourcesName}</TableCell>
                        <TableCell>{customer.demandName}</TableCell>
                        <TableCell>{customer.projectName}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {customer.pipelineName}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {customer.note}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamMembersTab;

