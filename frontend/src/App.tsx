import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HotelSearch from './pages/HotelSearch';
import BookingManagement from './pages/BookingManagement';
import RentingManagement from './pages/RentingManagement';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Reports from './pages/Reports';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Box sx={{ display: 'flex' }}>
      <Routes>
        // these are the pages anyone can see
        <Route path="/login" element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
        } />
        <Route path="/register" element={
          !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
        } />

        // this is the main layout with the sidebar
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          // stuff only customers can see
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<HotelSearch />} />
            <Route path="/bookings" element={<BookingManagement />} />
          </Route>

          // stuff only employees can see
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/rentings" element={<RentingManagement />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        // if someone goes to a wrong url, send them home
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Box>
  );
}

export default App;
