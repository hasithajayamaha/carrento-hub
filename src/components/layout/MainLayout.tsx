
import React from "react";
import MainSidebar from "./MainSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex w-full">
      <MainSidebar />
      <main className="flex-1 p-4 md:p-6 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
