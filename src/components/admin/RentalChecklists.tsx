
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Camera, Upload } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface Checklist {
  id: string;
  carId: string;
  car: {
    make: string;
    model: string;
    year: number;
  };
  bookingId: string;
  customer: string;
  date: string;
  type: "Pre-Rental" | "Post-Rental";
  status: "Pending" | "Completed";
  items: ChecklistItem[];
  notes: string;
  photos: string[];
}

// Mock data - in a real app this would come from Supabase
const mockChecklists: Checklist[] = [
  {
    id: "checklist-1",
    carId: "car-1",
    car: {
      make: "Toyota",
      model: "Camry",
      year: 2022
    },
    bookingId: "booking-1",
    customer: "John Doe",
    date: "2023-10-15",
    type: "Pre-Rental",
    status: "Pending",
    items: [
      { id: "item-1", label: "Exterior Condition", checked: false },
      { id: "item-2", label: "Interior Condition", checked: false },
      { id: "item-3", label: "Tire Condition", checked: false },
      { id: "item-4", label: "Fuel Level", checked: false },
      { id: "item-5", label: "Mileage Reading", checked: false },
      { id: "item-6", label: "Brake Function", checked: false },
      { id: "item-7", label: "Lights Function", checked: false },
      { id: "item-8", label: "Documents Present", checked: false }
    ],
    notes: "",
    photos: []
  },
  {
    id: "checklist-2",
    carId: "car-2",
    car: {
      make: "Honda",
      model: "Accord",
      year: 2021
    },
    bookingId: "booking-2",
    customer: "Jane Smith",
    date: "2023-10-12",
    type: "Post-Rental",
    status: "Completed",
    items: [
      { id: "item-1", label: "Exterior Condition", checked: true },
      { id: "item-2", label: "Interior Condition", checked: true },
      { id: "item-3", label: "Tire Condition", checked: true },
      { id: "item-4", label: "Fuel Level", checked: true },
      { id: "item-5", label: "Mileage Reading", checked: true },
      { id: "item-6", label: "Brake Function", checked: true },
      { id: "item-7", label: "Lights Function", checked: true },
      { id: "item-8", label: "Documents Present", checked: true }
    ],
    notes: "Car returned in excellent condition.",
    photos: ["/placeholder.svg", "/placeholder.svg"]
  }
];

