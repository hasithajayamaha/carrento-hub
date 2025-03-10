
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { reportIncident } from "@/integrations/supabase/booking";

interface IncidentReportFormProps {
  bookingId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const IncidentReportForm: React.FC<IncidentReportFormProps> = ({
  bookingId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  
  // In a real application, this would upload photos to storage
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, we would first upload the photos to storage
      // and then use the storage URLs here
      const photoUrls = photos.map(photo => URL.createObjectURL(photo));
      
      const { error } = await reportIncident(bookingId, {
        details,
        photos: photoUrls
      });
      
      if (error) {
        toast({
          title: "Error Reporting Incident",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Incident Reported",
        description: "Your incident report has been submitted successfully.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error reporting incident:", error);
      toast({
        title: "Error Reporting Incident",
        description: "There was an unexpected error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="details" className="text-base font-medium">
          Incident Details
        </Label>
        <Textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Please describe the incident in detail (what happened, when, where, etc.)"
          required
          className="mt-1"
          rows={6}
        />
      </div>
      
      <div>
        <Label htmlFor="photos" className="text-base font-medium">
          Photos (Optional)
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          Upload photos of the damage or incident to help us process your report faster.
        </p>
        <Input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          className="mt-1"
        />
        
        {photos.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium">{photos.length} photo(s) selected</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative w-20 h-20">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Selected photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Report"}
        </Button>
      </div>
    </form>
  );
};

export default IncidentReportForm;
