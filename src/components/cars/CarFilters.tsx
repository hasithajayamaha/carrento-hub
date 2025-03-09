
import React, { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { CarType } from "@/types/models";

interface CarFiltersProps {
  onFilterChange: (filters: any) => void;
  onReset: () => void;
}

const carMakes = [
  { label: "Toyota", value: "Toyota" },
  { label: "Honda", value: "Honda" },
  { label: "Ford", value: "Ford" },
  { label: "BMW", value: "BMW" },
  { label: "Tesla", value: "Tesla" },
  { label: "Hyundai", value: "Hyundai" },
  { label: "Mercedes-Benz", value: "Mercedes-Benz" },
  { label: "Chevrolet", value: "Chevrolet" },
  { label: "Audi", value: "Audi" },
  { label: "Nissan", value: "Nissan" },
];

const carTypes: { label: string; value: CarType }[] = [
  { label: "Sedan", value: "Sedan" },
  { label: "SUV", value: "SUV" },
  { label: "Coupe", value: "Coupe" },
  { label: "Hatchback", value: "Hatchback" },
  { label: "Wagon", value: "Wagon" },
  { label: "Pickup", value: "Pickup" },
  { label: "Minivan", value: "Minivan" },
];

const carColors = [
  { label: "Black", value: "black", color: "#000000" },
  { label: "White", value: "white", color: "#FFFFFF" },
  { label: "Silver", value: "silver", color: "#C0C0C0" },
  { label: "Gray", value: "gray", color: "#808080" },
  { label: "Blue", value: "blue", color: "#0000FF" },
  { label: "Red", value: "red", color: "#FF0000" },
  { label: "Green", value: "green", color: "#008000" },
  { label: "Brown", value: "brown", color: "#A52A2A" },
];

const CarFilters: React.FC<CarFiltersProps> = ({ onFilterChange, onReset }) => {
  const [make, setMake] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 100]);
  const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, boolean>>({});
  const [availableNow, setAvailableNow] = useState<boolean>(false);
  const [rentalType, setRentalType] = useState<"Any" | "ShortTerm" | "LongTerm">("Any");
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleTypeChange = (type: string, checked: boolean) => {
    setSelectedTypes({
      ...selectedTypes,
      [type]: checked,
    });
  };

  const handleColorChange = (color: string, checked: boolean) => {
    setSelectedColors({
      ...selectedColors,
      [color]: checked,
    });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const applyFilters = () => {
    const filters = {
      make,
      priceRange,
      types: Object.entries(selectedTypes)
        .filter(([_, selected]) => selected)
        .map(([type]) => type),
      colors: Object.entries(selectedColors)
        .filter(([_, selected]) => selected)
        .map(([color]) => color),
      availableNow,
      rentalType,
    };
    onFilterChange(filters);
    setMobileFiltersOpen(false);
  };

  const resetFilters = () => {
    setMake("");
    setPriceRange([20, 100]);
    setSelectedTypes({});
    setSelectedColors({});
    setAvailableNow(false);
    setRentalType("Any");
    onReset();
  };

  // Mobile version of the filters
  const filtersContent = (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Make</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {make
                  ? carMakes.find((carMake) => carMake.value === make)?.label
                  : "Select make"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search make..." />
                <CommandEmpty>No make found.</CommandEmpty>
                <CommandGroup>
                  {carMakes.map((carMake) => (
                    <CommandItem
                      key={carMake.value}
                      value={carMake.value}
                      onSelect={(currentValue) => {
                        setMake(currentValue === make ? "" : currentValue);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          make === carMake.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {carMake.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">
            Price range per day: ${priceRange[0]} - ${priceRange[1]}
          </h3>
          <Slider
            defaultValue={[20, 100]}
            min={0}
            max={200}
            step={5}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="my-6"
          />
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="type">
            <AccordionTrigger className="text-sm font-medium">
              Type
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2">
                {carTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={!!selectedTypes[type.value]}
                      onCheckedChange={(checked) =>
                        handleTypeChange(type.value, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`type-${type.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="color">
            <AccordionTrigger className="text-sm font-medium">
              Color
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2">
                {carColors.map((color) => (
                  <div key={color.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color.value}`}
                      checked={!!selectedColors[color.value]}
                      onCheckedChange={(checked) =>
                        handleColorChange(color.value, !!checked)
                      }
                    />
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.color }}
                      ></div>
                      <Label
                        htmlFor={`color-${color.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {color.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center space-x-2">
          <Switch
            id="available-now"
            checked={availableNow}
            onCheckedChange={setAvailableNow}
          />
          <Label htmlFor="available-now">Available now only</Label>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Rental type</h3>
          <div className="flex space-x-2">
            <Button
              variant={rentalType === "Any" ? "default" : "outline"}
              size="sm"
              onClick={() => setRentalType("Any")}
            >
              Any
            </Button>
            <Button
              variant={rentalType === "ShortTerm" ? "default" : "outline"}
              size="sm"
              onClick={() => setRentalType("ShortTerm")}
            >
              Short-term
            </Button>
            <Button
              variant={rentalType === "LongTerm" ? "default" : "outline"}
              size="sm"
              onClick={() => setRentalType("LongTerm")}
            >
              Long-term
            </Button>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mt-6">
        <Button
          variant="outline"
          className="flex-1"
          onClick={resetFilters}
        >
          Reset
        </Button>
        <Button
          className="flex-1 bg-carrento-blue"
          onClick={applyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop filters */}
      <Card className="hidden md:block sticky top-4">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          </div>
          {filtersContent}
        </CardContent>
      </Card>

      {/* Mobile filters button */}
      <div className="md:hidden sticky top-2 z-10 flex justify-between items-center bg-background p-2 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button
          onClick={() => setMobileFiltersOpen(true)}
          variant="outline"
          className="px-3"
        >
          Filters
        </Button>
      </div>

      {/* Mobile filters panel */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto md:hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {filtersContent}
          </div>
        </div>
      )}
    </>
  );
};

export default CarFilters;
