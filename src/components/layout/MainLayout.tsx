
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import MainSidebar from "./MainSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MainSidebar />
        <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
