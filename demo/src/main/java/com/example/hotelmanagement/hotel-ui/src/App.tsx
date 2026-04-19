import AdminLayout from './components/Layout/AdminLayout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Rooms from './pages/Rooms.tsx';
import Bookings from './pages/Bookings.tsx';
import Login from './pages/Login.tsx';
import Cleaning from './pages/Cleaning.tsx';
import Services from './pages/Services.tsx';
import GuestManagement from './pages/GuestManagement.tsx';
import CustomerPortal from './pages/CustomerPortal.tsx';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/portal" element={<CustomerPortal />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="guests" element={<GuestManagement />} />
          <Route path="cleaning" element={<Cleaning />} />
          <Route path="services" element={<Services />} />
        </Route>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;