import './PlaceholderPage.css';

const PAGE_CONFIG = {
  reservations: { icon: 'calendar_month', title: 'Reservations',      desc: 'Manage bookings, availability, and check-in calendar.' },
  rooms:        { icon: 'bed',            title: 'Room Management',   desc: 'View room status, set pricing, and update room details.' },
  reports:      { icon: 'analytics',      title: 'Reports & Analytics',desc: 'Revenue trends, occupancy insights, and business KPIs.' },
  guests:       { icon: 'person',         title: 'Guest Profiles',    desc: 'Guest history, preferences, and loyalty data.' },
  settings:     { icon: 'settings',       title: 'Settings',          desc: 'System configuration, user roles, and integrations.' },
};

export default function PlaceholderPage({ page }) {
  const cfg = PAGE_CONFIG[page] || { icon: 'widgets', title: 'Coming Soon', desc: 'This section is under development.' };

  return (
    <div className="ph-page anim-fade">
      <div className="ph-card">
        <div className="ph-icon">
          <span className="material-symbols-outlined">{cfg.icon}</span>
        </div>
        <h2 className="ph-title">{cfg.title}</h2>
        <p className="ph-desc">{cfg.desc}</p>
        <div className="ph-badge">Coming Soon</div>
      </div>
    </div>
  );
}
