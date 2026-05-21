import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import NotFound from "./pages/OtherPage/NotFound";
import BatteryInventory from "./pages/BatteryInventory";
import BatterySwap from "./pages/BatterySwap";
import Login from "./pages/Auth/Login";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Navigate to="/inventory" replace />} />
              <Route path="/inventory" element={<BatteryInventory />} />
              <Route path="/swap" element={<BatterySwap />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
