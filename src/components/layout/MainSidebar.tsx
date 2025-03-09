
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Car, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const MainSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar defaultCollapsed={false}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center">
          <div className="text-xl font-bold">CarRento</div>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <div className="space-y-1">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => navigate("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Button>
          <Button
            variant={isActive("/cars") ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => navigate("/cars")}
          >
            <Car className="mr-2 h-4 w-4" />
            <span>Browse Cars</span>
          </Button>
          <Button
            variant={isActive("/customer") ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => navigate("/customer")}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Customer Portal</span>
          </Button>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <span className="text-sm font-medium">JD</span>
          </div>
          <div className="text-sm">
            <p className="font-medium">John Doe</p>
            <p className="text-muted-foreground">Customer</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default MainSidebar;
