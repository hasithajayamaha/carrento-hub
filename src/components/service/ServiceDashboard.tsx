
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  WrenchIcon, 
  CheckCircle, 
  Clock, 
  BadgeDollarSign, 
  FileText 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';

const ServiceDashboard: React.FC = () => {
  // Fetch maintenance stats
  const { data: maintenanceStats, isLoading } = useQuery({
    queryKey: ['maintenanceStats'],
    queryFn: async () => {
      const scheduled = await supabase
        .from('maintenance')
        .select('id')
        .eq('status', 'Scheduled')
        .count();
      
      const inProgress = await supabase
        .from('maintenance')
        .select('id')
        .eq('status', 'InProgress')
        .count();
      
      const completed = await supabase
        .from('maintenance')
        .select('id')
        .eq('status', 'Completed')
        .count();
      
      const totalRevenue = await supabase
        .from('maintenance')
        .select('cost')
        .eq('status', 'Completed');
        
      const revenue = totalRevenue.data?.reduce(
        (sum, item) => sum + (item.cost || 0), 0
      ) || 0;
      
      // Get today's appointments
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayAppointments = await supabase
        .from('maintenance')
        .select('*, cars(make, model, year), profiles!maintenance_performed_by_fkey(full_name)')
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString())
        .order('date', { ascending: true });
      
      return {
        scheduled: scheduled.count || 0,
        inProgress: inProgress.count || 0,
        completed: completed.count || 0,
        revenue,
        todayAppointments: todayAppointments.data || []
      };
    }
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">{maintenanceStats?.scheduled}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pending appointments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <WrenchIcon className="h-5 w-5 text-yellow-500 mr-2" />
              <div className="text-2xl font-bold">{maintenanceStats?.inProgress}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ongoing services</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-2xl font-bold">{maintenanceStats?.completed}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Finished services</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BadgeDollarSign className="h-5 w-5 text-green-700 mr-2" />
              <div className="text-2xl font-bold">${maintenanceStats?.revenue.toLocaleString()}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total from completed services</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {maintenanceStats?.todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No appointments scheduled for today
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceStats?.todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center p-3 border rounded-lg">
                  <div className="mr-4">
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {appointment.cars?.make} {appointment.cars?.model} ({appointment.cars?.year})
                    </h4>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{appointment.type}</span>
                      <span>•</span>
                      <span>{format(new Date(appointment.date), 'h:mm a')}</span>
                      {appointment.profiles?.full_name && (
                        <>
                          <span>•</span>
                          <span>Assigned to: {appointment.profiles.full_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'InProgress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {appointment.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceDashboard;
