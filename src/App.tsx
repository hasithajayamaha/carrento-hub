
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import IndexPage from './pages/IndexPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CarOwnerPortal from './pages/CarOwnerPortal';
import CustomerPortal from './pages/CustomerPortal';
import CarsPage from './pages/CarsPage';
import BookingPage from './pages/BookingPage';
import AdminPortal from './pages/AdminPortal';
import ServiceCenterPortal from './pages/ServiceCenterPortal';

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Customer", "CarOwner", "Admin", "SuperAdmin"]}>
                <CustomerPortal />
              </ProtectedRoute>
            }
          />
          
          {/* Car Owner Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={["CarOwner", "Admin", "SuperAdmin"]}>
                <CarOwnerPortal />
              </ProtectedRoute>
            }
          />
          
          {/* Car Listings */}
          <Route path="/cars" element={<CarsPage />} />
          
          {/* Booking Flow */}
          <Route
            path="/booking/:carId"
            element={
              <ProtectedRoute allowedRoles={["Customer", "CarOwner", "Admin", "SuperAdmin"]}>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Portal */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["Admin", "SuperAdmin", "SupportStaff"]}>
                <AdminPortal />
              </ProtectedRoute>
            }
          />
          
          {/* Service Center Portal */}
          <Route
            path="/service/*"
            element={
              <ProtectedRoute allowedRoles={["ServiceCenterStaff", "Admin", "SuperAdmin"]}>
                <ServiceCenterPortal />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
