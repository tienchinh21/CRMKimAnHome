import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DataTable, { type Column } from "@/components/common/DataTable";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TeamMember } from "@/types";

interface TeamMembersTableProps {
  members: TeamMember[];
  loading?: boolean;
  onSelectMember?: (member: TeamMember) => void;
}

const TeamMembersTable: React.FC<TeamMembersTableProps> = ({
  members,
  loading = false,
  onSelectMember,
}) => {
  // Table columns
  const columns: Column<TeamMember>[] = [
    {
      key: "fullName",
      header: "Tên thành viên",
      render: (member) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.fullName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-blue-600">
                {member.fullName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-gray-900">
            {member.fullName}
          </span>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      header: "Số điện thoại",
      render: (member) => (
        <span className="text-sm text-gray-700">{member.phoneNumber}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (member) => (
        <span className="text-sm text-gray-700">{member.email}</span>
      ),
    },
    {
      key: "leader",
      header: "Vai trò",
      render: (member) => (
        <Badge
          variant={member.leader ? "default" : "secondary"}
          className={
            member.leader
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {member.leader ? "Trưởng nhóm" : "Thành viên"}
        </Badge>
      ),
    },
  ];

  // Actions
  const actions = (member: TeamMember) => (
    <div className="inline-flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onSelectMember?.(member)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Xem khách hàng</TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <Card>
      <CardContent className="">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <DataTable
            columns={columns}
            data={members}
            actions={actions}
            emptyMessage="Không tìm thấy thành viên nào"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamMembersTable;

