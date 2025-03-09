
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Car, Calendar, DollarSign } from "lucide-react";

const maintenanceRecords = [
  {
    id: "m1",
    carId: "1",
    carName: "Toyota Camry",
    type: "Regular",
    description: "Oil change, tire rotation, and fluid check",
    cost: 120,
    date: "2023-05-15",
    status: "Completed",
    notes: "Next maintenance due in 3 months",
    performedBy: "John Smith"
  },
  {
    id: "m2",
    carId: "2",
    carName: "Honda Civic",
    type: "Repair",
    description: "Brake pad replacement",
    cost: 350,
    date: "2023-06-02",
    status: "Completed",
    notes: "Front and rear brake pads replaced",
    performedBy: "Mike Johnson"
  },
  {
    id: "m3",
    carId: "3",
    carName: "Ford Explorer",
    type: "Inspection",
    description: "Annual inspection and emissions test",
    cost: 95,
    date: "2023-04-10",
    status: "Completed",
    notes: "Passed all tests, renewed registration",
    performedBy: "Sarah Williams"
  },
  {
    id: "m4",
    carId: "1",
    carName: "Toyota Camry",
    type: "Repair",
    description: "AC system repair",
    cost: 420,
    date: "2023-06-20",
    status: "InProgress",
    notes: "Refrigerant leak detected, replacing compressor",
    performedBy: "Mike Johnson"
  },
  {
    id: "m5",
    carId: "3",
    carName: "Ford Explorer",
    type: "Regular",
    description: "Oil change and filter replacement",
    cost: 85,
    date: "2023-07-15",
    status: "Scheduled",
    notes: "Routine maintenance",
    performedBy: "John Smith"
  }
];

const MaintenanceTracker: React.FC = () => {
  // Calculate total maintenance costs
  const totalCosts = maintenanceRecords
    .filter(m => m.status === "Completed")
    .reduce((sum, record) => sum + record.cost, 0);
  
  // Group by status
  const completedMaintenance = maintenanceRecords.filter(m => m.status === "Completed");
  const inProgressMaintenance = maintenanceRecords.filter(m => m.status === "InProgress");
  const scheduledMaintenance = maintenanceRecords.filter(m => m.status === "Scheduled");
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const MaintenanceCard = ({ record }: { record: typeof maintenanceRecords[0] }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className={`mr-4 p-2 rounded ${
              record.type === 'Regular' ? 'bg-blue-100' : 
              record.type === 'Repair' ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <Wrench className={`h-5 w-5 ${
                record.type === 'Regular' ? 'text-blue-600' : 
                record.type === 'Repair' ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
            <div>
              <h4 className="font-medium">{record.carName}</h4>
              <div className="text-sm">{record.type} - {record.description}</div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(record.date)}</span>
            </div>
            
            <div className="font-medium text-red-600">${record.cost}</div>
            
            <div>
              <span 
                className={`px-2 py-1 rounded text-xs font-medium ${
                  record.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                  record.status === 'InProgress' ? 'bg-amber-100 text-amber-800' : 
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {record.status}
              </span>
            </div>
          </div>
        </div>
        
        {record.notes && (
          <div className="mt-4 text-sm text-muted-foreground border-t pt-2">
            <span className="font-medium">Notes:</span> {record.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Cost Summary</CardTitle>
          <CardDescription>Overview of your vehicle maintenance costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">${totalCosts}</div>
          <div className="text-sm text-muted-foreground mt-1">Total maintenance costs year-to-date</div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="font-medium">Completed</div>
              <div className="text-2xl font-bold">{completedMaintenance.length}</div>
              <div className="text-sm text-muted-foreground">Maintenance records</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="font-medium">In Progress</div>
              <div className="text-2xl font-bold">{inProgressMaintenance.length}</div>
              <div className="text-sm text-muted-foreground">Maintenance records</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-medium">Scheduled</div>
              <div className="text-2xl font-bold">{scheduledMaintenance.length}</div>
              <div className="text-sm text-muted-foreground">Maintenance records</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {inProgressMaintenance.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">In Progress Maintenance</h3>
            {inProgressMaintenance.map(record => (
              <MaintenanceCard key={record.id} record={record} />
            ))}
          </div>
        )}
        
        {scheduledMaintenance.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Scheduled Maintenance</h3>
            {scheduledMaintenance.map(record => (
              <MaintenanceCard key={record.id} record={record} />
            ))}
          </div>
        )}
        
        {completedMaintenance.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Completed Maintenance</h3>
            {completedMaintenance.map(record => (
              <MaintenanceCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Policies</CardTitle>
          <CardDescription>Important information for car owners</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>All maintenance is handled by CarRento's service center</li>
            <li>Maintenance costs are billed directly to car owners</li>
            <li>Regular maintenance is required to keep your car listed on the platform</li>
            <li>Maintenance scheduling is done by CarRento based on manufacturer recommendations</li>
            <li>Emergency repairs will be communicated to owners prior to work being performed when possible</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <Wrench className="mr-2 h-4 w-4" />
            Contact Service Center
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MaintenanceTracker;
