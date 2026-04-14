import './BottomNav.css';

const NAV_ITEMS = [
  { id: 'dashboard',    icon: 'dashboard',      label: 'Dashboard' },
  { id: 'reservations', icon: 'calendar_month', label: 'Bookings' },
  { id: 'rooms',        icon: 'bed',            label: 'Rooms' },
  { id: 'reports',      icon: 'analytics',      label: 'Reports' },
];

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => {
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            className={`bn-item${isActive ? ' bn-item--active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="material-symbols-outlined bn-icon">{item.icon}</span>
            <span className="bn-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
