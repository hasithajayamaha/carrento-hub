
export type UserRole = 
  | "SuperAdmin" 
  | "Admin" 
  | "SupportStaff" 
  | "ServiceCenterStaff" 
  | "CarOwner" 
  | "Customer";

export type RentalPeriod = "ShortTerm" | "LongTerm";

export type CarStatus = "Available" | "Booked" | "Maintenance" | "New";

export type CarType = "Sedan" | "SUV" | "Coupe" | "Hatchback" | "Wagon" | "Pickup" | "Minivan";

export type DeliveryOption = "SelfPickup" | "Delivery";

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  type: CarType;
  color: string;
  image: string;
  description: string;
  status: CarStatus;
  ownerId: string;
  pricing: {
    shortTerm: number; // Per day price for 2 weeks to < 3 months
    longTerm: number; // Per day price for 3+ months
  };
  specifications: {
    seats: number;
    doors: number;
    transmission: "Automatic" | "Manual";
    fuelType: "Gasoline" | "Diesel" | "Electric" | "Hybrid";
    fuelEfficiency: string; // e.g., "30 MPG"
    features: string[];
  };
  availability: {
    startDate: string;
    endDate: string; // When car is no longer available for the platform
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateJoined: string;
}

export interface Booking {
  id: string;
  carId: string;
  customerId: string;
  rentalPeriod: RentalPeriod;
  startDate: string;
  endDate: string;
  deliveryOption: DeliveryOption;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryFee: number;
  deposit: number; // $500 refundable
  totalPrice: number;
  status: "Pending" | "Approved" | "Active" | "Completed" | "Cancelled";
  paymentStatus: "Pending" | "Paid" | "Refunded";
  createdAt: string;
  updatedAt: string;
}

export interface Maintenance {
  id: string;
  carId: string;
  type: "Regular" | "Repair" | "Inspection";
  description: string;
  cost: number;
  date: string;
  status: "Scheduled" | "InProgress" | "Completed" | "Cancelled";
  notes?: string;
  performedBy: string; // ID of service center staff
  createdAt: string;
  updatedAt: string;
}
