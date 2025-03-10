
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Car, Calendar, Users, Clock } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  
  const stats = [
    {
      title: "Pending Approvals",
      value: "12",
      change: "+2 from yesterday",
      icon: <Car className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: "Active Bookings",
      value: "48",
      change: "+5 from last week",
      icon: <Calendar className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: "Registered Users",
      value: "2,345",
      change: "+12% this month",
      icon: <Users className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: "Average Rental Duration",
      value: "64 days",
      change: "+3 days from last month",
      icon: <Clock className="h-5 w-5 text-muted-foreground" />
    }
  ];
  
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {profile?.full_name || 'Admin'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You are logged in as <span className="font-medium">{profile?.role}</span>. 
              Use the tabs above to manage car listings, bookings, and rental checklists.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">New car listing submitted for approval</span>
                <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm">Booking #1234 approved</span>
                <span className="text-xs text-muted-foreground ml-auto">15m ago</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-sm">Pre-rental checklist completed</span>
                <span className="text-xs text-muted-foreground ml-auto">1h ago</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm">Maintenance scheduled for BMW X5</span>
                <span className="text-xs text-muted-foreground ml-auto">3h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
