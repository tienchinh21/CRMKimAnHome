import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Bell, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UserDropdown: React.FC = () => {
  const { logout, user, userProfile } = useAuth();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
    }
  };

  const handleProfile = () => {
    // TODO: Navigate to profile page
    console.log("Navigate to profile");
  };

  const handleNotifications = () => {
    // TODO: Navigate to notifications page
    console.log("Navigate to notifications");
  };

  const handleSettings = () => {
    // TODO: Navigate to settings page
    console.log("Navigate to settings");
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = userProfile?.fullName || user?.sub || "User";
  const userRole =
    userProfile?.roleNames?.[0] || user?.authorities?.[0] || "Role";
  const userAvatar = userProfile?.avatarUrl;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-3 h-10 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {/* Avatar */}
          <Avatar className="h-6 w-6">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-xs font-medium">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>

          {/* User info */}
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-700">{userName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>

          {/* Arrow icon */}
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={5}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userRole}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleProfile} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Hồ sơ</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={handleNotifications}
          className="cursor-pointer"
        >
          <Bell className="mr-2 h-4 w-4" />
          <span>Thông báo</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Cài đặt</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
