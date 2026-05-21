import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

// EV Battery Swap Pages
import StationManagement from "./pages/EVBattery/StationManagement";
import UserManagement from "./pages/EVBattery/UserManagement";
import SubscriptionManagement from "./pages/EVBattery/SubscriptionManagement";
import ReportsDashboard from "./pages/EVBattery/ReportsDashboard";
import UserProfiles from "./pages/UserProfiles";
import AccountSettings from "./pages/AccountSettings";
import Support from "./pages/Support";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* EV Battery Swap */}
            <Route path="/stations" element={<StationManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/subscriptions" element={<SubscriptionManagement />} />
            <Route path="/reports" element={<ReportsDashboard />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/support" element={<Support />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
