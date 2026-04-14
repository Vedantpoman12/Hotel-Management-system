import { useState, useEffect, useCallback } from 'react';
import { getBookings, getRooms, getStats } from '../api/hotelApi';
import './ReportsPage.css';

/* ─── Helpers ────────────────────────────────────────────────── */
function Skeleton({ h = 20, w = '100%', r = 8 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r, flexShrink: 0,
      background: 'linear-gradient(90deg,#ebeef0 25%,#f2f4f5 50%,#ebeef0 75%)',
      backgroundSize: '600px 100%', animation: 'shimmer 1.4s ease infinite',
    }} />
  );
}

/* ─── Mini Bar Chart ─────────────────────────────────────────── */
function BarChart({ data, color = 'var(--clr-primary)' }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="rpt-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="rpt-bar-col">
          <div className="rpt-bar-track">
            <div
              className="rpt-bar-fill"
              style={{ height: `${(d.value / max) * 100}%`, background: color }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="rpt-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Donut Chart (pure CSS) ─────────────────────────────────── */
function DonutChart({ pct, color, label }) {
  const r = 40, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="rpt-donut-wrap">
      <svg viewBox="0 0 100 100" className="rpt-donut-svg">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--clr-surface-container)" strokeWidth="12" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray .8s ease' }}
        />
      </svg>
      <div className="rpt-donut-center">
        <span className="rpt-donut-val">{pct}%</span>
        <span className="rpt-donut-label">{label}</span>
      </div>
    </div>
  );
}

