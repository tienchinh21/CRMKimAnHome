import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

// Status mapping for different status types
const STATUS_CONFIG = {
  // Deal statuses
  "Đang giải quyết": {
    variant: "secondary" as const,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  "Mới tạo": {
    variant: "outline" as const,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  "Đang xử lý": {
    variant: "secondary" as const,
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  "Hoàn thành": {
    variant: "default" as const,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  "Đã hủy": {
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800 border-red-200",
  },
  "Chờ phê duyệt": {
    variant: "outline" as const,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  "Đã từ chối": {
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800 border-red-200",
  },
  "Tạm dừng": {
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  // Apartment statuses
  "Còn trống": {
    variant: "outline" as const,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  "Đã bán": {
    variant: "default" as const,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  "Đã cho thuê": {
    variant: "secondary" as const,
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  "Đã đặt cọc": {
    variant: "outline" as const,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  "Bảo trì": {
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800 border-red-200",
  },
} as const;

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  className,
}) => {
  // Get configuration for the status
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

  // Use provided variant or fall back to config variant or default
  const badgeVariant = variant || config?.variant || "secondary";

  // Combine config className with provided className
  const badgeClassName = cn(
    config?.className || "bg-gray-100 text-gray-800 border-gray-200",
    className
  );

  return (
    <Badge variant={badgeVariant} className={badgeClassName}>
      {status || "Chưa xác định"}
    </Badge>
  );
};

export default StatusBadge;
