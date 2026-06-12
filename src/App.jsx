import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';

// Component layout components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import RequestBlood from './pages/RequestBlood';
import BloodRequests from './pages/BloodRequests';
import AiRecommendation from './pages/AiRecommendation';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Route blocker for authentication and roles
const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Route blocker to prevent logged-in users from hitting login pages
const PublicOnlyRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Layout for general public page flow
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg-light dark:bg-bg-dark transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Layout for authenticated panel screens (shows the Sidebar)
const AuthenticatedLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg-light dark:bg-bg-dark transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1 w-full max-w-7xl mx-auto items-stretch">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Pages Layout */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                
                {/* Auth screens (only when logged out) */}
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>
              </Route>

              {/* Private Dashboard Screens (only when logged in) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AuthenticatedLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/request" element={<RequestBlood />} />
                  <Route path="/blood-requests" element={<BloodRequests />} />
                  <Route path="/ai-recommend" element={<AiRecommendation />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Super admin panel */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<AdminPanel />} />
                  </Route>
                </Route>
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
