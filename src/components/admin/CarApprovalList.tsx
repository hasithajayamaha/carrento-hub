
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CarType, CarStatus } from "@/types/models";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Check, X, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CarListingItem {
  id: string;
  make: string;
  model: string;
  year: number;
  type: CarType;
  owner_id: string;
  owner_name: string;
  status: CarStatus;
  photos: string[];
  created_at: string;
}

const CarApprovalList: React.FC = () => {
  const [cars, setCars] = useState<CarListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();
  
  // Check if user has approval permissions
  const canApprove = profile?.role === "Admin" || profile?.role === "SuperAdmin";
  
  useEffect(() => {
    const fetchCars = async () => {
      try {
        // Get all cars with 'New' status
        const { data, error } = await supabase
          .from("cars")
          .select(`
            id, 
            make, 
            model, 
            year, 
            type, 
            status, 
            photos,
            created_at, 
            owner_id,
            profiles:owner_id (full_name)
          `)
          .eq("status", "New")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        // Transform data for display
        const carsWithOwners = data.map(car => ({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          type: car.type as CarType,
          owner_id: car.owner_id,
          owner_name: car.profiles?.full_name || "Unknown Owner",
          status: car.status as CarStatus,
          photos: car.photos,
          created_at: car.created_at
        }));
        
        setCars(carsWithOwners);
      } catch (error) {
        console.error("Error fetching cars:", error);
        toast({
          title: "Error",
          description: "Failed to load car listings",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCars();
  }, [toast]);
  
  const approveCar = async (carId: string) => {
    setProcessingId(carId);
    try {
      const { error } = await supabase
        .from("cars")
        .update({ status: "Available" })
        .eq("id", carId);
        
      if (error) throw error;
      
      // Update local state
      setCars(cars.filter(car => car.id !== carId));
      
      toast({
        title: "Car Approved",
        description: "The car listing has been approved and is now available for rent",
      });
    } catch (error) {
      console.error("Error approving car:", error);
      toast({
        title: "Error",
        description: "Failed to approve car listing",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const rejectCar = async (carId: string) => {
    setProcessingId(carId);
    try {
      // In a real app, you might want to add a "Rejected" status
      // and a reason for rejection
      const { error } = await supabase
        .from("cars")
        .update({ status: "Rejected" })
        .eq("id", carId);
        
      if (error) throw error;
      
      // Update local state
      setCars(cars.filter(car => car.id !== carId));
      
      toast({
        title: "Car Rejected",
        description: "The car listing has been rejected",
      });
    } catch (error) {
      console.error("Error rejecting car:", error);
      toast({
        title: "Error",
        description: "Failed to reject car listing",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (cars.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">No Pending Approvals</h2>
        <p className="text-muted-foreground">
          There are currently no car listings waiting for approval.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Car Listings Awaiting Approval</h2>
        <Badge variant="outline">{cars.length} Pending</Badge>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Card key={car.id} className="overflow-hidden">
            <div className="aspect-video overflow-hidden">
              <img
                src={car.photos[0] || "/placeholder.svg"}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>
                {car.year} {car.make} {car.model}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type:</span>
                <span>{car.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Owner:</span>
                <span>{car.owner_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Submitted:</span>
                <span>{new Date(car.created_at).toLocaleDateString()}</span>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-2">
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>
                      {car.year} {car.make} {car.model}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="aspect-video overflow-hidden rounded-md">
                        <img
                          src={car.photos[0] || "/placeholder.svg"}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {car.photos.length > 1 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {car.photos.slice(1, 4).map((photo, i) => (
                            <div key={i} className="aspect-square overflow-hidden rounded-md">
                              <img
                                src={photo}
                                alt={`${car.make} ${car.model} photo ${i+2}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Car Details</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Make:</span>
                            <p>{car.make}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Model:</span>
                            <p>{car.model}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Year:</span>
                            <p>{car.year}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <p>{car.type}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Owner Information</h3>
                        <p className="text-sm mt-1">{car.owner_name}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Submission Date</h3>
                        <p className="text-sm mt-1">
                          {new Date(car.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      {canApprove && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            onClick={() => approveCar(car.id)}
                            className="flex-1"
                            disabled={processingId === car.id}
                          >
                            <Check className="mr-2 h-4 w-4" /> Approve
                          </Button>
                          <Button 
                            onClick={() => rejectCar(car.id)} 
                            variant="destructive"
                            className="flex-1"
                            disabled={processingId === car.id}
                          >
                            <X className="mr-2 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
            
            {canApprove && (
              <CardFooter className="flex gap-2">
                <Button 
                  onClick={() => approveCar(car.id)} 
                  className="flex-1"
                  disabled={processingId === car.id}
                >
                  {processingId === car.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Approve
                </Button>
                <Button 
                  onClick={() => rejectCar(car.id)} 
                  variant="outline"
                  className="flex-1"
                  disabled={processingId === car.id}
                >
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CarApprovalList;
