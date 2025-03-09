
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Car, Home, User, FileText, Wrench, LogOut, Login } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/models";

const MainSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, isLoading } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const hasRole = (roles: UserRole[]) => {
    if (!profile) return false;
    return roles.includes(profile.role as UserRole);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center">
          <div className="text-xl font-bold">CarRento</div>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        {user ? (
          <div className="space-y-1">
            <Button
              variant={isActive("/dashboard") ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate("/dashboard")}
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
            
            {/* Only show customer portal link to customers, admins and super admins */}
            {hasRole(["Customer", "Admin", "SuperAdmin"]) && (
              <Button
                variant={isActive("/customer") ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate("/customer")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Customer Portal</span>
              </Button>
            )}
            
            {/* Only show car owner portal link to car owners, admins and super admins */}
            {hasRole(["CarOwner", "Admin", "SuperAdmin"]) && (
              <Button
                variant={isActive("/owner") ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate("/owner")}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Car Owner Portal</span>
              </Button>
            )}

            {/* Only show service center link to service center staff, admins and super admins */}
            {hasRole(["ServiceCenterStaff", "Admin", "SuperAdmin"]) && (
              <Button
                variant={isActive("/service") ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate("/service")}
              >
                <Wrench className="mr-2 h-4 w-4" />
                <span>Service Center</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/auth")}
            >
              <Login className="mr-2 h-4 w-4" />
              <span>Log In / Sign Up</span>
            </Button>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        {user && profile ? (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <span className="text-sm font-medium">
                  {profile.full_name ? profile.full_name.charAt(0) : "U"}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium">{profile.full_name || "User"}</p>
                <p className="text-muted-foreground">{profile.role || "Guest"}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        ) : !isLoading && (
          <Button
            className="w-full"
            onClick={() => navigate("/auth")}
          >
            <Login className="mr-2 h-4 w-4" /> Log In
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default MainSidebar;
