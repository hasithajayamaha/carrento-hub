
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import CarsPage from "./pages/CarsPage";
import Dashboard from "./pages/Dashboard";
import CarOwnerPortal from "./pages/CarOwnerPortal";
import CustomerPortal from "./pages/CustomerPortal";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cars" element={<CarsPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/owner/*" element={<CarOwnerPortal />} />
              <Route path="/customer/*" element={<CustomerPortal />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
