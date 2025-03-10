
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
import { 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  ClipboardList, 
  Filter, 
  Plus,
  Image
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

// Form schema for logging service
const serviceLogFormSchema = z.object({
  carId: z.string({
    required_error: "Please select a car",
  }),
  type: z.enum(["Regular", "Repair", "Inspection"], {
    required_error: "Please select the service type",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters",
  }),
  cost: z.coerce.number().min(0, {
    message: "Cost must be a positive number",
  }),
  nextServiceDate: z.date().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

type ServiceLogFormValues = z.infer<typeof serviceLogFormSchema>;

const ServiceLogs: React.FC = () => {
  const { profile } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [serviceTab, setServiceTab] = useState("all");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<ServiceLogFormValues>({
    resolver: zodResolver(serviceLogFormSchema),
    defaultValues: {
      photos: [],
    }
  });
  
  // Fetch cars
  const { data: cars = [] } = useQuery({
    queryKey: ['serviceCars', searchQuery],
    queryFn: async () => {
      const query = supabase
        .from('cars')
        .select('id, make, model, year, status, owner_id, profiles!inner(full_name)');
      
      if (searchQuery) {
        query.or(`make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,profiles.full_name.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch service logs with filter
  const { data: serviceLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['serviceLogs', filterType, serviceTab, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('maintenance')
        .select(`
          id, type, description, date, status, cost, notes, performed_by, photos, next_service_date,
          cars(id, make, model, year, color),
          profiles(full_name)
        `)
        .order('date', { ascending: false });
      
      if (filterType) {
        query = query.eq('type', filterType);
      }
      
      if (serviceTab === 'completed') {
        query = query.eq('status', 'Completed');
      } else if (serviceTab === 'scheduled') {
        query = query.eq('status', 'Scheduled');
      } else if (serviceTab === 'inProgress') {
        query = query.eq('status', 'InProgress');
      }
      
      if (searchQuery) {
        query = query.or(`description.ilike.%${searchQuery}%,cars.make.ilike.%${searchQuery}%,cars.model.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Log service mutation using edge function
  const logServiceMutation = useMutation({
    mutationFn: async (values: ServiceLogFormValues) => {
      const serviceData = {
        carId: values.carId,
        type: values.type,
        description: values.description,
        cost: values.cost,
        notes: values.notes || "",
        photos: values.photos || [],
        performedBy: profile?.id
      };
      
      // Call the edge function to log service
      const { data, error } = await supabase.functions.invoke('service-logging', {
        method: 'POST',
        body: serviceData
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Service logged successfully");
      queryClient.invalidateQueries({ queryKey: ['serviceLogs'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceStats'] });
      setShowDialog(false);
      setUploadedPhotos([]);
      reset();
    },
    onError: (error) => {
      toast.error(`Error logging service: ${error.message}`);
    }
  });
  
  // Handle photo upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileArr = Array.from(files);
    const urls: string[] = [];
    
    try {
      for (const file of fileArr) {
        // Generate a unique file name
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('service-photos')
          .upload(fileName, file);
        
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('service-photos')
          .getPublicUrl(fileName);
        
        urls.push(urlData.publicUrl);
      }
      
      setUploadedPhotos(prev => [...prev, ...urls]);
      setValue('photos', [...uploadedPhotos, ...urls]);
      toast.success(`${urls.length} photo(s) uploaded`);
    } catch (error: any) {
      toast.error(`Error uploading photos: ${error.message}`);
    }
  };
  
  // Remove uploaded photo
  const removePhoto = (index: number) => {
    const newPhotos = [...uploadedPhotos];
    newPhotos.splice(index, 1);
    setUploadedPhotos(newPhotos);
    setValue('photos', newPhotos);
  };
  
  const onSubmit = (data: ServiceLogFormValues) => {
    logServiceMutation.mutate(data);
  };
  
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search service logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={filterType || ""} onValueChange={(value) => setFilterType(value || null)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="Repair">Repair</SelectItem>
              <SelectItem value="Inspection">Inspection</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Log Service
        </Button>
      </div>
      
      <Tabs value={serviceTab} onValueChange={setServiceTab}>
        <TabsList>
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value={serviceTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="text-center py-8">Loading...</div>
              ) : serviceLogs?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No service logs found
                </div>
              ) : (
                <div className="space-y-6">
                  {serviceLogs?.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-full ${
                            log.type === 'Regular' ? 'bg-blue-100 text-blue-600' :
                            log.type === 'Repair' ? 'bg-red-100 text-red-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            <ClipboardList className="h-5 w-5" />
                          </div>
                          
                          <div>
                            <h4 className="font-medium">
                              {log.cars?.make} {log.cars?.model} ({log.cars?.year})
                            </h4>
                            
                            <Badge variant={
                              log.status === 'Completed' ? 'success' :
                              log.status === 'InProgress' ? 'warning' :
                              'default'
                            }>
                              {log.status}
                            </Badge>
                            
                            <p className="mt-2 text-sm">{log.description}</p>
                            
                            <div className="flex items-center mt-1 text-xs text-muted-foreground">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              <span>Service date: {formatDateTime(log.date)}</span>
                              {log.profiles?.full_name && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Performed by: {log.profiles.full_name}</span>
                                </>
                              )}
                            </div>
                            
                            {log.next_service_date && (
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                <span>Next service: {formatDateTime(log.next_service_date)}</span>
                              </div>
                            )}
                            
                            {log.notes && (
                              <div className="mt-2">
                                <h5 className="text-xs font-medium">Notes:</h5>
                                <p className="text-xs text-muted-foreground">{log.notes}</p>
                              </div>
                            )}
                            
                            {log.photos && log.photos.length > 0 && (
                              <div className="mt-2">
                                <h5 className="text-xs font-medium">Photos:</h5>
                                <div className="flex mt-1 gap-2 overflow-x-auto pb-2">
                                  {(log.photos as string[]).map((photo, index) => (
                                    <a 
                                      key={index} 
                                      href={photo} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-block"
                                    >
                                      <img 
                                        src={photo} 
                                        alt={`Service photo ${index + 1}`} 
                                        className="h-16 w-16 object-cover rounded border" 
                                      />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-medium">${log.cost || 0}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Log Service</DialogTitle>
            <DialogDescription>
              Record a completed service for a vehicle.
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
                            {car.make} {car.model} ({car.year}) - {car.profiles?.full_name}
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
                <Label htmlFor="type">Service Type</Label>
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
                  placeholder="Describe the service performed"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...register("cost")}
                />
                {errors.cost && (
                  <p className="text-sm text-red-500">{errors.cost.message}</p>
                )}
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
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes"
                  placeholder="Any additional notes"
                  {...register("notes")}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Service Photos (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="photo-upload" 
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    <Image className="h-4 w-4" />
                    <span>Upload Photos</span>
                  </Label>
                  <Input 
                    id="photo-upload" 
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                
                {uploadedPhotos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {uploadedPhotos.map((url, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={url} 
                          alt={`Uploaded ${index + 1}`} 
                          className="h-20 w-20 object-cover rounded border" 
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                          onClick={() => removePhoto(index)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={logServiceMutation.isPending}>
                {logServiceMutation.isPending ? "Logging..." : "Log Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceLogs;
