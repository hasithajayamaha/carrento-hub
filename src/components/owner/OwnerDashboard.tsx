
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, DollarSign, Calendar, Bell, Wrench } from "lucide-react";

const OwnerDashboard: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">Cars currently rented</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Maintenance</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2</div>
          <p className="text-xs text-muted-foreground">Vehicles needing service</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$3,240</div>
          <p className="text-xs text-muted-foreground">+2.5% from last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">Unread notifications</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Overview of your recent car rental activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center p-3 border rounded">
              <div className="mr-4 bg-primary/10 p-2 rounded">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Honda Civic booked</p>
                <p className="text-sm text-muted-foreground">New booking from June 15 to July 20</p>
              </div>
              <div className="text-sm text-muted-foreground">
                2 hours ago
              </div>
            </div>
            <div className="flex items-center p-3 border rounded">
              <div className="mr-4 bg-primary/10 p-2 rounded">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Maintenance completed</p>
                <p className="text-sm text-muted-foreground">Toyota Camry regular service completed</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Yesterday
              </div>
            </div>
            <div className="flex items-center p-3 border rounded">
              <div className="mr-4 bg-primary/10 p-2 rounded">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Payment received</p>
                <p className="text-sm text-muted-foreground">Monthly rental payment for Ford Explorer</p>
              </div>
              <div className="text-sm text-muted-foreground">
                3 days ago
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDashboard;
