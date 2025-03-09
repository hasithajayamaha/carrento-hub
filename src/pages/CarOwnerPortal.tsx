
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import OwnerDashboard from "@/components/owner/OwnerDashboard";
import CarListingForm from "@/components/owner/CarListingForm";
import RentalHistory from "@/components/owner/RentalHistory";
import MaintenanceTracker from "@/components/owner/MaintenanceTracker";
import Agreements from "@/components/owner/Agreements";

const CarOwnerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Car Owner Portal</h1>
          <p className="text-muted-foreground">
            Manage your vehicles, track rentals, and monitor maintenance
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full sm:w-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="cars">My Cars</TabsTrigger>
            <TabsTrigger value="rentals">Rental History</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <OwnerDashboard />
          </TabsContent>
          
          <TabsContent value="cars" className="space-y-4">
            <CarListingForm />
          </TabsContent>
          
          <TabsContent value="rentals" className="space-y-4">
            <RentalHistory />
          </TabsContent>
          
          <TabsContent value="maintenance" className="space-y-4">
            <MaintenanceTracker />
          </TabsContent>
          
          <TabsContent value="agreements" className="space-y-4">
            <Agreements />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CarOwnerPortal;
