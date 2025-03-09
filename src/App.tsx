
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import CarsPage from "./pages/CarsPage";
import Dashboard from "./pages/Dashboard";
import CarOwnerPortal from "./pages/CarOwnerPortal";
import CustomerPortal from "./pages/CustomerPortal";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider } from "./components/ui/sidebar";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <SidebarProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/auth" element={<AuthPage />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/cars" element={
                  <ProtectedRoute>
                    <CarsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/owner/*" element={
                  <ProtectedRoute allowedRoles={["CarOwner", "Admin", "SuperAdmin"]}>
                    <CarOwnerPortal />
                  </ProtectedRoute>
                } />
                
                <Route path="/customer/*" element={
                  <ProtectedRoute allowedRoles={["Customer", "Admin", "SuperAdmin"]}>
                    <CustomerPortal />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
