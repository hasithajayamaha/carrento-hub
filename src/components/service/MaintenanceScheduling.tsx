import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, CalendarIcon, Clock, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addDays, format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

// Form schema for scheduling maintenance
const maintenanceFormSchema = z.object({
  carId: z.string({
    required_error: "Please select a car",
  }),
  type: z.enum(["Regular", "Repair", "Inspection"], {
    required_error: "Please select the maintenance type",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  notes: z.string().optional(),
  estimatedCost: z.coerce.number().min(0, {
    message: "Cost must be a positive number",
  }),
  performedBy: z.string().optional(),
  nextServiceDate: z.date().optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];

const MaintenanceScheduling: React.FC = () => {
  const { profile } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      date: addDays(new Date(), 1),
      performedBy: profile?.id,
    }
  });
  
  // Fetch available cars
  const { data: cars = [], isLoading: loadingCars } = useQuery({
    queryKey: ['availableCars', searchQuery],
    queryFn: async () => {
      const query = supabase
        .from('cars')
        .select('id, make, model, year, color, status, owner_id, profiles!inner(full_name)')
        .or('status.eq.Available,status.eq.Maintenance');
      
      if (searchQuery) {
        query.or(`make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`)
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch service center staff
  const { data: staffMembers = [] } = useQuery({
    queryKey: ['serviceStaff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'ServiceCenterStaff');
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch upcoming maintenance appointments
  const { data: upcomingMaintenance = [], isLoading: loadingMaintenance } = useQuery({
    queryKey: ['upcomingMaintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select(`
          id, type, description, date, status, cost, notes, performed_by,
          cars(id, make, model, year, color),
          profiles(full_name)
        `)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Schedule maintenance mutation
  const scheduleMutation = useMutation({
    mutationFn: async (values: MaintenanceFormValues) => {
      // Combine date and time
      const dateTime = new Date(values.date);
      const [hours, minutes] = values.time.split(":");
      dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      
      const maintenanceData: any = {
        car_id: values.carId,
        type: values.type,
        description: values.description,
        date: dateTime.toISOString(),
        cost: values.estimatedCost,
        notes: values.notes,
        performed_by: values.performedBy || null,
        status: 'Scheduled'
      };
      
      // Add next service date if provided
      if (values.nextServiceDate) {
        maintenanceData.next_service_date = values.nextServiceDate.toISOString();
      }
      
      const { data, error } = await supabase
        .from('maintenance')
        .insert(maintenanceData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Maintenance scheduled successfully");
      queryClient.invalidateQueries({ queryKey: ['upcomingMaintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceStats'] });
      setShowDialog(false);
      reset();
    },
    onError: (error) => {
      toast.error(`Error scheduling maintenance: ${error.message}`);
    }
  });
  
  const onSubmit = (data: MaintenanceFormValues) => {
    scheduleMutation.mutate(data);
  };
  
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Schedule Service
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMaintenance ? (
            <div className="text-center py-8">Loading...</div>
          ) : upcomingMaintenance?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming maintenance scheduled
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingMaintenance?.map((maintenanceRecord) => (
                <div key={maintenanceRecord.id} className="flex p-4 border rounded-lg">
                  <div className="mr-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      maintenanceRecord.type === 'Regular' ? 'bg-blue-100 text-blue-600' :
                      maintenanceRecord.type === 'Repair' ? 'bg-red-100 text-red-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <span className="text-sm font-semibold">{maintenanceRecord.type.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {maintenanceRecord.cars?.make} {maintenanceRecord.cars?.model} ({maintenanceRecord.cars?.year})
                    </h4>
                    <p className="text-sm">{maintenanceRecord.description}</p>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>{formatDateTime(maintenanceRecord.date)}</span>
                      {maintenanceRecord.profiles && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Staff: {maintenanceRecord.profiles.full_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      maintenanceRecord.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      maintenanceRecord.status === 'InProgress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {maintenanceRecord.status}
                    </div>
                    <div className="text-sm font-medium mt-1">
                      ${maintenanceRecord.cost || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
            <DialogDescription>
              Schedule a new maintenance service for a vehicle.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="carId">Select Car</Label>
                <Controller
                  name="carId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a car" />
                      </SelectTrigger>
                      <SelectContent>
                        {cars?.map((car) => (
                          <SelectItem key={car.id} value={car.id}>
                            {car.make} {car.model} ({car.year}) - {car.profiles && car.profiles.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.carId && (
                  <p className="text-sm text-red-500">{errors.carId.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Maintenance Type</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Repair">Repair</SelectItem>
                        <SelectItem value="Inspection">Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe the maintenance to be performed"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Controller
                    name="time"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.time && (
                    <p className="text-sm text-red-500">{errors.time.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Next Service Date (Optional)</Label>
                <Controller
                  name="nextServiceDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Schedule next service (optional)</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date <= new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...register("estimatedCost")}
                />
                {errors.estimatedCost && (
                  <p className="text-sm text-red-500">{errors.estimatedCost.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="performedBy">Assign To</Label>
                <Controller
                  name="performedBy"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffMembers?.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes"
                  placeholder="Any additional notes"
                  {...register("notes")}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={scheduleMutation.isPending}>
                {scheduleMutation.isPending ? "Scheduling..." : "Schedule Maintenance"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceScheduling;
