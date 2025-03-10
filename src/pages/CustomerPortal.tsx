
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Info, AlertCircle, Calendar, FileText, ShieldAlert } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getUserBookings } from "@/integrations/supabase/booking";
import IncidentReportForm from "@/components/booking/IncidentReportForm";

const CustomerPortal: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportingIncident, setReportingIncident] = useState<string | null>(null);

  // In a real application, these would be fetched from an API
  const notifications = [
    {
      id: "n1",
      title: "Upcoming Booking",
      message: "Your Honda Civic booking starts in 5 days",
      date: "2023-11-25",
      read: false,
    },
    {
      id: "n2",
      title: "Maintenance Scheduled",
      message: "Maintenance for your Tesla Model 3 is scheduled for Dec 5",
      date: "2023-11-23",
      read: true,
    },
    {
      id: "n3",
      title: "Payment Confirmation",
      message: "Your payment of $1500 for Tesla Model 3 was received",
      date: "2023-11-15",
      read: true,
    },
  ];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await getUserBookings();
        
        if (error) {
          console.error("Error fetching bookings:", error);
          toast({
            title: "Error",
            description: "Failed to load your bookings",
            variant: "destructive"
          });
          return;
        }
        
        if (data) {
          // Sort bookings into active/upcoming and past
          const active: any[] = [];
          const past: any[] = [];
          
          data.forEach((booking: any) => {
            const formattedBooking = {
              id: booking.id,
              carName: `${booking.cars.make} ${booking.cars.model}`,
              startDate: booking.start_date,
              endDate: booking.end_date,
              status: booking.status,
              rentalType: booking.rental_period,
              totalPrice: booking.total_price,
              incidentReported: booking.incident_reported || false,
              car: booking.cars
            };
            
            if (['Pending', 'Approved', 'Active'].includes(booking.status)) {
              active.push(formattedBooking);
            } else {
              past.push(formattedBooking);
            }
          });
          
          setActiveBookings(active);
          setPastBookings(past);
        }
      } catch (error) {
        console.error("Error in fetchBookings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [toast]);

  const handleViewBookingDetails = (bookingId: string) => {
    toast({
      title: "Viewing booking details",
      description: `Now viewing details for booking ${bookingId}`,
    });
    // In a real app, this would navigate to a detailed booking page
  };

  const handleReportIssue = (bookingId: string) => {
    setReportingIncident(bookingId);
  };

  const handleIncidentReportSuccess = () => {
    setReportingIncident(null);
    
    // Refresh bookings to show updated incident status
    toast({
      title: "Incident Report Submitted",
      description: "Your incident report has been submitted successfully and is under review.",
    });
    
    // In a real app, we would refresh the bookings data here
    // For this demo, we'll manually update the relevant booking
    setActiveBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === reportingIncident 
          ? { ...booking, incidentReported: true } 
          : booking
      )
    );
  };

  const handleExtendBooking = (bookingId: string) => {
    toast({
      title: "Extend booking",
      description: "Booking extension form would open here",
    });
    // In a real app, this would open a modal or navigate to an extension form
  };

  const markNotificationAsRead = (notificationId: string) => {
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read",
    });
    // In a real app, this would update the notification status via API
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Customer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your car rentals and account information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Active Rentals</CardTitle>
            <CardDescription>Your current car rentals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeBookings.filter(b => b.status === "Active").length}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={() => navigate("/cars")}>
              <Car className="mr-2 h-4 w-4" />
              Browse more cars
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Upcoming Bookings</CardTitle>
            <CardDescription>Scheduled for the future</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeBookings.filter(b => b.status === "Approved" || b.status === "Pending").length}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={() => {}}>
              <Calendar className="mr-2 h-4 w-4" />
              View calendar
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Notifications</CardTitle>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{notifications.filter(n => !n.read).length}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={() => {}}>
              <AlertCircle className="mr-2 h-4 w-4" />
              View all
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="profile">Profile & Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Active & Upcoming Bookings</h3>
            {loading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Loading your bookings...</p>
                </CardContent>
              </Card>
            ) : activeBookings.length > 0 ? (
              <div className="space-y-4">
                {activeBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-4 md:mb-0">
                          <h4 className="font-medium text-lg">{booking.carName}</h4>
                          <p className="text-muted-foreground">
                            {new Date(booking.startDate).toLocaleDateString()} to{" "}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                              booking.status === "Active" ? "bg-carrento-teal" : "bg-carrento-blue"
                            }`}></span>
                            <span>{booking.status}</span>
                            <span className="mx-2">•</span>
                            <span>{booking.rentalType === "LongTerm" ? "Long-term" : "Short-term"}</span>
                            
                            {booking.incidentReported && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-amber-500 flex items-center">
                                  <ShieldAlert className="h-3 w-3 mr-1" />
                                  Incident Reported
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end">
                          <p className="font-semibold text-xl">${booking.totalPrice}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Button size="sm" onClick={() => handleViewBookingDetails(booking.id)}>
                              <Info className="h-4 w-4 mr-1" /> Details
                            </Button>
                            {booking.status === "Active" && !booking.incidentReported && (
                              <Button size="sm" variant="outline" onClick={() => handleReportIssue(booking.id)}>
                                <FileText className="h-4 w-4 mr-1" /> Report Issue
                              </Button>
                            )}
                            {booking.status === "Active" && (
                              <Button size="sm" variant="outline" onClick={() => handleExtendBooking(booking.id)}>
                                Extend
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground my-6">You don't have any active bookings</p>
                  <Button onClick={() => navigate("/cars")}>
                    <Car className="mr-2 h-4 w-4" />
                    Browse Cars
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Past Bookings</h3>
            {loading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Loading your bookings...</p>
                </CardContent>
              </Card>
            ) : pastBookings.length > 0 ? (
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-4 md:mb-0">
                          <h4 className="font-medium text-lg">{booking.carName}</h4>
                          <p className="text-muted-foreground">
                            {new Date(booking.startDate).toLocaleDateString()} to{" "}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className="inline-block h-2 w-2 rounded-full mr-2 bg-gray-400"></span>
                            <span>{booking.status}</span>
                            <span className="mx-2">•</span>
                            <span>{booking.rentalType === "LongTerm" ? "Long-term" : "Short-term"}</span>
                            
                            {booking.incidentReported && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-amber-500 flex items-center">
                                  <ShieldAlert className="h-3 w-3 mr-1" />
                                  Incident Reported
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end">
                          <p className="font-semibold text-xl">${booking.totalPrice}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Button size="sm" onClick={() => handleViewBookingDetails(booking.id)}>
                              <Info className="h-4 w-4 mr-1" /> Details
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/cars`)}>
                              Book Again
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground my-6">You don't have any past bookings</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <h3 className="text-lg font-medium mb-3">Recent Notifications</h3>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className={notification.read ? "opacity-75" : ""}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium flex items-center">
                          {!notification.read && (
                            <span className="inline-block h-2 w-2 bg-carrento-blue rounded-full mr-2"></span>
                          )}
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.date).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground my-6">You don't have any notifications</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <h3 className="text-lg font-medium mb-3">Your Profile</h3>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p>John Doe</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>john.doe@example.com</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p>+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p>123 Main St, San Francisco, CA 94105</p>
                    </div>
                  </div>
                  <Button size="sm" className="mt-4">Edit Information</Button>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Payment Methods</h4>
                  <div className="border rounded-md p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-gray-200 p-2 rounded mr-3">
                        <span className="font-mono">****4567</span>
                      </div>
                      <div>
                        <p>Visa ending in 4567</p>
                        <p className="text-sm text-muted-foreground">Expires 12/25</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                  <Button size="sm" className="mt-4">Add Payment Method</Button>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Preferences</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p>Email Notifications</p>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p>SMS Notifications</p>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Incident Report Dialog */}
      <Dialog 
        open={!!reportingIncident} 
        onOpenChange={(open) => {
          if (!open) setReportingIncident(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Report an Incident</DialogTitle>
          </DialogHeader>
          {reportingIncident && (
            <IncidentReportForm 
              bookingId={reportingIncident}
              onSuccess={handleIncidentReportSuccess}
              onCancel={() => setReportingIncident(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default CustomerPortal;
