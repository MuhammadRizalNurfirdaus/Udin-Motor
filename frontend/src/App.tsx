import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AuthCallback from './pages/auth/AuthCallback';

// User Pages
import HomePage from './pages/user/HomePage';
import MotorListPage from './pages/user/MotorListPage';
import MyOrders from './pages/user/MyOrders';

// Owner Pages
import OwnerDashboard from './pages/owner/Dashboard';
import MotorManagement from './pages/owner/MotorManagement';
import StaffManagement from './pages/owner/StaffManagement';
import TransactionList from './pages/owner/TransactionList';
import Reports from './pages/owner/Reports';

// Cashier Pages
import CashierDashboard from './pages/cashier/Dashboard';
import TransactionPage from './pages/cashier/TransactionPage';
import DeliveryManagement from './pages/cashier/DeliveryManagement';

// Driver Pages
import DriverDashboard from './pages/driver/Dashboard';
import DeliveryPage from './pages/driver/DeliveryPage';

import './index.css';

// Protected Route Component
function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = {
      OWNER: '/owner',
      CASHIER: '/cashier',
      DRIVER: '/driver',
      USER: '/'
    }[user.role] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

// Layout with Navbar
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Auth Routes - No Navbar */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Public Routes */}
      <Route path="/" element={
        <Layout>
          {user?.role === 'OWNER' ? <Navigate to="/owner" replace /> :
            user?.role === 'CASHIER' ? <Navigate to="/cashier" replace /> :
              user?.role === 'DRIVER' ? <Navigate to="/driver" replace /> :
                <HomePage />}
        </Layout>
      } />
      <Route path="/motors" element={<Layout><MotorListPage /></Layout>} />

      {/* User Routes */}
      <Route path="/orders" element={
        <ProtectedRoute roles={['USER']}>
          <Layout><MyOrders /></Layout>
        </ProtectedRoute>
      } />

      {/* Owner Routes */}
      <Route path="/owner" element={
        <ProtectedRoute roles={['OWNER']}>
          <Layout><OwnerDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/owner/motors" element={
        <ProtectedRoute roles={['OWNER']}>
          <Layout><MotorManagement /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/owner/staff" element={
        <ProtectedRoute roles={['OWNER']}>
          <Layout><StaffManagement /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/owner/transactions" element={
        <ProtectedRoute roles={['OWNER']}>
          <Layout><TransactionList /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/owner/reports" element={
        <ProtectedRoute roles={['OWNER']}>
          <Layout><Reports /></Layout>
        </ProtectedRoute>
      } />

      {/* Cashier Routes */}
      <Route path="/cashier" element={
        <ProtectedRoute roles={['CASHIER']}>
          <Layout><CashierDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/cashier/transactions" element={
        <ProtectedRoute roles={['CASHIER']}>
          <Layout><TransactionPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/cashier/deliveries" element={
        <ProtectedRoute roles={['CASHIER']}>
          <Layout><DeliveryManagement /></Layout>
        </ProtectedRoute>
      } />

      {/* Driver Routes */}
      <Route path="/driver" element={
        <ProtectedRoute roles={['DRIVER']}>
          <Layout><DriverDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/driver/deliveries" element={
        <ProtectedRoute roles={['DRIVER']}>
          <Layout><DeliveryPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
