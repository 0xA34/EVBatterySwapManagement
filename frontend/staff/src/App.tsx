import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import NotFound from "./pages/OtherPage/NotFound";
import BatteryInventory from "./pages/BatteryInventory";
import StationManagement from "./pages/StationManagement";
import StationDetail from "./pages/StationDetail";
import BatterySwap from "./pages/BatterySwap";
import SwapHistory from "./pages/SwapHistory";
import Revenue from "./pages/Revenue";
import Profile from "./pages/Profile";
import Login from "./pages/Auth/Login";

import ProtectedRoute from "./components/common/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />


            {/* Protected Dashboard Layout */}
            <Route element={<ProtectedRoute allowedRoles={["STAFF"]} />}>
              <Route element={<AppLayout />}>
                <Route index path="/" element={<Navigate to="/inventory" replace />} />
                <Route path="/inventory" element={<BatteryInventory />} />
                <Route path="/stations" element={<StationManagement />} />
                <Route path="/stations/:id" element={<StationDetail />} />
                <Route path="/swap" element={<BatterySwap />} />
                <Route path="/swap-history" element={<SwapHistory />} />
                <Route path="/revenue" element={<Revenue />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
