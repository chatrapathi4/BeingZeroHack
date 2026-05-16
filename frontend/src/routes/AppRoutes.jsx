// -----------------------------------------
// App Routes Configuration
// Defines all public, protected, and admin routes
// -----------------------------------------
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import GoogleCallbackPage from '../pages/GoogleCallbackPage';
import DashboardPage from '../pages/DashboardPage';
import ProductionPage from '../pages/ProductionPage';
import PaymentsPage from '../pages/PaymentsPage';
import ReportsPage from '../pages/ReportsPage';
import AIAnalyzerPage from '../pages/AIAnalyzerPage';
import ProfilePage from '../pages/ProfilePage';
import RequestsPage from '../pages/RequestsPage';
import OrdersPage from '../pages/OrdersPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminSupportPage from '../pages/AdminSupportPage';
import AdminUserHistoryPage from '../pages/AdminUserHistoryPage';
import AdminOrdersPage from '../pages/AdminOrdersPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      {/* Auth routes (login/register) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes (require login) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/ai-analyzer" element={<AIAnalyzerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/orders" element={<OrdersPage />} />

        {/* Admin-only routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute adminOnly>
              <AdminSupportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute adminOnly>
              <AdminUserHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute adminOnly>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
