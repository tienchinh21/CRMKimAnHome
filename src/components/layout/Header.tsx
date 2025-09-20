import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, User, Search } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:justify-end">
      {/* Mobile menu button - only show on mobile when sidebar is closed */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Search bar - hidden on mobile */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm dự án, căn hộ..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User menu */}
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>

        {/* Logout button */}
        <LogoutButton />
      </div>
    </header>
  );
};

export default Header;
