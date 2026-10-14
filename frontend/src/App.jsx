import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './auth/context/AuthContext';
import ProtectedRoute from './auth/components/ProtectedRoute';
import PublicRoute from './auth/components/PublicRoute';
import Login from './auth/pages/Login';
import Signup from './auth/pages/Signup';
import ForgotPassword from './auth/pages/ForgotPassword';
import ResetPassword from './auth/pages/ResetPassword';
import LandingPage from './landing/LandingPage';
import GetStartedPage from './landing/GetStartedPage';
import DownloadPage from './landing/DownloadPage';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import Farmers from './admin/pages/Farmers';
import Devices from './admin/pages/Devices';
import ReportsAnalytics from './admin/pages/ReportsAnalytics';
import ActivityLog from './admin/pages/ActivityLog';
import AdminSettings from './admin/pages/AdminSettings';
import { AdminPreferencesProvider } from './admin/context/AdminPreferencesContext';
import AdminPageBoundary from './admin/components/AdminPageBoundary';
import { rememberAdminPath } from './auth/adminReturnPath';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  return null;
}

// Router guards are the source of truth. Back/Forward or direct URL entry
// cannot expose the public pages while an approved administrator is signed in.
function AdminShell() {
  const { pathname } = useLocation();
  useEffect(() => { rememberAdminPath(pathname); }, [pathname]);
  return <ProtectedRoute>
    <AdminPageBoundary>
      <AdminPreferencesProvider>
        <AdminLayout />
      </AdminPreferencesProvider>
    </AdminPageBoundary>
  </ProtectedRoute>;
}

export default function App() {
  return <BrowserRouter>
    <ScrollToTop />
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/get-started" element={<PublicRoute><GetStartedPage /></PublicRoute>} />
        <Route path="/download" element={<PublicRoute><DownloadPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="farmers" element={<Farmers />} />
          <Route path="devices" element={<Devices />} />
          <Route path="reports" element={<ReportsAnalytics />} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="business" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        <Route path="*" element={<PublicRoute><Navigate to="/" replace /></PublicRoute>} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>;
}
