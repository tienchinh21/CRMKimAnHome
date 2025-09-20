import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ROUTES } from "@/lib/constants";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem("auth_token");

    // Redirect to login
    navigate(ROUTES.LOGIN);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Đăng xuất
    </Button>
  );
};

export default LogoutButton;