/* ─── Stat KPI Card ──────────────────────────────────────────── */
function KpiCard({ icon, label, value, sub, accent }) {
  return (
    <div className="rpt-kpi" style={{ '--accent': accent }}>
      <div className="rpt-kpi-icon">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="rpt-kpi-body">
        <p className="rpt-kpi-value">{value}</p>
        <p className="rpt-kpi-label">{label}</p>
        {sub && <p className="rpt-kpi-sub">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Reports Page ───────────────────────────────────────────── */
export default function ReportsPage({ onToast }) {
  const [bookings, setBookings] = useState([]);
  const [rooms,    setRooms]    = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [b, r, s] = await Promise.all([getBookings(), getRooms(), getStats()]);
      setBookings(b); setRooms(r); setStats(s);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ─── Derived Metrics ──────────────────────────────────────── */
  const totalRooms     = stats?.totalRooms     ?? 0;
  const occupiedRooms  = stats?.occupiedRooms  ?? 0;
  const availableRooms = stats?.availableRooms ?? 0;
  const occupancyRate  = stats?.occupancyRate  ?? 0;
  const totalRevenue   = bookings.reduce((s, b) => s + (b.totalAmount ?? 0), 0);
  const avgStay        = bookings.length
    ? (bookings.reduce((s, b) => s + (b.duration ?? 0), 0) / bookings.length).toFixed(1)
    : 0;
  const avgRevPerRoom  = occupiedRooms
    ? (totalRevenue / occupiedRooms).toFixed(0)
    : 0;

  /* Revenue by room type */
  const revenueByType = ['Standard', 'Deluxe', 'Suite'].map(type => ({
    label: type.slice(0, 3),
    value: bookings
      .filter(b => b.roomType === type)
      .reduce((s, b) => s + (b.totalAmount ?? 0), 0),
  }));

  /* Bookings by room type (count) */
  const bookingsByType = ['Standard', 'Deluxe', 'Suite'].map(type => ({
    label: type.slice(0, 3),
    value: bookings.filter(b => b.roomType === type).length,
  }));

  /* Room availability breakdown */
  const roomsByType = ['Standard', 'Deluxe', 'Suite'].map(type => {
    const typeRooms    = rooms.filter(r => r.roomType === type);
    const typeOccupied = typeRooms.filter(r => r.status === 'occupied').length;
    return { type, total: typeRooms.length, occupied: typeOccupied, available: typeRooms.length - typeOccupied };
  });

  /* Recent bookings table (latest 10) */
  const recent = [...bookings].slice(0, 10);

  return (
    <div className="rpt-page anim-fade-up">
      {/* Header */}
      <div className="rpt-page-header">
        <div>
          <p className="dash-eyebrow">Analytics</p>
          <h2 className="dash-heading">Reports & Overview</h2>
        </div>
        <button className="btn btn-ghost" onClick={fetchAll} style={{ gap: 6 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="api-error">
          <span className="material-symbols-outlined">wifi_off</span>
          <div><p className="api-error-title">Backend unreachable</p><p className="api-error-sub">{error}</p></div>
          <button className="btn btn-primary btn-sm" onClick={fetchAll}>Retry</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="rpt-kpi-grid">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="rpt-kpi" style={{ gap: 12 }}>
              <Skeleton h={44} w={44} r={12} /><div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Skeleton h={28} w={80} /><Skeleton h={14} w={100} />
              </div>
            </div>
          ))
        ) : (<>
          <KpiCard icon="book_online"  label="Active Bookings"   value={bookings.length}                 sub={`${availableRooms} rooms free`}            accent="var(--clr-primary)"   />
          <KpiCard icon="payments"     label="Total Revenue"     value={`$${totalRevenue.toLocaleString()}`} sub="From all active bookings"              accent="#4caf50"              />
          <KpiCard icon="percent"      label="Occupancy Rate"    value={`${occupancyRate}%`}             sub={`${occupiedRooms}/${totalRooms} rooms`}     accent="var(--clr-secondary)" />
          <KpiCard icon="nights_stay"  label="Avg Stay Duration" value={`${avgStay} nights`}             sub={`Avg rev/room: $${avgRevPerRoom}`}         accent="#9c27b0"              />
        </>)}
      </div>

      {/* Charts row */}
      <div className="rpt-charts-row">
        {/* Revenue by type */}
        <div className="card rpt-chart-card">
          <div className="rpt-chart-header">
            <h3 className="rpt-chart-title">Revenue by Room Type</h3>
            <span className="rpt-chart-sub">Based on active bookings</span>
          </div>
          {loading ? <Skeleton h={140} /> : (
            <>
              <BarChart data={revenueByType} color="var(--clr-primary)" />
              <div className="rpt-chart-legend">
                {revenueByType.map(d => (
                  <div key={d.label} className="rpt-legend-item">
                    <span className="rpt-legend-dot" style={{ background: 'var(--clr-primary)' }} />
                    <span>{d.label.toLowerCase()}:</span>
                    <strong>${d.value.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bookings by type */}
        <div className="card rpt-chart-card">
          <div className="rpt-chart-header">
            <h3 className="rpt-chart-title">Bookings by Room Type</h3>
            <span className="rpt-chart-sub">Count of active reservations</span>
          </div>
          {loading ? <Skeleton h={140} /> : (
            <>
              <BarChart data={bookingsByType} color="var(--clr-secondary)" />
              <div className="rpt-chart-legend">
                {bookingsByType.map(d => (
                  <div key={d.label} className="rpt-legend-item">
                    <span className="rpt-legend-dot" style={{ background: 'var(--clr-secondary)' }} />
                    <span>{d.label.toLowerCase()}:</span>
                    <strong>{d.value} bookings</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Occupancy donut */}
        <div className="card rpt-chart-card rpt-chart-card--donut">
          <div className="rpt-chart-header">
            <h3 className="rpt-chart-title">Occupancy</h3>
            <span className="rpt-chart-sub">Current snapshot</span>
          </div>
          {loading ? <Skeleton h={160} r={100} /> : (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              <DonutChart pct={occupancyRate} color="var(--clr-primary)" label="Occupied" />
            </div>
          )}
          {!loading && (
            <div className="rpt-chart-legend" style={{ justifyContent: 'center', gap: 20 }}>
              <div className="rpt-legend-item">
                <span className="rpt-legend-dot" style={{ background: 'var(--clr-primary)' }} />
                <span>Occupied: <strong>{occupiedRooms}</strong></span>
              </div>
              <div className="rpt-legend-item">
                <span className="rpt-legend-dot" style={{ background: 'var(--clr-surface-container)' }} />
                <span>Free: <strong>{availableRooms}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Room Type Breakdown Table */}
      <div className="card rpt-breakdown-card">
        <div className="rpt-chart-header">
          <h3 className="rpt-chart-title">Room Type Breakdown</h3>
          <span className="rpt-chart-sub">Inventory by category</span>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px 20px' }}>
            {[1,2,3].map(i => <Skeleton key={i} h={48} />)}
          </div>
        ) : (
          <div className="rpt-breakdown">
            <div className="rpt-breakdown-head">
              <span>Room Type</span><span>Total</span><span>Occupied</span><span>Available</span><span>Occupancy</span>
            </div>
            {roomsByType.map(row => {
              const pct = row.total ? Math.round((row.occupied / row.total) * 100) : 0;
              return (
                <div key={row.type} className="rpt-breakdown-row">
                  <div className="rpt-br-type">
                    <span className="rpt-type-dot" style={{ background: {Standard:'#84439f',Deluxe:'#f43f5e',Suite:'#ff9800'}[row.type] }} />
                    {row.type}
                  </div>
                  <span className="rpt-br-val">{row.total}</span>
                  <span className="rpt-br-val rpt-br-occ">{row.occupied}</span>
                  <span className="rpt-br-val rpt-br-free">{row.available}</span>
                  <div className="rpt-br-progress-wrap">
                    <div className="rpt-br-progress">
                      <div className="rpt-br-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="rpt-br-pct">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="card rpt-recent-card">
        <div className="rpt-chart-header">
          <h3 className="rpt-chart-title">Recent Reservations</h3>
          <span className="rpt-chart-sub">Latest {recent.length} active bookings</span>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 20px 20px' }}>
            {[1,2,3,4].map(i => <Skeleton key={i} h={44} />)}
          </div>
        ) : recent.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--clr-outline)' }}>
            No bookings yet — create one from the Reservations page.
          </div>
        ) : (
          <div className="rpt-recent">
            <div className="rpt-recent-head">
              <span>Guest</span><span>Room</span><span>Type</span>
              <span>Check-in</span><span>Nights</span><span>Bill</span>
            </div>
            {recent.map((b, i) => (
              <div key={i} className="rpt-recent-row">
                <div className="rpt-rec-guest">
                  <div className="rpt-rec-avatar">{b.guestName?.charAt(0)}</div>
                  <div>
                    <p className="rpt-rec-name">{b.guestName}</p>
                    <p className="rpt-rec-contact">{b.guestContact || 'No contact'}</p>
                  </div>
                </div>
                <span className="rpt-rec-room">Room {b.room}</span>
                <span className="rpt-rec-type">{b.roomType}</span>
                <span className="rpt-rec-date">{b.checkIn}</span>
                <span className="rpt-rec-nights">{b.duration}N</span>
                <span className="rpt-rec-bill">${(b.totalAmount ?? 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
