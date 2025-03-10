import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Filter, Check, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

interface BookingData {
  id: string;
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  rentalPeriod: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  deliveryOption: string;
  createdAt: string;
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();
  
  // Check if user has approval permissions
  const canApproveBookings = profile?.role === "Admin" || profile?.role === "SuperAdmin";
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // First, fetch all bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            *,
            cars:car_id (id, make, model, year)
          `)
          .order("created_at", { ascending: false });
          
        if (bookingsError) throw bookingsError;
        
        // Then, for each booking, get the customer profile
        const formattedBookings: BookingData[] = await Promise.all(
          bookingsData.map(async (booking) => {
            // Get customer profile
            const { data: customerData, error: customerError } = await supabase
              .from("profiles")
              .select("id, full_name, role")
              .eq("id", booking.customer_id)
              .single();
            
            if (customerError) {
              console.error("Error fetching customer profile:", customerError);
              // Provide fallback values if profile fetch fails
              return {
                id: booking.id,
                car: {
                  id: booking.cars.id,
                  make: booking.cars.make,
                  model: booking.cars.model,
                  year: booking.cars.year
                },
                customer: {
                  id: booking.customer_id,
                  name: "Unknown Customer",
                  email: "unknown@email.com"
                },
                startDate: booking.start_date,
                endDate: booking.end_date,
                rentalPeriod: booking.rental_period,
                totalPrice: booking.total_price,
                status: booking.status,
                paymentStatus: booking.payment_status,
                deliveryOption: booking.delivery_option,
                createdAt: booking.created_at
              };
            }
            
            return {
              id: booking.id,
              car: {
                id: booking.cars.id,
                make: booking.cars.make,
                model: booking.cars.model,
                year: booking.cars.year
              },
              customer: {
                id: customerData.id,
                name: customerData.full_name || "Unknown",
                email: "customer@email.com" // We don't store email in profiles, use placeholder
              },
              startDate: booking.start_date,
              endDate: booking.end_date,
              rentalPeriod: booking.rental_period,
              totalPrice: booking.total_price,
              status: booking.status,
              paymentStatus: booking.payment_status,
              deliveryOption: booking.delivery_option,
              createdAt: booking.created_at
            };
          })
        );
        
        setBookings(formattedBookings);
        setFilteredBookings(formattedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [toast]);
  
  // Filter bookings when search term or status filter changes
  useEffect(() => {
    let filtered = bookings;
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status.toLowerCase() === statusFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.car.make.toLowerCase().includes(term) ||
        booking.car.model.toLowerCase().includes(term) ||
        booking.customer.name.toLowerCase().includes(term) ||
        booking.id.toLowerCase().includes(term)
      );
    }
    
    setFilteredBookings(filtered);
  }, [searchTerm, statusFilter, bookings]);
  
  const approveBooking = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "Approved" })
        .eq("id", bookingId);
        
      if (error) throw error;
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: "Approved" } 
          : booking
      ));
      
      toast({
        title: "Booking Approved",
        description: "The booking has been approved",
      });
    } catch (error) {
      console.error("Error approving booking:", error);
      toast({
        title: "Error",
        description: "Failed to approve booking",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const cancelBooking = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "Cancelled" })
        .eq("id", bookingId);
        
      if (error) throw error;
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: "Cancelled" } 
          : booking
      ));
      
      toast({
        title: "Booking Cancelled",
        description: "The booking has been cancelled",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "outline";
      case "approved": return "default";
      case "active": return "default";
      case "completed": return "secondary";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };
  
  const getPaymentBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "default";
      case "pending": return "outline";
      case "refunded": return "secondary";
      default: return "outline";
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <Badge variant="outline">{filteredBookings.length} Bookings</Badge>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by car, customer or booking ID..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium mb-2">No Bookings Found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your filters to see more results." 
              : "There are no bookings in the system yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-xs">{booking.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    {booking.car.year} {booking.car.make} {booking.car.model}
                  </TableCell>
                  <TableCell>{booking.customer.name}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>{new Date(booking.startDate).toLocaleDateString()}</div>
                      <div>to</div>
                      <div>{new Date(booking.endDate).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentBadgeVariant(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Booking Details</DialogTitle>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium mb-2">Car Information</h3>
                              <div className="text-sm space-y-1">
                                <div>
                                  <span className="text-muted-foreground">Make/Model:</span>
                                  <span className="ml-2">
                                    {booking.car.year} {booking.car.make} {booking.car.model}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-medium mb-2">Customer Information</h3>
                              <div className="text-sm space-y-1">
                                <div>
                                  <span className="text-muted-foreground">Name:</span>
                                  <span className="ml-2">{booking.customer.name}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Email:</span>
                                  <span className="ml-2">{booking.customer.email}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-medium mb-2">Booking Details</h3>
                              <div className="text-sm space-y-1">
                                <div>
                                  <span className="text-muted-foreground">Booking ID:</span>
                                  <span className="ml-2 font-mono">{booking.id}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Created On:</span>
                                  <span className="ml-2">
                                    {new Date(booking.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Delivery:</span>
                                  <span className="ml-2">{booking.deliveryOption}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium mb-2">Rental Period</h3>
                              <div className="text-sm space-y-1">
                                <div>
                                  <span className="text-muted-foreground">Type:</span>
                                  <span className="ml-2">{booking.rentalPeriod}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Start Date:</span>
                                  <span className="ml-2">
                                    {new Date(booking.startDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">End Date:</span>
                                  <span className="ml-2">
                                    {new Date(booking.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Duration:</span>
                                  <span className="ml-2">
                                    {Math.round((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-medium mb-2">Payment Information</h3>
                              <div className="text-sm space-y-1">
                                <div>
                                  <span className="text-muted-foreground">Total Amount:</span>
                                  <span className="ml-2 font-semibold">
                                    ${booking.totalPrice.toFixed(2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Status:</span>
                                  <span className="ml-2">
                                    <Badge variant={getPaymentBadgeVariant(booking.paymentStatus)}>
                                      {booking.paymentStatus}
                                    </Badge>
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-medium mb-2">Booking Status</h3>
                              <div className="mb-4">
                                <Badge variant={getBadgeVariant(booking.status)} className="px-3 py-1 text-base">
                                  {booking.status}
                                </Badge>
                              </div>
                              
                              {canApproveBookings && booking.status === "Pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => approveBooking(booking.id)}
                                    className="flex-1"
                                    disabled={processingId === booking.id}
                                  >
                                    <Check className="mr-2 h-4 w-4" /> Approve
                                  </Button>
                                  <Button
                                    onClick={() => cancelBooking(booking.id)}
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={processingId === booking.id}
                                  >
                                    <X className="mr-2 h-4 w-4" /> Cancel
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {canApproveBookings && booking.status === "Pending" && (
                      <div className="flex gap-1 mt-2">
                        <Button
                          onClick={() => approveBooking(booking.id)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          disabled={processingId === booking.id}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => cancelBooking(booking.id)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          disabled={processingId === booking.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {filteredBookings.some(b => b.status === "Pending" && b.paymentStatus === "Paid") && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <p className="text-sm text-yellow-700">
            There are bookings with paid deposits waiting for approval. Please review them as soon as possible.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
