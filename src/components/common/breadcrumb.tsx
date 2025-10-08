import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  projectName?: string;
  apartmentName?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  projectName,
  apartmentName,
}) => {
  const location = useLocation();

  // Auto-generate breadcrumb from current path if items not provided
  const generateBreadcrumb = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    // Special case: if we're at root (/), only show Dashboard
    if (pathSegments.length === 0) {
      return [{ label: "Dashboard", current: true }];
    }

    const breadcrumbItems: BreadcrumbItem[] = [
      { label: "Dashboard", href: "/" },
    ];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      let label = segment;
      // Custom labels for known routes
      switch (segment) {
        case "dashboard":
          // Skip dashboard segment as it's already added above
          return;
        case "projects":
          label = "Quản lý Dự án";
          break;
        case "customers":
          label = "Quản lý Khách hàng";
          break;
        case "deals":
          label = "Quản lý Giao dịch";
          break;
        case "apartments":
          label = "Quản lý Căn hộ";
          break;
        case "new":
          label = "Tạo mới";
          break;
        case "blog":
          label = "Quản lý Blog";
          break;
        case "blog-categories":
          label = "Quản lý Danh mục";
          break;
        case "blog-create":
          label = "Tạo mới Blog";
          break;
        case "system-config":
          label = "Quản lý Cấu hình Hệ thống";
          break;
        default:
          // Show project name if it's a project ID and we have projectName
          if (
            (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              segment
            ) ||
              /^[a-zA-Z0-9_-]{20,}$/.test(segment)) &&
            projectName
          ) {
            label = projectName || apartmentName || "Chi tiết";
          } else if (
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              segment
            ) ||
            (/^[a-zA-Z0-9_-]{20,}$/.test(segment) && apartmentName)
          ) {
            label = apartmentName || "Chi tiết";
          } else {
            label = segment.charAt(0).toUpperCase() + segment.slice(1);
          }
      }

      breadcrumbItems.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast,
      });
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = items || generateBreadcrumb();

  return (
    <nav
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground",
        className
      )}
    >
      <Home className="h-4 w-4" />

      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          )}

          {item.href && !item.current ? (
            <Link
              to={item.href}
              className="hover:text-foreground transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                "font-medium",
                item.current ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
