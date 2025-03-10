
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import ServiceDashboard from "@/components/service/ServiceDashboard";
import MaintenanceScheduling from "@/components/service/MaintenanceScheduling";
import ServiceLogs from "@/components/service/ServiceLogs";
import InvoiceManagement from "@/components/service/InvoiceManagement";
import NotAuthorized from "@/components/admin/NotAuthorized";

const ServiceCenterPortal: React.FC = () => {
  const { profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Check if user has service center permissions
  const isServiceStaff = profile?.role === "ServiceCenterStaff";
  const isAdmin = profile?.role === "Admin" || profile?.role === "SuperAdmin";
  
  // Allow access to service staff and admin staff
  const hasAccess = isServiceStaff || isAdmin;
  
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
        <h1 className="text-3xl font-bold mb-6">Service Center Portal</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="scheduling">Maintenance Scheduling</TabsTrigger>
            <TabsTrigger value="logs">Service Logs</TabsTrigger>
            <TabsTrigger value="invoices">Invoice Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="w-full">
            <ServiceDashboard />
          </TabsContent>
          
          <TabsContent value="scheduling" className="w-full">
            <MaintenanceScheduling />
          </TabsContent>
          
          <TabsContent value="logs" className="w-full">
            <ServiceLogs />
          </TabsContent>
          
          <TabsContent value="invoices" className="w-full">
            <InvoiceManagement />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ServiceCenterPortal;
