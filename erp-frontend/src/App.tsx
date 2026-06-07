import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

import { AppLayout } from "./app/layout/AppLayout";
import { DashboardPage } from "./features/reports/DashboardPage";
import { OrdersPage } from "./features/orders/OrdersPage";
import { CustomersPage } from "./features/customers/CustomersPage";
import { InventoryPage } from "./features/inventory/InventoryPage";
import { LoginPage } from "./features/auth/LoginPage";
import { useAuth } from "./features/auth/auth";

function ProtectedRoutes() {
  const { user, isCheckingAuth } = useAuth();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
        Checking access...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
