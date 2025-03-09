
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Download, Check, AlertCircle } from "lucide-react";

const agreements = [
  {
    id: "a1",
    title: "Car Listing Agreement",
    description: "Terms and conditions for listing your car on CarRento platform",
    status: "Signed",
    date: "2023-01-15",
    documentUrl: "#"
  },
  {
    id: "a2",
    title: "Service Center Authorization",
    description: "Authorization for CarRento service center to perform maintenance",
    status: "Signed",
    date: "2023-01-15",
    documentUrl: "#"
  },
  {
    id: "a3",
    title: "2023 Rate Schedule Update",
    description: "Updated pricing structure and commission rates for 2023",
    status: "Pending",
    date: "",
    documentUrl: "#"
  },
  {
    id: "a4",
    title: "Insurance Policy Acknowledgment",
    description: "Acknowledgment of insurance coverage during rental periods",
    status: "Signed",
    date: "2023-01-15",
    documentUrl: "#"
  }
];

const Agreements: React.FC = () => {
  const [agreed, setAgreed] = useState(false);
  const [signedAgreements, setSignedAgreements] = useState<string[]>(
    agreements.filter(a => a.status === "Signed").map(a => a.id)
  );
  
  const handleSignAgreement = (agreementId: string) => {
    if (agreed) {
      setSignedAgreements(prev => [...prev, agreementId]);
      setAgreed(false);
    }
  };
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not signed";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agreement Status</CardTitle>
          <CardDescription>Review and sign your car owner agreements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agreements.map(agreement => (
              <Card key={agreement.id} className="border border-muted">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="mr-4 bg-primary/10 p-2 rounded">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{agreement.title}</h4>
                        <p className="text-sm text-muted-foreground">{agreement.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {signedAgreements.includes(agreement.id) ? (
                        <>
                          <div className="text-sm text-muted-foreground">
                            Signed: {formatDate(agreement.date || new Date().toISOString())}
                          </div>
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Signed
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button>Sign Agreement</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{agreement.title}</DialogTitle>
                              <DialogDescription>
                                Please review the agreement carefully before signing
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="my-6 border p-4 rounded-md bg-muted/30 h-64 overflow-auto">
                              <h3 className="font-bold text-lg mb-2">AGREEMENT TERMS</h3>
                              <p className="mb-4">This agreement is made between the car owner ("Owner") and CarRento ("Company").</p>
                              
                              <h4 className="font-bold mb-1">1. VEHICLE LISTING</h4>
                              <p className="mb-4">Owner agrees to list their vehicle on the CarRento platform for a minimum period of 1 year.</p>
                              
                              <h4 className="font-bold mb-1">2. PRICING AND PAYMENTS</h4>
                              <p className="mb-4">CarRento will set all pricing for rentals. Owner cannot set prices or approve/deny rentals. CarRento will pay Owner monthly for completed rentals after deducting the agreed commission rate.</p>
                              
                              <h4 className="font-bold mb-1">3. MAINTENANCE</h4>
                              <p className="mb-4">All maintenance will be performed by CarRento's service center. Costs will be billed to the Owner directly or deducted from rental earnings.</p>
                              
                              <h4 className="font-bold mb-1">4. AVAILABILITY</h4>
                              <p className="mb-4">Vehicle must be available for the entire agreed listing period. Owner cannot set blackout dates.</p>
                              
                              <h4 className="font-bold mb-1">5. RENTAL PERIODS</h4>
                              <p className="mb-4">Minimum rental period is 2 weeks. Preferred minimum is 3 months. CarRento defines Short-term as 2 weeks to less than 3 months, and Long-term as 3+ months.</p>
                              
                              <h4 className="font-bold mb-1">6. INSURANCE</h4>
                              <p className="mb-4">CarRento provides insurance coverage during active rental periods. Owner must maintain their own insurance when vehicle is not rented.</p>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-4">
                              <Checkbox 
                                id="agreement" 
                                checked={agreed}
                                onCheckedChange={(checked) => setAgreed(checked as boolean)} 
                              />
                              <Label htmlFor="agreement">
                                I have read and agree to the terms of this agreement
                              </Label>
                            </div>
                            
                            <DialogFooter>
                              <Button 
                                onClick={() => handleSignAgreement(agreement.id)}
                                disabled={!agreed}
                              >
                                Sign Agreement
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="mr-4">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800">Important Notice About Agreements</h3>
              <p className="text-sm text-amber-700 mt-1">
                All agreements must be signed for your vehicles to remain active on the CarRento platform. 
                Unsigned agreements may result in temporary suspension of your listings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Agreement Details</CardTitle>
          <CardDescription>Understanding your contractual obligations</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>All agreements are legally binding once signed</li>
            <li>Agreements outline the responsibilities of both car owners and CarRento</li>
            <li>Digital signatures are legally valid and equivalent to physical signatures</li>
            <li>You may download copies of signed agreements for your records</li>
            <li>New agreements may be required for policy updates or regulatory changes</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Contact Legal Department
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Agreements;
