import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/common/Navbar';

// Guide Pages
import { HomePage } from './pages/HomePage';
import { PlateTypesPage } from './pages/PlateTypesPage';
import { StatesDirectoryPage } from './pages/StatesDirectoryPage';
import { RTODirectoryPage } from './pages/RTODirectoryPage';
import { PlateDecoderPage } from './pages/PlateDecoderPage';
import { PlateVisualizerPage } from './pages/PlateVisualizerPage';
import { StateExplorerPage } from './pages/StateExplorerPage';
import { AboutFAQPage } from './pages/AboutFAQPage';
import { AdminRTOPage } from './pages/AdminRTOPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scanner & Operations Pages
import { LoginPage } from './pages/LoginPage';
import { MobileScanPage } from './pages/MobileScanPage';
import { DashboardPage } from './pages/DashboardPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { AlertsPage } from './pages/AlertsPage';
import { TimelineMapPage } from './pages/TimelineMapPage';
import { AuditPage } from './pages/AuditPage';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="pb-12">{children}</main>
    </>
  );
};

export default function App() {
  React.useEffect(() => {
    // Silent warm-up ping to wake up cloud backend (prevents Render free-tier cold starts)
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const target = apiUrl ? `${apiUrl.replace(/\/$/, '')}/api/health` : '/api/health';
      fetch(target, { method: 'GET', mode: 'cors', keepalive: true }).catch(() => {});
    } catch (e) {}
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E17] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
          <Routes>
            {/* Public Guide & Explorer Routes */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <main><HomePage /></main>
                </>
              }
            />

            <Route
              path="/plate-types"
              element={
                <>
                  <Navbar />
                  <main><PlateTypesPage /></main>
                </>
              }
            />

            <Route
              path="/states"
              element={
                <>
                  <Navbar />
                  <main><StatesDirectoryPage /></main>
                </>
              }
            />

            <Route
              path="/rto-directory"
              element={
                <>
                  <Navbar />
                  <main><RTODirectoryPage /></main>
                </>
              }
            />

            <Route
              path="/decoder"
              element={
                <>
                  <Navbar />
                  <main><PlateDecoderPage /></main>
                </>
              }
            />

            <Route
              path="/visualizer"
              element={
                <>
                  <Navbar />
                  <main><PlateVisualizerPage /></main>
                </>
              }
            />

            <Route
              path="/map-explorer"
              element={
                <>
                  <Navbar />
                  <main><StateExplorerPage /></main>
                </>
              }
            />

            <Route
              path="/about"
              element={
                <>
                  <Navbar />
                  <main><AboutFAQPage /></main>
                </>
              }
            />

            <Route
              path="/admin/rto"
              element={
                <>
                  <Navbar />
                  <main><AdminRTOPage /></main>
                </>
              }
            />

            {/* AI ANPR Scanner Route */}
            <Route
              path="/scan"
              element={
                <>
                  <Navbar />
                  <main className="pb-12"><MobileScanPage /></main>
                </>
              }
            />

            {/* Auth & Field Ops Routes */}
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <TimelineMapPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vehicles"
              element={
                <ProtectedRoute>
                  <VehiclesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <AlertsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AuditPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <main><NotFoundPage /></main>
                </>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
