
import React from "react";
import { Heart, Info } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Car } from "@/types/models";

interface CarCardProps {
  car: Car;
  onViewDetails: (car: Car) => void;
  onToggleFavorite: (carId: string) => void;
  isFavorite: boolean;
}

const CarCard: React.FC<CarCardProps> = ({ car, onViewDetails, onToggleFavorite, isFavorite }) => {
  const getStatusBadge = () => {
    switch (car.status) {
      case "Available":
        return <Badge className="bg-carrento-teal">Available</Badge>;
      case "Booked":
        return <Badge variant="secondary">Booked</Badge>;
      case "Maintenance":
        return <Badge variant="destructive">Maintenance</Badge>;
      case "New":
        return <Badge className="bg-carrento-blue">New</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="car-card overflow-hidden">
      <div className="relative">
        <img 
          src={car.image} 
          alt={`${car.make} ${car.model}`} 
          className="h-48 w-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={() => onToggleFavorite(car.id)}
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"}`} 
            />
          </Button>
        </div>
        <div className="absolute top-2 left-2">
          {getStatusBadge()}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{car.make} {car.model}</h3>
            <p className="text-sm text-muted-foreground">{car.year} • {car.type}</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{car.specifications.seats} seats • {car.specifications.transmission} • {car.specifications.fuelType}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="grid grid-cols-2 gap-2 my-4">
          <div className="bg-secondary p-2 rounded-lg">
            <p className="text-xs text-muted-foreground">Short-Term</p>
            <p className="font-semibold">${car.pricing.shortTerm}<span className="text-xs font-normal">/day</span></p>
          </div>
          <div className="bg-secondary p-2 rounded-lg">
            <p className="text-xs text-muted-foreground">Long-Term</p>
            <p className="font-semibold">${car.pricing.longTerm}<span className="text-xs font-normal">/day</span></p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => onViewDetails(car)}
          className="w-full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarCard;
