import { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import ReservationsPage from './pages/ReservationsPage';
import RoomsPage from './pages/RoomsPage';
import ReportsPage from './pages/ReportsPage';
import PlaceholderPage from './pages/PlaceholderPage';
import { useToast } from './components/Toast';
import './index.css';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const { addToast, ToastContainer } = useToast();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard        onToast={addToast} />;
      case 'reservations': return <ReservationsPage onToast={addToast} />;
      case 'rooms':        return <RoomsPage        onToast={addToast} />;
      case 'reports':      return <ReportsPage      onToast={addToast} />;
      default:             return <PlaceholderPage  page={activePage} />;
    }
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="page-body">{renderPage()}</main>
      <BottomNav activePage={activePage} onNavigate={setActivePage} />
      <ToastContainer />
    </div>
  );
}
