
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Car } from "@/types/models";

interface CarDetailDialogProps {
  car: Car | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CarDetailDialog: React.FC<CarDetailDialogProps> = ({
  car,
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(Date.now() + 86400000) // Tomorrow
  );
  const [rentalType, setRentalType] = useState<"ShortTerm" | "LongTerm">("LongTerm");

  if (!car) return null;

  const isAvailable = car.status === "Available" || car.status === "New";

  const handleBookNow = () => {
    if (car && selectedDate) {
      // Pass the data to the booking page using navigation state
      navigate(`/booking/${car.id}`, {
        state: {
          rentalType,
          startDate: selectedDate.toISOString()
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {car.make} {car.model} <span className="text-lg font-normal text-muted-foreground">({car.year})</span>
            <Badge className={`ml-2 ${car.status === "Available" ? "bg-carrento-teal" : car.status === "New" ? "bg-carrento-blue" : ""}`}>
              {car.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {car.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
          <img 
            src={car.image} 
            alt={`${car.make} ${car.model}`} 
            className="w-full h-64 object-cover rounded-lg"
          />

          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="booking">Booking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{car.type}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-medium">{car.color}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm text-muted-foreground">Transmission</p>
                    <p className="font-medium">{car.specifications.transmission}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm text-muted-foreground">Fuel Type</p>
                    <p className="font-medium">{car.specifications.fuelType}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm text-muted-foreground">Seats</p>
                    <p className="font-medium">{car.specifications.seats}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm text-muted-foreground">Doors</p>
                    <p className="font-medium">{car.specifications.doors}</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {car.specifications.features.map((feature, index) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Availability</h3>
                <p>Available from {new Date(car.availability.startDate).toLocaleDateString()} to {new Date(car.availability.endDate).toLocaleDateString()}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="pricing">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-secondary/50">
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-2">Short-Term Rental</h3>
                      <p className="text-3xl font-bold mb-1">${car.pricing.shortTerm}<span className="text-base font-normal">/day</span></p>
                      <p className="text-sm text-muted-foreground mb-4">For rentals between 2 weeks and 3 months</p>
                      <ul className="space-y-2 text-sm">
                        <li>Minimum rental period: 2 weeks</li>
                        <li>$500 refundable deposit</li>
                        <li>Free self-pickup</li>
                        <li>Delivery available for an additional fee</li>
                        <li>Full maintenance included</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-carrento-blue bg-carrento-blue/5">
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-2">Long-Term Rental</h3>
                      <p className="text-3xl font-bold mb-1">${car.pricing.longTerm}<span className="text-base font-normal">/day</span></p>
                      <p className="text-sm text-muted-foreground mb-4">For rentals of 3 months or longer</p>
                      <ul className="space-y-2 text-sm">
                        <li>Minimum rental period: 3 months</li>
                        <li>$500 refundable deposit</li>
                        <li>Free self-pickup</li>
                        <li>Delivery available for an additional fee</li>
                        <li>Full maintenance included</li>
                        <li className="font-medium">Save ${(car.pricing.shortTerm - car.pricing.longTerm) * 30} per month compared to short-term</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Delivery Options</h3>
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="text-sm mb-2">Delivery fee is calculated based on distance and time of day:</p>
                    <ul className="space-y-1 text-sm">
                      <li>Self-pickup: Free</li>
                      <li>Within 10 miles, daytime (8 AM - 6 PM): $20</li>
                      <li>Within 10 miles, after-hours: $35</li>
                      <li>11-25 miles, daytime: $40</li>
                      <li>11-25 miles, after-hours: $60</li>
                      <li>Over 25 miles: Custom quote</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="booking">
              {isAvailable ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Select Rental Type</h3>
                    <RadioGroup 
                      value={rentalType} 
                      onValueChange={(value) => setRentalType(value as "ShortTerm" | "LongTerm")}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem 
                          value="ShortTerm" 
                          id="short-term" 
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="short-term"
                          className="flex flex-col p-4 border rounded-lg peer-data-[state=checked]:border-carrento-blue peer-data-[state=checked]:bg-carrento-blue/5 cursor-pointer h-full"
                        >
                          <span className="font-medium">Short-Term Rental</span>
                          <span className="text-2xl font-bold my-1">${car.pricing.shortTerm}/day</span>
                          <span className="text-sm text-muted-foreground">2 weeks to 3 months</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem 
                          value="LongTerm" 
                          id="long-term" 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor="long-term"
                          className="flex flex-col p-4 border rounded-lg peer-data-[state=checked]:border-carrento-blue peer-data-[state=checked]:bg-carrento-blue/5 cursor-pointer h-full"
                        >
                          <span className="font-medium">Long-Term Rental</span>
                          <span className="text-2xl font-bold my-1">${car.pricing.longTerm}/day</span>
                          <span className="text-sm text-muted-foreground">3+ months</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Select Start Date</h3>
                    <div className="border rounded-lg p-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          // Disable dates before tomorrow
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          tomorrow.setHours(0, 0, 0, 0);
                          
                          // Disable dates outside car availability
                          const startDate = new Date(car.availability.startDate);
                          const endDate = new Date(car.availability.endDate);
                          
                          return (
                            date < tomorrow ||
                            date < startDate ||
                            date > endDate
                          );
                        }}
                        initialFocus
                        className="mx-auto pointer-events-auto"
                      />
                    </div>
                  </div>

                  <div className="bg-secondary p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Rental Type:</span>
                        <span>{rentalType === "ShortTerm" ? "Short-Term" : "Long-Term"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily Rate:</span>
                        <span>${rentalType === "ShortTerm" ? car.pricing.shortTerm : car.pricing.longTerm}/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Start Date:</span>
                        <span>{selectedDate ? selectedDate.toLocaleDateString() : "Select a date"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Refundable Deposit:</span>
                        <span>$500</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <h3 className="text-lg font-medium mb-2">This car is currently not available for booking</h3>
                  <p className="text-muted-foreground">Please check back later or browse other available cars.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isAvailable && (
            <Button
              onClick={handleBookNow}
              disabled={!selectedDate}
              className="bg-carrento-blue hover:bg-carrento-blue/90"
            >
              Book Now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CarDetailDialog;
