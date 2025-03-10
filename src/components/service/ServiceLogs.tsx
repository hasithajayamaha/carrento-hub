
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
import { Search, Plus, FileText, Upload, X, Image } from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema for service log
const serviceLogSchema = z.object({
  maintenanceId: z.string({
    required_error: "Please select a maintenance record",
  }),
  status: z.enum(["InProgress", "Completed"], {
    required_error: "Please select the status",
  }),
  actualCost: z.coerce.number().min(0, {
    message: "Cost must be a positive number",
  }),
  notes: z.string().min(5, {
    message: "Notes must be at least 5 characters",
  }),
  photos: z.array(z.any()).optional(),
  nextServiceDate: z.date().optional(),
});

type ServiceLogValues = z.infer<typeof serviceLogSchema>;

const ServiceLogs: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "InProgress" | "Completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ServiceLogValues>({
    resolver: zodResolver(serviceLogSchema),
    defaultValues: {
      status: "InProgress",
      photos: [],
    }
  });
  
  // Fetch scheduled maintenance that needs to be logged
  const { data: scheduledMaintenance } = useQuery({
    queryKey: ['scheduledMaintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select(`
          id, type, description, date, status, cost,
          cars(id, make, model, year)
        `)
        .in('status', ['Scheduled', 'InProgress'])
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch maintenance logs
  const { data: maintenanceLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['maintenanceLogs', activeFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('maintenance')
        .select(`
          id, type, description, date, status, cost, notes, performed_by, photos, next_service_date,
          cars(id, make, model, year, color),
          profiles(full_name)
        `)
        .not('status', 'eq', 'Scheduled')
        .order('date', { ascending: false });
      
      if (activeFilter !== "all") {
        query = query.eq('status', activeFilter);
      }
      
      if (searchQuery) {
        query = query.or(`description.ilike.%${searchQuery}%,cars.make.ilike.%${searchQuery}%,cars.model.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Update maintenance log mutation
  const updateLogMutation = useMutation({
    mutationFn: async (values: ServiceLogValues) => {
      // Upload photos if any
      let photoUrls: string[] = [];
      
      if (uploadedPhotos.length > 0) {
        const timestamp = Date.now();
        for (const photo of uploadedPhotos) {
          const fileName = `${timestamp}-${photo.name}`;
          const { data, error } = await supabase.storage
            .from('maintenance-photos')
            .upload(fileName, photo);
          
          if (error) throw error;
          
          const { data: { publicUrl } } = supabase.storage
            .from('maintenance-photos')
            .getPublicUrl(fileName);
            
          photoUrls.push(publicUrl);
        }
      }
      
      // Update maintenance record
      const { data, error } = await supabase
        .from('maintenance')
        .update({
          status: values.status,
          cost: values.actualCost,
          notes: values.notes,
          photos: photoUrls,
          next_service_date: values.nextServiceDate ? values.nextServiceDate.toISOString() : null
        })
        .eq('id', values.maintenanceId)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Service log updated successfully");
      queryClient.invalidateQueries({ queryKey: ['maintenanceLogs'] });
      queryClient.invalidateQueries({ queryKey: ['scheduledMaintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceStats'] });
      setShowDialog(false);
      setUploadedPhotos([]);
      reset();
    },
    onError: (error) => {
      toast.error(`Error updating service log: ${error.message}`);
    }
  });
  
  const onSubmit = (data: ServiceLogValues) => {
    updateLogMutation.mutate(data);
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedPhotos(prev => [...prev, ...filesArray]);
    }
  };
  
  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "MMM d, yyyy");
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-auto" onValueChange={(value) => setActiveFilter(value as any)}>
          <TabsList>
            <TabsTrigger value="all">All Logs</TabsTrigger>
            <TabsTrigger value="InProgress">In Progress</TabsTrigger>
            <TabsTrigger value="Completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Update Service Log
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="text-center py-8">Loading...</div>
          ) : maintenanceLogs?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No maintenance logs found
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceLogs?.map((log) => (
                <div key={log.id} className="p-4 border rounded-lg">
                  <div className="flex items-start">
                    <div className="mr-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        log.type === 'Regular' ? 'bg-blue-100 text-blue-600' :
                        log.type === 'Repair' ? 'bg-red-100 text-red-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <span className="text-sm font-semibold">{log.type.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {log.cars?.make} {log.cars?.model} ({log.cars?.year})
                        </h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'InProgress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {log.status}
                        </div>
                      </div>
                      <p className="text-sm">{log.description}</p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span>Service date: {formatDate(log.date)}</span>
                        {log.profiles?.full_name && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Technician: {log.profiles.full_name}</span>
                          </>
                        )}
                        {log.next_service_date && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Next service: {formatDate(log.next_service_date)}</span>
                          </>
                        )}
                      </div>
                      {log.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <p className="font-medium text-xs mb-1">Notes:</p>
                          <p>{log.notes}</p>
                        </div>
                      )}
                      
                      {log.photos && log.photos.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-xs mb-1">Photos:</p>
                          <div className="flex flex-wrap gap-2">
                            {(log.photos as string[]).map((photo, index) => (
                              <a 
                                key={index} 
                                href={photo} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block w-16 h-16 relative"
                              >
                                <img 
                                  src={photo} 
                                  alt={`Maintenance photo ${index + 1}`} 
                                  className="w-full h-full object-cover rounded border"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-lg font-medium">${log.cost || 0}</div>
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
            <DialogTitle>Update Service Log</DialogTitle>
            <DialogDescription>
              Update maintenance details and add service logs.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="maintenanceId">Select Maintenance</Label>
                <Controller
                  name="maintenanceId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select maintenance record" />
                      </SelectTrigger>
                      <SelectContent>
                        {scheduledMaintenance?.map((record) => (
                          <SelectItem key={record.id} value={record.id}>
                            {record.cars?.make} {record.cars?.model} - {record.type} ({formatDate(record.date)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.maintenanceId && (
                  <p className="text-sm text-red-500">{errors.maintenanceId.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="InProgress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="actualCost">Actual Cost ($)</Label>
                <Input
                  id="actualCost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...register("actualCost")}
                />
                {errors.actualCost && (
                  <p className="text-sm text-red-500">{errors.actualCost.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Service Notes</Label>
                <Textarea 
                  id="notes"
                  placeholder="Describe the work performed and any findings"
                  {...register("notes")}
                />
                {errors.notes && (
                  <p className="text-sm text-red-500">{errors.notes.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Service Photos</Label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative h-20 border rounded overflow-hidden group">
                      <img 
                        src={URL.createObjectURL(photo)} 
                        alt={`Upload ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-6 w-6 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">Upload photos of the service work</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG or JPEG</p>
                    </div>
                    <Input
                      id="photos"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
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
                          {field.value ? (
                            format(field.value, "MMM d, yyyy")
                          ) : (
                            <span className="text-muted-foreground">Schedule next service</span>
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
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateLogMutation.isPending}>
                {updateLogMutation.isPending ? "Updating..." : "Update Service Log"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceLogs;