const RentalChecklists: React.FC = () => {
  const [checklists, setChecklists] = useState<Checklist[]>(mockChecklists);
  const [activeTab, setActiveTab] = useState<string>("pre-rental");
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  const handleSelectChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
  };
  
  const handleCheckItem = (itemId: string) => {
    if (!selectedChecklist) return;
    
    const updatedItems = selectedChecklist.items.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    
    setSelectedChecklist({
      ...selectedChecklist,
      items: updatedItems
    });
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedChecklist) return;
    
    setSelectedChecklist({
      ...selectedChecklist,
      notes: e.target.value
    });
  };
  
  const handleSaveChecklist = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (!selectedChecklist) return;
      
      // Check if all items are checked
      const allChecked = selectedChecklist.items.every(item => item.checked);
      
      // Update the checklist
      const updatedChecklists = checklists.map(cl => 
        cl.id === selectedChecklist.id 
          ? { 
              ...selectedChecklist, 
              status: allChecked ? "Completed" : "Pending" 
            } 
          : cl
      );
      
      setChecklists(updatedChecklists);
      setSelectedChecklist(null);
      
      toast({
        title: "Checklist Saved",
        description: allChecked 
          ? "The checklist has been completed and saved." 
          : "The checklist has been saved as pending.",
      });
      
      setLoading(false);
    }, 1000);
  };
  
  const filteredChecklists = checklists.filter(
    cl => (activeTab === "pre-rental" ? cl.type === "Pre-Rental" : cl.type === "Post-Rental")
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Rental Checklists</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pre-rental">Pre-Rental Checklists</TabsTrigger>
          <TabsTrigger value="post-rental">Post-Rental Checklists</TabsTrigger>
        </TabsList>
        
        {["pre-rental", "post-rental"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="w-full">
            {selectedChecklist ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {selectedChecklist.type} Checklist - {selectedChecklist.car.year} {selectedChecklist.car.make} {selectedChecklist.car.model}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Vehicle Inspection</h3>
                          <div className="space-y-4">
                            {selectedChecklist.items.map(item => (
                              <div key={item.id} className="flex items-start space-x-2">
                                <Checkbox
                                  id={item.id}
                                  checked={item.checked}
                                  onCheckedChange={() => handleCheckItem(item.id)}
                                />
                                <div className="grid gap-1.5">
                                  <Label htmlFor={item.id}>{item.label}</Label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Notes</h3>
                          <Textarea
                            value={selectedChecklist.notes}
                            onChange={handleNotesChange}
                            placeholder="Add any additional notes about the vehicle condition..."
                            className="min-h-[150px]"
                          />
                          
                          <h3 className="text-lg font-medium mt-6 mb-4">Photos</h3>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {selectedChecklist.photos.map((photo, index) => (
                              <div key={index} className="relative aspect-square bg-muted rounded-md overflow-hidden">
                                <img
                                  src={photo}
                                  alt={`Checklist photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            
                            <Button variant="outline" className="aspect-square flex flex-col items-center justify-center">
                              <Camera className="h-6 w-6 mb-1" />
                              <span className="text-xs">Add Photo</span>
                            </Button>
                          </div>
                          
                          <div className="flex justify-between mt-6">
                            <Button
                              variant="outline"
                              onClick={() => setSelectedChecklist(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleSaveChecklist}
                              disabled={loading}
                            >
                              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Save Checklist
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">Vehicle</h3>
                          <p>
                            {selectedChecklist.car.year} {selectedChecklist.car.make} {selectedChecklist.car.model}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">Customer</h3>
                          <p>{selectedChecklist.customer}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">Date</h3>
                          <p>{new Date(selectedChecklist.date).toLocaleDateString()}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">Status</h3>
                          <Badge
                            variant={selectedChecklist.status === "Completed" ? "default" : "outline"}
                          >
                            {selectedChecklist.status}
                          </Badge>
                        </div>
                        
                        <div className="pt-2">
                          <Button variant="outline" className="w-full">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Documents
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <>
                {filteredChecklists.length === 0 ? (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium mb-2">No Checklists Available</h3>
                    <p className="text-muted-foreground">
                      There are no {activeTab === "pre-rental" ? "pre-rental" : "post-rental"} checklists to complete at this time.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredChecklists.map((checklist) => (
                      <Card 
                        key={checklist.id}
                        className={`cursor-pointer transition-colors ${
                          checklist.status === "Pending" ? "border-orange-200 bg-orange-50" : ""
                        }`}
                        onClick={() => handleSelectChecklist(checklist)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">
                              {checklist.car.year} {checklist.car.make} {checklist.car.model}
                            </CardTitle>
                            <Badge
                              variant={checklist.status === "Completed" ? "default" : "outline"}
                            >
                              {checklist.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground mb-4">
                            <div>Customer: {checklist.customer}</div>
                            <div>Date: {new Date(checklist.date).toLocaleDateString()}</div>
                          </div>
                          
                          <div className="text-sm">
                            <div className="font-medium mb-2">Items Completed</div>
                            <div className="flex items-center">
                              <div className="w-full bg-muted rounded-full h-2 mr-2">
                                <div 
                                  className="bg-primary rounded-full h-2"
                                  style={{ 
                                    width: `${(checklist.items.filter(i => i.checked).length / checklist.items.length) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <span>
                                {checklist.items.filter(i => i.checked).length}/{checklist.items.length}
                              </span>
                            </div>
                          </div>
                          
                          {checklist.status === "Pending" && (
                            <div className="flex items-center mt-4 text-amber-600 text-sm">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              <span>Needs attention</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default RentalChecklists;
