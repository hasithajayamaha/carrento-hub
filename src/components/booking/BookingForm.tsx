
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, DeliveryOption } from "@/types/models";
import { createBooking, calculateDeliveryFee } from "@/integrations/supabase/booking";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, addMonths, differenceInDays } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface BookingFormProps {
  car: Car;
  rentalType: "ShortTerm" | "LongTerm";
  startDate: Date;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  car,
  rentalType,
  startDate,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("SelfPickup");
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: ""
  });
  const [deliveryDate, setDeliveryDate] = useState<Date>(startDate);
  const [deliveryTime, setDeliveryTime] = useState("12:00");
  const [endDate, setEndDate] = useState<Date>(() => {
    if (rentalType === "ShortTerm") {
      return addDays(startDate, 14); // Minimum 2 weeks for short-term
    } else {
      return addMonths(startDate, 3); // Minimum 3 months for long-term
    }
  });
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");

  // Fixed deposit amount
  const DEPOSIT_AMOUNT = 500;

  // Calculate rental duration and price when dates change
  useEffect(() => {
    const calculatePrice = async () => {
      const days = differenceInDays(endDate, startDate) + 1; // inclusive of start and end date
      const dailyRate = rentalType === "ShortTerm" ? car.pricing.shortTerm : car.pricing.longTerm;
      const rentalPrice = days * dailyRate;
      
      // Calculate delivery fee if delivery is selected
      let fee = 0;
      if (deliveryOption === "Delivery") {
        try {
          // In a real app, we would use the actual addresses for calculation
          // For this demo, we'll use a simplified calculation
          const withinBusinessHours = () => {
            const hour = parseInt(deliveryTime.split(":")[0]);
            return hour >= 8 && hour < 18;
          };
          
          fee = withinBusinessHours() ? 20 : 35; // Basic fee based on time of day
        } catch (error) {
          console.error("Error calculating delivery fee:", error);
        }
      }
      
      setDeliveryFee(fee);
      setTotalPrice(rentalPrice + fee + DEPOSIT_AMOUNT);
    };
    
    calculatePrice();
  }, [car, rentalType, startDate, endDate, deliveryOption, deliveryTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare delivery date with time
      const [hours, minutes] = deliveryTime.split(":").map(Number);
      const deliveryDateTime = new Date(deliveryDate);
      deliveryDateTime.setHours(hours, minutes, 0, 0);
      
      const bookingData = {
        car_id: car.id,
        rental_period: rentalType,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        delivery_option: deliveryOption,
        delivery_address: deliveryOption === "Delivery" ? deliveryAddress : undefined,
        delivery_fee: deliveryFee,
        deposit: DEPOSIT_AMOUNT,
        total_price: totalPrice,
        special_requests: specialRequests
      };
      
      const { data, error } = await createBooking(bookingData);
      
      if (error) {
        toast({
          title: "Booking Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Booking Success",
        description: "Your booking has been successfully created and is pending approval."
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/customer/dashboard");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking Failed",
        description: "There was an unexpected error creating your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate minimum end date based on rental type
  const getMinEndDate = () => {
    if (rentalType === "ShortTerm") {
      return addDays(startDate, 13); // 14 days total (including start date)
    } else {
      return addMonths(startDate, 3).setDate(startDate.getDate() - 1); // 3 months
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Rental Period</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <div className="mt-1 p-2 border rounded-md bg-secondary/30">
              {format(startDate, "PPP")}
            </div>
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <div className="mt-1">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                disabled={(date) => {
                  return date < getMinEndDate() || date < startDate;
                }}
                className="border rounded-md"
              />
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {rentalType === "ShortTerm" 
            ? "Short-term rentals require a minimum of 2 weeks." 
            : "Long-term rentals require a minimum of 3 months."}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Delivery Options</h3>
        <RadioGroup 
          value={deliveryOption} 
          onValueChange={(value) => setDeliveryOption(value as DeliveryOption)}
          className="space-y-3"
        >
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="SelfPickup" id="self-pickup" />
            <div className="grid gap-1.5">
              <Label htmlFor="self-pickup" className="font-medium">
                Self-Pickup (Free)
              </Label>
              <p className="text-sm text-muted-foreground">
                Pick up the car from our location at no additional cost.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="Delivery" id="delivery" />
            <div className="grid gap-1.5 flex-1">
              <Label htmlFor="delivery" className="font-medium">
                Delivery (${deliveryFee})
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                We'll deliver the car to your specified address for an additional fee.
              </p>
              
              {deliveryOption === "Delivery" && (
                <div className="space-y-3 mt-2">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                        required={deliveryOption === "Delivery"}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                          required={deliveryOption === "Delivery"}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                          required={deliveryOption === "Delivery"}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input
                          id="zipCode"
                          value={deliveryAddress.zipCode}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, zipCode: e.target.value})}
                          required={deliveryOption === "Delivery"}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="deliveryDate">Delivery Date</Label>
                      <div className="mt-1">
                        <Calendar
                          mode="single"
                          selected={deliveryDate}
                          onSelect={(date) => date && setDeliveryDate(date)}
                          disabled={(date) => {
                            // Only allow delivery on or after the selected start date
                            // and before the end date
                            return date < startDate || date > endDate;
                          }}
                          className="border rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="deliveryTime">Delivery Time</Label>
                      <Input
                        id="deliveryTime"
                        type="time"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="mt-1"
                        required={deliveryOption === "Delivery"}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        After-hours delivery (before 8 AM or after 6 PM) incurs a higher fee.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
        <Textarea
          id="specialRequests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Any special requests or notes for your booking"
          className="mt-1"
        />
      </div>

      <Card className="bg-secondary/30">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-3">Booking Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Car:</span>
              <span>{car.make} {car.model} ({car.year})</span>
            </div>
            <div className="flex justify-between">
              <span>Rental Type:</span>
              <span>{rentalType === "ShortTerm" ? "Short-Term" : "Long-Term"}</span>
            </div>
            <div className="flex justify-between">
              <span>Daily Rate:</span>
              <span>${rentalType === "ShortTerm" ? car.pricing.shortTerm : car.pricing.longTerm}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>{differenceInDays(endDate, startDate) + 1} days</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Option:</span>
              <span>{deliveryOption === "SelfPickup" ? "Self-Pickup" : "Delivery"}</span>
            </div>
            {deliveryOption === "Delivery" && (
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Refundable Deposit:</span>
              <span>${DEPOSIT_AMOUNT.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total Amount:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Includes rental, delivery fee (if applicable), and refundable deposit.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Confirm Booking"}
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;
