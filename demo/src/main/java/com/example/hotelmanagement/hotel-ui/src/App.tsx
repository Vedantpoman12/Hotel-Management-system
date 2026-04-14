import AdminLayout from './components/Layout/AdminLayout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Rooms from './pages/Rooms.tsx';
import Bookings from './pages/Bookings.tsx';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="bookings" element={<Bookings />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;