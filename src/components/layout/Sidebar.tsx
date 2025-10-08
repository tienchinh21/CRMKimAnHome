import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import {
  Home,
  Building2,
  KeyRound,
  X,
  ChevronRight,
  ChevronDown,
  Users,
  FileText,
  FolderOpen,
  Edit3,
  User,
  Settings,
  Menu,
  Check,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    name: "Quản lý Dự án",
    icon: Building2,
    children: [
      {
        name: "Danh sách Dự án",
        href: ROUTES.PROJECTS,
        icon: Building2,
      },
      {
        name: "Quản lý Căn hộ",
        href: ROUTES.APARTMENTS,
        icon: KeyRound,
      },
    ],
  },
  {
    name: "Quản lý Khách hàng",

    icon: Users,
    children: [
      {
        name: "Quản lý Khách hàng",
        href: ROUTES.CUSTOMERS,
        icon: Users,
      },
      {
        name: "Quản lý giao dịch",
        href: ROUTES.DEALS,
        icon: DollarSign,
      },
    ],
  },
  {
    name: "Quản lý Nội dung",
    icon: FileText,
    children: [
      {
        name: "Quản lý Danh mục",
        href: ROUTES.BLOG_CATEGORIES,
        icon: FolderOpen,
      },
      {
        name: "Quản lý Bài viết",
        href: ROUTES.BLOG,
        icon: Edit3,
      },
    ],
  },
  {
    name: "Quản lý Nhân sự",
    icon: Users,
    children: [
      {
        name: "Quản lý Nhân viên",
        icon: User,
        href: "/users",
      },
      {
        name: "Quản lý Đội nhóm",
        icon: Users,
        href: "/teams",
      },
    ],
  },
  {
    name: "Cấu hình Hệ thống",
    icon: Settings,
    href: "/system-config",
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const isParentActive = (item: NavigationItem) => {
    if (item.href) return isActivePath(item.href);
    if (item.children) {
      return item.children.some(
        (child) => child.href && isActivePath(child.href)
      );
    }
    return false;
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  // Auto-expand parent if child is active
  React.useEffect(() => {
    const activeParent = navigationItems.find(
      (item) =>
        item.children &&
        item.children.some((child) => child.href && isActivePath(child.href))
    );

    if (activeParent && !expandedItems.includes(activeParent.name)) {
      setExpandedItems((prev) => [...prev, activeParent.name]);
    }
  }, [location.pathname, expandedItems]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isCollapsed ? "w-16" : "w-72",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-end p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-2">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href
                ? isActivePath(item.href)
                : isParentActive(item);
              const isExpanded = expandedItems.includes(item.name);

              return (
                <li key={item.name}>
                  {item.href ? (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                        isActive
                          ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            isActive
                              ? "text-blue-700"
                              : "text-gray-400 group-hover:text-gray-500"
                          )}
                        />
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                          {isActive && (
                            <Check className="h-4 w-4 text-blue-700" />
                          )}
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isActive
                                ? "text-blue-700"
                                : "text-gray-400 group-hover:text-gray-500"
                            )}
                          />
                        </div>
                      )}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                          isActive
                            ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon
                            className={cn(
                              "h-5 w-5",
                              isActive
                                ? "text-blue-700"
                                : "text-gray-400 group-hover:text-gray-500"
                            )}
                          />
                          {!isCollapsed && <span>{item.name}</span>}
                        </div>

                        {!isCollapsed && (
                          <div className="flex items-center space-x-2">
                            {isActive && (
                              <Check className="h-4 w-4 text-blue-700" />
                            )}
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                isExpanded ? "rotate-180" : "rotate-0",
                                isActive
                                  ? "text-blue-700"
                                  : "text-gray-400 group-hover:text-gray-500"
                              )}
                            />
                          </div>
                        )}
                      </button>

                      {/* Submenu */}
                      {!isCollapsed && isExpanded && item.children && (
                        <ul className="ml-8 mt-2 space-y-1">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = child.href
                              ? isActivePath(child.href)
                              : false;

                            return (
                              <li key={child.href}>
                                <Link
                                  to={child.href!}
                                  onClick={onClose}
                                  className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                                    isChildActive
                                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  )}
                                >
                                  <div className="flex items-center space-x-3">
                                    <ChildIcon
                                      className={cn(
                                        "h-4 w-4",
                                        isChildActive
                                          ? "text-blue-600"
                                          : "text-gray-400 group-hover:text-gray-500"
                                      )}
                                    />
                                    <span>{child.name}</span>
                                  </div>

                                  {isChildActive && (
                                    <Check className="h-4 w-4 text-blue-600" />
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              CRM Admin v1.0.0
              <br />© 2024 Kim Anh Home
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
