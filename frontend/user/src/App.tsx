import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Contact from './pages/Contact';
import ContactLinks from './pages/ContactLinks';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Recharge from './pages/Recharge';
import Topup from './pages/Topup';
import RentPin from './pages/RentPin';
import RentalHistory from './pages/RentalHistory';
import Schedule from './pages/Schedule';
import Book from './pages/Book';
import Station from './pages/Station';
import My from './pages/My';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import MembershipBenefits from './pages/MembershipBenefits';
import FAQ from './pages/FAQ';
import Policies from './pages/Policies';
import NearestStations from './pages/NearestStations';
import SwapHistory from './pages/SwapHistory';
import LinkedBattery from './pages/LinkedBattery';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact-links" element={<ContactLinks />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/membership-benefits" element={<MembershipBenefits />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/policies" element={<Policies />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/recharge" element={<Recharge />} />
            <Route path="/topup" element={<Topup />} />
            <Route path="/rent" element={<RentPin />} />
            <Route path="/history" element={<RentalHistory />} />
            <Route path="/swap-history" element={<SwapHistory />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/book" element={<Book />} />
            <Route path="/station" element={<Station />} />
            <Route path="/my" element={<My />} />
            <Route path="/nearest-stations" element={<NearestStations />} />
            <Route path="/linked-battery" element={<LinkedBattery />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
