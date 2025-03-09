
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import CarCard from "@/components/cars/CarCard";
import CarFilters from "@/components/cars/CarFilters";
import CarDetailDialog from "@/components/cars/CarDetailDialog";
import { cars } from "@/data/mockData";
import { Car } from "@/types/models";
import { Input } from "@/components/ui/input";

const CarsPage: React.FC = () => {
  const { toast } = useToast();
  const [filteredCars, setFilteredCars] = useState<Car[]>(cars);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    // Apply filters
    let result = [...cars];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (car) =>
          car.make.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query) ||
          car.type.toLowerCase().includes(query) ||
          car.color.toLowerCase().includes(query)
      );
    }

    // Apply other filters
    if (filters.make) {
      result = result.filter((car) => car.make === filters.make);
    }

    if (filters.types && filters.types.length > 0) {
      result = result.filter((car) => filters.types.includes(car.type));
    }

    if (filters.colors && filters.colors.length > 0) {
      result = result.filter((car) => 
        filters.colors.some((color: string) => 
          car.color.toLowerCase() === color.toLowerCase()
        )
      );
    }

    if (filters.priceRange) {
      result = result.filter(
        (car) => {
          if (filters.rentalType === "ShortTerm") {
            return car.pricing.shortTerm >= filters.priceRange[0] &&
                  car.pricing.shortTerm <= filters.priceRange[1];
          } else if (filters.rentalType === "LongTerm") {
            return car.pricing.longTerm >= filters.priceRange[0] &&
                  car.pricing.longTerm <= filters.priceRange[1];
          } else {
            // If "Any" rental type, check if either pricing fits
            return (
              (car.pricing.shortTerm >= filters.priceRange[0] &&
                car.pricing.shortTerm <= filters.priceRange[1]) ||
              (car.pricing.longTerm >= filters.priceRange[0] &&
                car.pricing.longTerm <= filters.priceRange[1])
            );
          }
        }
      );
    }

    if (filters.availableNow) {
      result = result.filter(
        (car) => car.status === "Available" || car.status === "New"
      );
    }

    setFilteredCars(result);
  }, [searchQuery, filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const handleViewDetails = (car: Car) => {
    setSelectedCar(car);
    setDetailDialogOpen(true);
  };

  const handleToggleFavorite = (carId: string) => {
    setFavorites((prev) => {
      if (prev.includes(carId)) {
        toast({
          title: "Removed from favorites",
          description: "This car has been removed from your favorites.",
        });
        return prev.filter((id) => id !== carId);
      } else {
        toast({
          title: "Added to favorites",
          description: "This car has been added to your favorites.",
        });
        return [...prev, carId];
      }
    });
  };

  const handleBookNow = (car: Car, rentalType: "ShortTerm" | "LongTerm", startDate: Date) => {
    // In a real app, this would navigate to a booking flow or open a booking modal
    toast({
      title: "Booking initiated",
      description: `You're booking a ${car.make} ${car.model} for ${
        rentalType === "ShortTerm" ? "short-term" : "long-term"
      } rental starting on ${startDate.toLocaleDateString()}.`,
    });
    setDetailDialogOpen(false);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Browse Available Cars</h1>
        <p className="text-muted-foreground">
          Find the perfect car for your short-term or long-term rental needs
        </p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Search by make, model, type, or color..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CarFilters
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-muted-foreground">
              {filteredCars.length} cars found
            </p>
          </div>

          {filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  onViewDetails={handleViewDetails}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(car.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg font-medium">No cars found</p>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>

      <CarDetailDialog
        car={selectedCar}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onBookNow={handleBookNow}
      />
    </MainLayout>
  );
};

export default CarsPage;
