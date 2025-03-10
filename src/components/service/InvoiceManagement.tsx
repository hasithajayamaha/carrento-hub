import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Search, Plus, FileText, Download, Check, CalendarIcon } from "lucide-react";

const invoiceFormSchema = z.object({
  maintenanceIds: z.array(z.string()).min(1, {
    message: "Please select at least one maintenance record",
  }),
  invoiceDate: z.date({
    required_error: "Please select an invoice date",
  }),
  dueDate: z.date({
    required_error: "Please select a due date",
  }),
  invoiceNumber: z.string().min(1, {
    message: "Invoice number is required",
  }),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const InvoiceManagement: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaintenanceIds, setSelectedMaintenanceIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceDate: new Date(),
      dueDate: addDays(new Date(), 30),
      maintenanceIds: [],
    }
  });
  
  const { data: completedMaintenance = [] } = useQuery({
    queryKey: ['completedMaintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select(`
          id, type, description, date, cost,
          cars(id, make, model, year, owner_id),
          profiles!cars(full_name)
        `)
        .eq('status', 'Completed')
        .is('invoice_number', null)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('maintenance')
        .select(`
          id, invoice_number, invoice_date, invoice_status, invoice_amount, type, 
          cars(id, make, model, year, owner_id),
          profiles!cars(full_name)
        `)
        .not('invoice_number', 'is', null)
        .order('invoice_date', { ascending: false });
      
      if (searchQuery) {
        query = query.or(`invoice_number.ilike.%${searchQuery}%,cars.make.ilike.%${searchQuery}%,profiles.full_name.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const groupedInvoices = (data || []).reduce((acc, curr) => {
        const key = curr.invoice_number || '';
        if (!acc[key]) {
          acc[key] = {
            invoiceNumber: curr.invoice_number,
            invoiceDate: curr.invoice_date,
            status: curr.invoice_status,
            amount: curr.invoice_amount,
            owner: curr.profiles?.full_name,
            ownerId: curr.cars?.owner_id,
            items: []
          };
        }
        
        acc[key].items.push({
          id: curr.id,
          type: curr.type,
          car: `${curr.cars?.make || ''} ${curr.cars?.model || ''} (${curr.cars?.year || ''})`,
          amount: curr.invoice_amount
        });
        
        return acc;
      }, {} as Record<string, any>);
      
      return Object.values(groupedInvoices);
    }
  });
  
  const generateInvoiceMutation = useMutation({
    mutationFn: async (values: InvoiceFormValues) => {
      const { maintenanceIds, invoiceDate, dueDate, invoiceNumber, notes } = values;
      
      const { data: maintenanceRecords, error: fetchError } = await supabase
        .from('maintenance')
        .select('id, cost')
        .in('id', maintenanceIds);
      
      if (fetchError) throw fetchError;
      
      const totalAmount = (maintenanceRecords || []).reduce(
        (sum, record) => sum + (record.cost || 0), 0
      );
      
      const invoiceDetails = {
        dueDate: dueDate.toISOString(),
        notes,
        maintenanceIds
      };
      
      const updates = maintenanceIds.map(id => ({
        id,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate.toISOString(),
        invoice_status: 'Pending',
        invoice_amount: totalAmount / maintenanceIds.length,
        invoice_details: invoiceDetails
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('maintenance')
          .update({
            invoice_number: update.invoice_number,
            invoice_date: update.invoice_date,
            invoice_status: update.invoice_status,
            invoice_amount: update.invoice_amount,
            invoice_details: update.invoice_details
          })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      return updates;
    },
    onSuccess: () => {
      toast.success("Invoice generated successfully");
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['completedMaintenance'] });
      setShowDialog(false);
      setSelectedMaintenanceIds([]);
      reset();
    },
    onError: (error) => {
      toast.error(`Error generating invoice: ${error.message}`);
    }
  });
  
  const markAsPaidMutation = useMutation({
    mutationFn: async (invoiceNumber: string) => {
      const { data, error } = await supabase
        .from('maintenance')
        .update({ invoice_status: 'Paid' })
        .eq('invoice_number', invoiceNumber)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Invoice marked as paid");
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error) => {
      toast.error(`Error updating invoice: ${error.message}`);
    }
  });
  
  const handleMaintenanceSelection = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedMaintenanceIds(prev => [...prev, id]);
    } else {
      setSelectedMaintenanceIds(prev => prev.filter(item => item !== id));
    }
  };
  
  React.useEffect(() => {
    setValue('maintenanceIds', selectedMaintenanceIds);
  }, [selectedMaintenanceIds, setValue]);
  
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${randomDigits}`;
  };
  
  React.useEffect(() => {
    if (showDialog) {
      setValue('invoiceNumber', generateInvoiceNumber());
    }
  }, [showDialog, setValue]);
  
  const onSubmit = (data: InvoiceFormValues) => {
    generateInvoiceMutation.mutate(data);
  };
  
  const handleMarkAsPaid = (invoiceNumber: string) => {
    markAsPaidMutation.mutate(invoiceNumber);
  };
  
  const getInvoiceUrl = (invoice: any) => {
    return `#invoice-${invoice.invoiceNumber}`;
  };
  
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "MMM d, yyyy");
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoice Management</h2>
        <div className="flex space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Generate Invoice
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingInvoices ? (
            <div className="text-center py-8">Loading...</div>
          ) : invoices?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found
            </div>
          ) : (
            <div className="space-y-4">
              {invoices?.map((invoice) => (
                <div key={invoice.invoiceNumber} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                        <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                      </div>
                      <p className="text-sm mt-1">Customer: {invoice.owner}</p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>Invoice date: {formatDate(invoice.invoiceDate)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </div>
                      <div className="text-lg font-medium">${invoice.amount}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 border-t pt-3">
                    <h5 className="text-sm font-medium mb-2">Services:</h5>
                    <div className="space-y-1 text-sm">
                      {invoice.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.car} - {item.type}</span>
                          <span>${item.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end space-x-2">
                    <a 
                      href={getInvoiceUrl(invoice)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-gray-300 hover:bg-gray-50"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </a>
                    
                    {invoice.status === 'Pending' && (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleMarkAsPaid(invoice.invoiceNumber)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Create an invoice for completed maintenance services.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Services to Invoice</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                  {completedMaintenance?.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">
                      No uninvoiced services available
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {completedMaintenance?.map((maintenance) => (
                        <div key={maintenance.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                          <Checkbox 
                            id={maintenance.id} 
                            checked={selectedMaintenanceIds.includes(maintenance.id)}
                            onCheckedChange={(checked) => 
                              handleMaintenanceSelection(maintenance.id, checked as boolean)
                            }
                          />
                          <label 
                            htmlFor={maintenance.id}
                            className="flex-1 flex justify-between cursor-pointer text-sm"
                          >
                            <span>
                              {maintenance.cars?.make} {maintenance.cars?.model} - {maintenance.type}
                              <span className="block text-xs text-muted-foreground">
                                Owner: {maintenance.profiles?.full_name}
                              </span>
                            </span>
                            <span className="font-medium">${maintenance.cost || 0}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.maintenanceIds && (
                  <p className="text-sm text-red-500">{errors.maintenanceIds.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    {...register("invoiceNumber")}
                    readOnly
                  />
                  {errors.invoiceNumber && (
                    <p className="text-sm text-red-500">{errors.invoiceNumber.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Controller
                    name="invoiceDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "MMM d, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.invoiceDate && (
                    <p className="text-sm text-red-500">{errors.invoiceDate.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "MMM d, yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-500">{errors.dueDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Payment instructions or additional notes"
                  {...register("notes")}
                />
              </div>
              
              <div className="py-2 text-sm">
                <p className="font-medium">Total Amount: ${
                  completedMaintenance
                    ?.filter(m => selectedMaintenanceIds.includes(m.id))
                    .reduce((sum, m) => sum + (m.cost || 0), 0)
                    .toFixed(2)
                }</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={generateInvoiceMutation.isPending || selectedMaintenanceIds.length === 0}
              >
                {generateInvoiceMutation.isPending ? "Generating..." : "Generate Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceManagement;
