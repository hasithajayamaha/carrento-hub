
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import CarApprovalList from "@/components/admin/CarApprovalList";
import BookingManagement from "@/components/admin/BookingManagement";
import RentalChecklists from "@/components/admin/RentalChecklists";
import UserManagement from "@/components/admin/UserManagement";
import AdminDashboard from "@/components/admin/AdminDashboard";
import NotAuthorized from "@/components/admin/NotAuthorized";

const AdminPortal: React.FC = () => {
  const { profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Check if user has admin permissions
  const isAdmin = profile?.role === "Admin" || profile?.role === "SuperAdmin";
  const isSupportStaff = profile?.role === "SupportStaff";
  const isServiceCenterStaff = profile?.role === "ServiceCenterStaff";
  
  // Allow access to admin, support staff, and service center staff
  const hasAccess = isAdmin || isSupportStaff || isServiceCenterStaff;
  
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!hasAccess) {
    return <NotAuthorized />;
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Admin Portal</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            {(isAdmin) && <TabsTrigger value="cars">Car Listings</TabsTrigger>}
            {(isAdmin || isSupportStaff) && <TabsTrigger value="bookings">Bookings</TabsTrigger>}
            {(isAdmin || isSupportStaff) && <TabsTrigger value="checklists">Checklists</TabsTrigger>}
            {profile?.role === "SuperAdmin" && (
              <TabsTrigger value="users">User Management</TabsTrigger>
            )}
            {(isAdmin || isServiceCenterStaff) && (
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="dashboard" className="w-full">
            <AdminDashboard />
          </TabsContent>
          
          {(isAdmin) && (
            <TabsContent value="cars" className="w-full">
              <CarApprovalList />
            </TabsContent>
          )}
          
          {(isAdmin || isSupportStaff) && (
            <TabsContent value="bookings" className="w-full">
              <BookingManagement />
            </TabsContent>
          )}
          
          {(isAdmin || isSupportStaff) && (
            <TabsContent value="checklists" className="w-full">
              <RentalChecklists />
            </TabsContent>
          )}
          
          {profile?.role === "SuperAdmin" && (
            <TabsContent value="users" className="w-full">
              <UserManagement />
            </TabsContent>
          )}
          
          {(isAdmin || isServiceCenterStaff) && (
            <TabsContent value="maintenance" className="w-full">
              <div className="text-center py-10">
                <h2 className="text-xl font-medium mb-2">Maintenance Management</h2>
                <p className="text-muted-foreground">
                  Maintenance management feature coming soon.
                </p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminPortal;
