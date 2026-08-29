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
        <Route
          path="inspection/new"
          element={
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center max-w-xl mx-auto mt-12 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900">New Product Scan</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                This is the packaging scanning, image upload, and OCR text extraction view. This module is managed by your partner.
              </p>
            </div>
          }
        />
        <Route
          path="inspection/:id/analysis"
          element={
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center max-w-xl mx-auto mt-12 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900">Label Analysis View</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Visualizing the OCR data segmentation outputs. This module is managed by your partner.
              </p>
            </div>
          }
        />
        <Route
          path="inspection/:id/declarations"
          element={
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center max-w-xl mx-auto mt-12 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900">Mandatory Declarations Verification</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Audit list showing passed and failed metrology fields. This module is managed by your partner.
              </p>
            </div>
          }
        />
        <Route
          path="inspection/:id/violations"
          element={
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center max-w-xl mx-auto mt-12 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900">Flagged Label Violations</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Reviewing critical metrology errors detected on the package layout. This module is managed by your partner.
              </p>
            </div>
          }
        />
        <Route
          path="inspection/:id/evidence"
          element={
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center max-w-xl mx-auto mt-12 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900">Audit Evidence Viewer</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Highlights specific text zones and measures character height. This module is managed by your partner.
              </p>
            </div>
          }
        />
        <Route
          path="inspection/:id/review"
          element={
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center max-w-xl mx-auto mt-12 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900">Manual Review Panel</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Reviewer validation sandbox for manual override checks. This module is managed by your partner.
              </p>
            </div>
          }
        />
        <Route
          path="inspection/:id/report"
          element={
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center max-w-xl mx-auto mt-12 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900">Seizure Memo & Report Preview</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                PDF document preview and digital signature sign-off. This module is managed by your partner.
              </p>
            </div>
          }
        />
      </Route>

      {/* Catch-all redirects unauthorized URL hits to login/dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
