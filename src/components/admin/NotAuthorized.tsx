
import React from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

const NotAuthorized: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <MainLayout>
      <div className="h-[70vh] flex flex-col items-center justify-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          You don't have permission to access the admin portal. 
          Please contact an administrator if you believe this is an error.
        </p>
        <Button onClick={() => navigate("/")}>Return to Home</Button>
      </div>
    </MainLayout>
  );
};

export default NotAuthorized;
