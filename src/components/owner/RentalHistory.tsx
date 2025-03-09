
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Car, User } from "lucide-react";

const rentals = [
  {
    id: "r1",
    carId: "1",
    carName: "Toyota Camry",
    customer: "Alice Johnson",
    startDate: "2023-05-10",
    endDate: "2023-06-10",
    status: "Completed",
    rentalPeriod: "LongTerm",
    totalEarnings: 1850
  },
  {
    id: "r2",
    carId: "1",
    carName: "Toyota Camry",
    customer: "Bob Smith",
    startDate: "2023-06-15",
    endDate: "2023-07-15",
    status: "Active",
    rentalPeriod: "LongTerm",
    totalEarnings: 1850
  },
  {
    id: "r3",
    carId: "2",
    carName: "Honda Civic",
    customer: "Carol Davis",
    startDate: "2023-06-01",
    endDate: "2023-06-15",
    status: "Active",
    rentalPeriod: "ShortTerm",
    totalEarnings: 900
  },
  {
    id: "r4",
    carId: "3",
    carName: "Ford Explorer",
    customer: "David Miller",
    startDate: "2023-04-01",
    endDate: "2023-07-01",
    status: "Completed",
    rentalPeriod: "LongTerm",
    totalEarnings: 3200
  },
  {
    id: "r5",
    carId: "3",
    carName: "Ford Explorer", 
    customer: "Eva Wilson",
    startDate: "2023-07-10",
    endDate: "2023-07-25",
    status: "Upcoming",
    rentalPeriod: "ShortTerm",
    totalEarnings: 1050
  }
];

const RentalHistory: React.FC = () => {
  // Group rentals by status
  const activeRentals = rentals.filter(r => r.status === "Active");
  const upcomingRentals = rentals.filter(r => r.status === "Upcoming");
  const completedRentals = rentals.filter(r => r.status === "Completed");
  
  // Calculate earnings
  const totalEarnings = rentals
    .filter(r => r.status === "Completed" || r.status === "Active")
    .reduce((sum, rental) => sum + rental.totalEarnings, 0);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const RentalCard = ({ rental }: { rental: typeof rentals[0] }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-4 bg-primary/10 p-2 rounded">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{rental.carName}</h4>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="mr-1 h-3 w-3" />
                <span>{rental.customer}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
              </span>
            </div>
            
            <div>
              <span 
                className={`rental-tag ${rental.rentalPeriod === 'ShortTerm' ? 'short-term' : 'long-term'}`}
              >
                {rental.rentalPeriod === 'ShortTerm' ? 'Short Term' : 'Long Term'}
              </span>
            </div>
            
            <div className="font-medium">${rental.totalEarnings}</div>
            
            <div>
              <span 
                className={`px-2 py-1 rounded text-xs font-medium ${
                  rental.status === 'Active' ? 'bg-green-100 text-green-800' : 
                  rental.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {rental.status}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rental Earnings Summary</CardTitle>
          <CardDescription>Overview of your rental income</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalEarnings}</div>
          <div className="text-sm text-muted-foreground mt-1">Total earnings from active and completed rentals</div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="font-medium">Active Rentals</div>
              <div className="text-2xl font-bold">{activeRentals.length}</div>
              <div className="text-sm text-muted-foreground">Currently rented</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-medium">Upcoming Rentals</div>
              <div className="text-2xl font-bold">{upcomingRentals.length}</div>
              <div className="text-sm text-muted-foreground">Reserved but not started</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-medium">Completed Rentals</div>
              <div className="text-2xl font-bold">{completedRentals.length}</div>
              <div className="text-sm text-muted-foreground">Past rentals</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {activeRentals.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Active Rentals</h3>
            {activeRentals.map(rental => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        )}
        
        {upcomingRentals.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Upcoming Rentals</h3>
            {upcomingRentals.map(rental => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        )}
        
        {completedRentals.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Completed Rentals</h3>
            {completedRentals.map(rental => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Rental Policies</CardTitle>
          <CardDescription>Important information for car owners</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Minimum rental period is 2 weeks, preferred minimum is 3 months</li>
            <li>Car owners cannot approve/deny rentals - CarRento manages the booking process</li>
            <li>Two pricing strategies apply: Short-term (2 weeks to &lt;3 months) and Long-term (3+ months)</li>
            <li>All bookings include a $500 refundable deposit from the customer</li>
            <li>Earnings are deposited to your account on a monthly basis</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalHistory;
