
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getCarById } from "@/integrations/supabase/client";
import { Car, CarType, CarStatus } from "@/types/models";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import BookingForm from "@/components/booking/BookingForm";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Json } from "@/integrations/supabase/types";

const BookingPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState<Car | null>(null);
  
  // Get rental type and start date from location state or use defaults
  const rentalType = location.state?.rentalType || "LongTerm";
  const startDate = location.state?.startDate ? new Date(location.state.startDate) : new Date();

  useEffect(() => {
    const fetchCar = async () => {
      if (!carId) {
        toast({
          title: "Error",
          description: "No car selected for booking",
          variant: "destructive"
        });
        navigate("/cars");
        return;
      }
      
      try {
        const { data, error } = await getCarById(carId);
        
        if (error || !data) {
          toast({
            title: "Error",
            description: "Failed to load car details",
            variant: "destructive"
          });
          navigate("/cars");
          return;
        }

        // Helper function to safely access JSON properties
        const getJsonValue = <T,>(jsonObj: Json | null | undefined, key: string, defaultValue: T): T => {
          if (!jsonObj || typeof jsonObj !== 'object' || Array.isArray(jsonObj)) {
            return defaultValue;
          }
          
          const value = jsonObj[key];
          return (value !== undefined && value !== null) ? value as unknown as T : defaultValue;
        };
        
        // Convert the data to Car type with proper type assertions and null checks
        const carData: Car = {
          id: data.id,
          make: data.make,
          model: data.model,
          year: data.year,
          type: data.type as CarType, // Cast to CarType enum
          color: data.color,
          image: Array.isArray(data.photos) && data.photos.length > 0 ? data.photos[0] : "",
          description: data.description || "",
          status: data.status as CarStatus, // Cast to CarStatus enum
          ownerId: data.owner_id,
          pricing: {
            shortTerm: getJsonValue(data.pricing, 'shortTerm', 0),
            longTerm: getJsonValue(data.pricing, 'longTerm', 0)
          },
          specifications: {
            seats: getJsonValue(data.specifications, 'seats', 0),
            doors: getJsonValue(data.specifications, 'doors', 0),
            transmission: getJsonValue(data.specifications, 'transmission', "Automatic") as "Automatic" | "Manual",
            fuelType: getJsonValue(data.specifications, 'fuelType', "Gasoline") as "Gasoline" | "Diesel" | "Electric" | "Hybrid",
            fuelEfficiency: getJsonValue(data.specifications, 'fuelEfficiency', ""),
            features: getJsonValue(data.specifications, 'features', [])
          },
          availability: {
            startDate: getJsonValue(data.availability, 'startDate', ""),
            endDate: getJsonValue(data.availability, 'endDate', "")
          }
        };
        
        setCar(carData);
      } catch (error) {
        console.error("Error fetching car:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
        navigate("/cars");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCar();
  }, [carId, navigate, toast]);

  const handleBookingSuccess = () => {
    toast({
      title: "Booking Created",
      description: "Your booking has been successfully created. You will be notified when it's approved."
    });
    navigate("/customer/dashboard");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Complete Your Booking</h1>
        <p className="text-muted-foreground">
          Provide the details below to complete your car rental booking
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : car ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BookingForm
              car={car}
              rentalType={rentalType as "ShortTerm" | "LongTerm"}
              startDate={startDate}
              onSuccess={handleBookingSuccess}
              onCancel={handleCancel}
            />
          </div>
          
          <div>
            <div className="sticky top-6 space-y-6">
              <div className="bg-secondary/30 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Selected Vehicle</h3>
                <div className="aspect-video overflow-hidden rounded-md mb-3">
                  <img
                    src={car.image}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-medium text-lg">{car.make} {car.model}</h4>
                <p className="text-muted-foreground">{car.year} • {car.type}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Color:</span>
                    <span className="ml-1">{car.color}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seats:</span>
                    <span className="ml-1">{car.specifications.seats}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Transmission:</span>
                    <span className="ml-1">{car.specifications.transmission}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fuel:</span>
                    <span className="ml-1">{car.specifications.fuelType}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary/30 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  If you have questions about the booking process or need assistance, our support team is here to help.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">Car Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The car you're looking for doesn't exist or is no longer available.
          </p>
          <Button onClick={() => navigate("/cars")}>
            Browse Available Cars
          </Button>
        </div>
      )}
    </MainLayout>
  );
};

export default BookingPage;
