import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { ProductRequests } from './pages/ProductRequests';
import { Invoices } from './pages/Invoices';
import { SalesTracking } from './components/DirectRepresentative/SalesTracking';
import { InventoryOverview } from './components/Inventory/InventoryOverview';
import { CustomerManagement } from './components/Customers/CustomerManagement';
import { SalesAnalytics } from './components/Analytics/SalesAnalytics';
import { UserSettings } from './components/Settings/UserSettings';

// Role-specific dashboards
import { DRDashboard } from './pages/DirectRepresentative/DRDashboard';
import { DSManagerDashboard } from './pages/DirectShowroom/DSManagerDashboard';
import { DSStaffDashboard } from './pages/DirectShowroom/DSStaffDashboard';
import { DistributorDashboard } from './pages/Distributor/DistributorDashboard';
import { DistributorRepDashboard } from './pages/Distributor/DistributorRepDashboard';
import { HODashboard } from './pages/Management/HODashboard';
import { AdminDashboard } from './pages/Management/AdminDashboard';
import { useAuth } from './context/AuthContext';

function DashboardRouter() {
  const { userData } = useAuth();
  
  if (!userData) return null;
  
  switch (userData.role) {
    case 'DirectRepresentative':
      return <DRDashboard />;
    case 'DirectShowroomManager':
      return <DSManagerDashboard />;
    case 'DirectShowroomStaff':
      return <DSStaffDashboard />;
    case 'Distributor':
      return <DistributorDashboard />;
    case 'DistributorRepresentative':
      return <DistributorRepDashboard />;
    case 'HeadOfOperations':
      return <HODashboard />;
    case 'MainDirector':
      return <HODashboard />;
    case 'Admin':
      return <AdminDashboard />;
    // Temporary: Allow existing system roles to access for testing
    case 'WarehouseStaff':
    case 'ProductionManager':
    case 'FinishedGoodsStoreManager':
    case 'PackingAreaManager':
      return <AdminDashboard />;
    default:
      return <DRDashboard />;
  }
}

function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardRouter />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute allowedRoles={['DirectRepresentative', 'DirectShowroomManager', 'Distributor', 'DistributorRepresentative', 'HeadOfOperations', 'MainDirector', 'Admin']}>
                  <Layout>
                    <ProductRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute allowedRoles={['DirectRepresentative', 'DirectShowroomManager', 'DirectShowroomStaff', 'Distributor', 'DistributorRepresentative', 'HeadOfOperations', 'MainDirector', 'Admin']}>
                  <Layout>
                    <Invoices />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SalesTracking />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={['DirectShowroomManager', 'DirectShowroomStaff', 'Distributor', 'HeadOfOperations', 'MainDirector', 'Admin']}>
                  <Layout>
                    <InventoryOverview />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute allowedRoles={['DirectRepresentative', 'DirectShowroomManager', 'DirectShowroomStaff', 'Distributor']}>
                  <Layout>
                    <CustomerManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['HeadOfOperations', 'MainDirector', 'Admin']}>
                  <Layout>
                    <SalesAnalytics />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserSettings />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </OfflineProvider>
    </AuthProvider>
  );
}

export default App;