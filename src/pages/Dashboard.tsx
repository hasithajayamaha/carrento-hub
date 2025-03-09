
import React from "react";
import { Link } from "react-router-dom";
import { Car, Calendar, Wrench, ArrowRight, CreditCard, Info, UserCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cars } from "@/data/mockData";

const Dashboard: React.FC = () => {
  // Filter available cars for the highlights section
  const availableCars = cars.filter(
    (car) => car.status === "Available" || car.status === "New"
  ).slice(0, 3);

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to CarRento</h1>
        <p className="text-muted-foreground text-lg">
          Your premium long-term car rental platform
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-gradient-to-br from-carrento-blue to-carrento-blue/80 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Browse Cars
            </CardTitle>
            <CardDescription className="text-white/80">
              Find your perfect vehicle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Explore our selection of premium cars available for short and long-term rental.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/cars">
                Browse Cars
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Bookings
            </CardTitle>
            <CardDescription>
              Manage your current rentals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              View and manage your active and upcoming vehicle rentals.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/bookings">
                View Bookings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Report Issue
            </CardTitle>
            <CardDescription>
              Request maintenance or support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Need assistance or maintenance for your rental? Submit a request here.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/support">
                Get Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Featured Cars Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Featured Cars</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/cars">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availableCars.map((car) => (
            <Card key={car.id} className="overflow-hidden car-card">
              <div className="relative h-48">
                <img
                  src={car.image}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={car.status === "New" ? "bg-carrento-blue" : "bg-carrento-teal"}>
                    {car.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{car.make} {car.model}</h3>
                <p className="text-sm text-muted-foreground">{car.year} • {car.type}</p>
                
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
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link to={`/cars?selected=${car.id}`}>
                    View Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="bg-carrento-blue text-white flex items-center justify-center w-8 h-8 rounded-full shrink-0">1</div>
                <div>
                  <h4 className="font-medium">Browse & Select</h4>
                  <p className="text-sm text-muted-foreground">Explore our car inventory and choose your preferred vehicle.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="bg-carrento-blue text-white flex items-center justify-center w-8 h-8 rounded-full shrink-0">2</div>
                <div>
                  <h4 className="font-medium">Book Online</h4>
                  <p className="text-sm text-muted-foreground">Select your rental period (minimum 2 weeks) and delivery option.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="bg-carrento-blue text-white flex items-center justify-center w-8 h-8 rounded-full shrink-0">3</div>
                <div>
                  <h4 className="font-medium">Enjoy Your Rental</h4>
                  <p className="text-sm text-muted-foreground">Drive worry-free with maintenance included in your rental.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pricing & Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Rental Periods</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  <li>Short-Term: 2 weeks to 3 months</li>
                  <li>Long-Term: 3+ months (better rates)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Security Deposit</h4>
                <p className="text-sm text-muted-foreground">$500 refundable deposit required for all rentals.</p>
              </div>
              <div>
                <h4 className="font-medium">Delivery Options</h4>
                <p className="text-sm text-muted-foreground">Free self-pickup or fee-based delivery depending on distance and time.</p>
              </div>
              <div>
                <h4 className="font-medium">Maintenance</h4>
                <p className="text-sm text-muted-foreground">Full maintenance included with all rentals.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-carrento-blue/10 border-carrento-blue mb-6">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-3/4">
              <h2 className="text-2xl font-bold mb-2">Ready to drive?</h2>
              <p className="text-muted-foreground mb-4">
                Start your long-term car rental experience today with CarRento.
                Explore our wide selection of vehicles available for minimum 2-week rentals.
              </p>
              <div className="flex gap-4">
                <Button asChild className="bg-carrento-blue hover:bg-carrento-blue/90">
                  <Link to="/cars">
                    Browse Cars
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/how-it-works">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/4 flex justify-center">
              <UserCircle className="h-24 w-24 text-carrento-blue" />
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Dashboard;
