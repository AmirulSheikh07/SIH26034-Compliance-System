import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../layout/AppLayout';
import LoginPage from '../../management/auth/LoginPage';
import DashboardPage from '../../management/dashboard/DashboardPage';
import ProductRepository from '../../management/products/ProductRepository';
import ProductDetails from '../../management/products/ProductDetails';
import InspectionHistory from '../../management/inspections/InspectionHistory';
import InspectionDetails from '../../management/inspections/InspectionDetails';
import ReportRepository from '../../management/reports/ReportRepository';
import UserManagement from '../../management/users/UserManagement';
import SettingsPage from '../../management/settings/SettingsPage';
import NewInspectionPage from '../../management/inspections/NewInspectionPage';
import InspectionAnalysisPage from '../../pages/InspectionAnalysisPage';
import InspectionDeclarationsPage from '../../pages/InspectionDeclarationsPage';
import InspectionViolationsPage from '../../pages/InspectionViolationsPage';
import InspectionEvidencePage from '../../pages/InspectionEvidencePage';
import InspectionReviewPage from '../../pages/InspectionReviewPage';
import InspectionReportPage from '../../pages/InspectionReportPage';

// Simple Route Guard to protect administrative sections
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-700">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route Guard to verify Administrator access
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user && user.role !== 'Administrator') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Management & Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Default Route redirects to Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Management Module Views */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductRepository />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="inspections" element={<InspectionHistory />} />
        <Route path="inspections/:id" element={<InspectionDetails />} />
        <Route path="reports" element={<ReportRepository />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Admin-only Routes */}
        <Route 
          path="admin/users" 
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } 
        />

        {/* ---------------------------------------------------- */}
        {/* COMPLIANCE & SCANNING BRIDGES (Other Developer's Views) */}
        {/* ---------------------------------------------------- */}
        <Route path="inspection/new" element={<NewInspectionPage />} />

        {/* REPLACED PLACEHOLDER WITH REAL ANALYSIS PAGE */}
        <Route path="inspection/:id/analysis" element={<InspectionAnalysisPage />} />

        <Route path="inspection/:id/declarations" element={<InspectionDeclarationsPage />} />

        <Route path="inspection/:id/violations" element={<InspectionViolationsPage />} />
        <Route path="inspection/:id/evidence" element={<InspectionEvidencePage />} />
        <Route path="inspection/:id/review" element={<InspectionReviewPage />} />
        <Route path="inspection/:id/report" element={<InspectionReportPage />} />
      </Route>

      {/* Catch-all redirects unauthorized URL hits to login/dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
