import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import EmergencyBuzzer from './components/EmergencyBuzzer';

// Pages
import Home from './pages/home';
import Register from './auth/register';
import Login from './auth/login';
import VolunteerRegister from './volunteer_auth/register';
import VolunteerLogin from './volunteer_auth/login';
import PoliceRegister from './police/PoliceRegister';
import PoliceLogin from './police/PoliceLogin';

// Portals
import WomenDashboard from './pages/WomenDashboard';
import VolunteerDashboard from './volunteer_page/VolunteerDashboard';
import PoliceDashboard from './police/PoliceDashboard';

// Admin
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import ManageWomen from './admin/ManageWomen';
import ManageVolunteers from './admin/ManageVolunteers';
import ManagePolice from './admin/ManagePolice';
import ManageRequests from './admin/ManageRequests';

function App() {
  return (
    <BrowserRouter>
      {/* Global emergency buzzer overlay */}
      <EmergencyBuzzer />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/volunteer-register" element={<VolunteerRegister />} />
        <Route path="/volunteer-login" element={<VolunteerLogin />} />
        <Route path="/police-register" element={<PoliceRegister />} />
        <Route path="/police-login" element={<PoliceLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Women Protected Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['women']}>
              <WomenDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Volunteer Protected Route */}
        <Route 
          path="/volunteer-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <VolunteerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Police Protected Route */}
        <Route 
          path="/police-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['police']}>
              <PoliceDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Protected Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/women" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageWomen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/volunteers" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageVolunteers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/police" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManagePolice />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/requests" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageRequests />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
