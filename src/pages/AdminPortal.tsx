
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
  
  // Only allow access to admin or support staff
  const hasAccess = isAdmin || isSupportStaff;
  
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
            <TabsTrigger value="cars">Car Listings</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="checklists">Checklists</TabsTrigger>
            {profile?.role === "SuperAdmin" && (
              <TabsTrigger value="users">User Management</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="dashboard" className="w-full">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="cars" className="w-full">
            <CarApprovalList />
          </TabsContent>
          
          <TabsContent value="bookings" className="w-full">
            <BookingManagement />
          </TabsContent>
          
          <TabsContent value="checklists" className="w-full">
            <RentalChecklists />
          </TabsContent>
          
          {profile?.role === "SuperAdmin" && (
            <TabsContent value="users" className="w-full">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminPortal;
