
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Car, Plus, Image, File } from "lucide-react";
import { CarType } from "@/types/models";

const CarListingForm: React.FC = () => {
  const [cars, setCars] = useState([
    { id: "1", make: "Toyota", model: "Camry", year: 2020, status: "Available" },
    { id: "2", make: "Honda", model: "Civic", year: 2021, status: "Booked" },
    { id: "3", make: "Ford", model: "Explorer", year: 2019, status: "Maintenance" },
  ]);
  
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    type: "" as CarType,
    color: "",
    description: "",
    seats: "",
    doors: "",
    transmission: "",
    fuelType: "",
    fuelEfficiency: "",
    availableFrom: "",
    availableTo: "",
    features: {
      airConditioning: false,
      gps: false,
      bluetooth: false,
      usbPorts: false,
      leatherSeats: false,
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: checked
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, we'd submit to API
    // For demo, we'll just add to local state
    const newCar = {
      id: (cars.length + 1).toString(),
      make: formData.make,
      model: formData.model,
      year: parseInt(formData.year),
      status: "New" as const
    };
    
    setCars(prev => [...prev, newCar]);
    
    // Reset form
    setFormData({
      make: "",
      model: "",
      year: "",
      type: "" as CarType,
      color: "",
      description: "",
      seats: "",
      doors: "",
      transmission: "",
      fuelType: "",
      fuelEfficiency: "",
      availableFrom: "",
      availableTo: "",
      features: {
        airConditioning: false,
        gps: false,
        bluetooth: false,
        usbPorts: false,
        leatherSeats: false,
      }
    });
    
    // Close the dialog (would need actual implementation)
    // setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Cars</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Car
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add a New Car</DialogTitle>
              <DialogDescription>
                Fill out the details to list your car for rental.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="make">Make</Label>
                    <Input 
                      id="make" 
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="model">Model</Label>
                    <Input 
                      id="model" 
                      name="model" 
                      value={formData.model}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="year">Year</Label>
                    <Input 
                      id="year" 
                      name="year" 
                      type="number" 
                      value={formData.year}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Input 
                      id="type" 
                      name="type" 
                      placeholder="Sedan, SUV, etc."
                      value={formData.type}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="color">Color</Label>
                    <Input 
                      id="color" 
                      name="color" 
                      value={formData.color}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Specifications</h3>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="seats">Number of Seats</Label>
                    <Input 
                      id="seats" 
                      name="seats" 
                      type="number" 
                      value={formData.seats}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="doors">Number of Doors</Label>
                    <Input 
                      id="doors" 
                      name="doors" 
                      type="number" 
                      value={formData.doors}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="transmission">Transmission</Label>
                    <Input 
                      id="transmission" 
                      name="transmission" 
                      placeholder="Automatic or Manual"
                      value={formData.transmission}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Input 
                      id="fuelType" 
                      name="fuelType" 
                      placeholder="Gasoline, Diesel, Electric, etc."
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="fuelEfficiency">Fuel Efficiency</Label>
                    <Input 
                      id="fuelEfficiency" 
                      name="fuelEfficiency" 
                      placeholder="e.g., 30 MPG"
                      value={formData.fuelEfficiency}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Description</h3>
                <div className="grid gap-2">
                  <Label htmlFor="description">Car Description</Label>
                  <Input 
                    id="description" 
                    name="description" 
                    placeholder="Describe your car's features, condition, etc."
                    value={formData.description}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Availability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="availableFrom">Available From</Label>
                    <Input 
                      id="availableFrom" 
                      name="availableFrom" 
                      type="date" 
                      value={formData.availableFrom}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="availableTo">Available Until</Label>
                    <Input 
                      id="availableTo" 
                      name="availableTo" 
                      type="date" 
                      value={formData.availableTo}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Note: Cars must be available for at least 1 year</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="airConditioning" 
                      checked={formData.features.airConditioning}
                      onCheckedChange={(checked) => 
                        handleFeatureChange('airConditioning', checked as boolean)
                      }
                    />
                    <Label htmlFor="airConditioning">Air Conditioning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="gps" 
                      checked={formData.features.gps}
                      onCheckedChange={(checked) => 
                        handleFeatureChange('gps', checked as boolean)
                      }
                    />
                    <Label htmlFor="gps">GPS Navigation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bluetooth" 
                      checked={formData.features.bluetooth}
                      onCheckedChange={(checked) => 
                        handleFeatureChange('bluetooth', checked as boolean)
                      }
                    />
                    <Label htmlFor="bluetooth">Bluetooth</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="usbPorts" 
                      checked={formData.features.usbPorts}
                      onCheckedChange={(checked) => 
                        handleFeatureChange('usbPorts', checked as boolean)
                      }
                    />
                    <Label htmlFor="usbPorts">USB Ports</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="leatherSeats" 
                      checked={formData.features.leatherSeats}
                      onCheckedChange={(checked) => 
                        handleFeatureChange('leatherSeats', checked as boolean)
                      }
                    />
                    <Label htmlFor="leatherSeats">Leather Seats</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-center w-full h-40 bg-muted rounded-md">
                      <div className="flex flex-col items-center">
                        <Image className="h-6 w-6 mb-2" />
                        <Button variant="outline" className="mt-2">Upload Photos</Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Upload high-quality images (min. 5 photos)
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-center w-full h-40 bg-muted rounded-md">
                      <div className="flex flex-col items-center">
                        <File className="h-6 w-6 mb-2" />
                        <Button variant="outline" className="mt-2">Upload Documents</Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Upload registration, insurance, etc.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit">Submit Listing</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <Card key={car.id} className="car-card">
            <CardHeader>
              <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
                <Car className="h-16 w-16 text-muted-foreground opacity-30" />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-bold">{car.make} {car.model}</h3>
              <p className="text-sm text-muted-foreground">{car.year}</p>
              <div className="flex justify-between items-center mt-4">
                <span 
                  className={`rental-tag ${car.status === 'Available' ? 'short-term' : 
                                        car.status === 'Booked' ? 'booked' : 'long-term'}`}
                >
                  {car.status}
                </span>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Listing Guidelines</CardTitle>
          <CardDescription>
            Important information for car owners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Cars must be available for at least 1 year on the platform</li>
            <li>CarRento manages all pricing - owners cannot set prices</li>
            <li>CarRento handles all maintenance through our service center (costs billed to car owners)</li>
            <li>Car owners cannot approve/deny rentals or set blackout dates</li>
            <li>Minimum of 5 high-quality photos are required for each listing</li>
            <li>All cars must have up-to-date registration and insurance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarListingForm;
