import { useState, useEffect, useCallback } from 'react';
import { getRooms, getBookings, checkOut } from '../api/hotelApi';
import './RoomsPage.css';

/* ─── Status config ──────────────────────────────────────────── */
const STATUS = {
  available:   { label: 'Available',   color: '#4caf50', bg: '#e8f5e9', icon: 'check_circle' },
  occupied:    { label: 'Occupied',    color: '#84439f', bg: '#f3e5f5', icon: 'person'        },
};

function Skeleton({ h = 20, w = '100%', r = 8 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r, flexShrink: 0,
      background: 'linear-gradient(90deg,#ebeef0 25%,#f2f4f5 50%,#ebeef0 75%)',
      backgroundSize: '600px 100%', animation: 'shimmer 1.4s ease infinite',
    }} />
  );
}

/* ─── Checkout Confirm ───────────────────────────────────────── */
function CheckoutModal({ room, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal anim-fade-up" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <p className="modal-title">Confirm Check-out</p>
          <button className="lm-icon-btn" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="modal-body">
          <div className="rm-co-body">
            <div className="rm-co-icon"><span className="material-symbols-outlined">hotel</span></div>
            <div className="rm-co-info">
              <p className="rm-co-room">Room {room.roomNumber}</p>
              <p className="rm-co-type">{room.roomType}</p>
              {room.guest && <p className="rm-co-guest">Guest: <strong>{room.guest}</strong></p>}
              <p className="rm-co-warn">This will free the room and generate the bill.</p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--clr-secondary)' }}
            disabled={loading} onClick={onConfirm}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            {loading ? 'Processing…' : 'Check Out Guest'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Room Card ──────────────────────────────────────────────── */
function RoomCard({ room, onCheckout }) {
  const cfg = STATUS[room.status] || STATUS.available;
  return (
    <div className="rm-card" style={{ '--rm-color': cfg.color, '--rm-bg': cfg.bg }}>
      <div className="rm-card-top">
        <div className="rm-number">
          <span className="rm-num-label">Room</span>
          <span className="rm-num-val">{room.roomNumber}</span>
        </div>
        <div className="rm-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
          <span className="material-symbols-outlined rm-status-icon">{cfg.icon}</span>
          {cfg.label}
        </div>
      </div>

      <div className="rm-details">
        <div className="rm-detail-row">
          <span className="material-symbols-outlined rm-det-icon">category</span>
          <span>{room.roomType}</span>
        </div>
        <div className="rm-detail-row">
          <span className="material-symbols-outlined rm-det-icon">payments</span>
          <span>${room.basePrice}/night</span>
        </div>
        <div className="rm-detail-row">
          <span className="material-symbols-outlined rm-det-icon">stairs</span>
          <span>Floor {Math.floor(room.roomNumber / 100)}</span>
        </div>
      </div>

      {room.guest && (
        <div className="rm-guest-strip">
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>person</span>
          <span className="rm-guest-name">{room.guest}</span>
        </div>
      )}

      <div className="rm-card-footer">
        {room.status === 'occupied' ? (
          <button className="rm-action-btn rm-action-btn--checkout" onClick={() => onCheckout(room)}>
            <span className="material-symbols-outlined">logout</span>Check-out
          </button>
        ) : (
          <span className="rm-action-btn rm-action-btn--free">
            <span className="material-symbols-outlined">check</span>Ready
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Rooms Page ─────────────────────────────────────────────── */
export default function RoomsPage({ onToast }) {
  const [rooms,     setRooms]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [filter,    setFilter]    = useState('all');       // all | available | occupied
  const [typeFilter,setTypeFilter]= useState('all');       // all | Standard | Deluxe | Suite
  const [view,      setView]      = useState('grid');      // grid | list
  const [coRoom,    setCoRoom]    = useState(null);
  const [coLoading, setCoLoading] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRooms(await getRooms()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  /* Stats */
  const total     = rooms.length;
  const occupied  = rooms.filter(r => r.status === 'occupied').length;
  const available = rooms.filter(r => r.status === 'available').length;
  const oRate     = total ? Math.round((occupied / total) * 100) : 0;

  /* Filtered list */
  const roomTypes = ['all', ...new Set(rooms.map(r => r.roomType))];
  const displayed = rooms.filter(r => {
    const ms = filter === 'all' || r.status === filter;
    const mt = typeFilter === 'all' || r.roomType === typeFilter;
    return ms && mt;
  }).sort((a, b) => a.roomNumber - b.roomNumber);

  /* Group by floor */
  const floors = [...new Set(displayed.map(r => Math.floor(r.roomNumber / 100)))].sort();

  const handleCheckout = async () => {
    setCoLoading(true);
    try {
      const res = await checkOut(coRoom.roomNumber);
      onToast(`✓ ${res.guestName} checked out — Bill: $${res.totalBill}`, 'success');
      setCoRoom(null);
      fetchRooms();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setCoLoading(false);
    }
  };

  return (
    <div className="rm-page anim-fade-up">
      {/* Page header */}
      <div className="rm-page-header">
        <div>
          <p className="dash-eyebrow">Rooms</p>
          <h2 className="dash-heading">Room Management</h2>
        </div>
        <div className="rm-view-toggle">
          <button className={`rm-toggle-btn${view === 'grid' ? ' active' : ''}`} onClick={() => setView('grid')}>
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button className={`rm-toggle-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')}>
            <span className="material-symbols-outlined">view_list</span>
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="rm-stats">
        {[
          { icon:'hotel',     label:'Total Rooms',    val: total,     cls:'primary'   },
          { icon:'person',    label:'Occupied',       val: occupied,  cls:'occupied'  },
          { icon:'check',     label:'Available',      val: available, cls:'available' },
          { icon:'percent',   label:'Occupancy Rate', val:`${oRate}%`,cls:'rate'      },
        ].map(s => (
          <div key={s.label} className="rm-stat">
            <div className={`rm-stat-icon rm-stat-icon--${s.cls}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <div>
              <p className="rm-stat-val">{s.val}</p>
              <p className="rm-stat-label">{s.label}</p>
            </div>
          </div>
        ))}
        {/* Occupancy bar */}
        <div className="rm-occ-bar-wrap">
          <div className="rm-occ-bar" style={{ width: `${oRate}%` }} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="api-error">
          <span className="material-symbols-outlined">wifi_off</span>
          <div><p className="api-error-title">Backend unreachable</p><p className="api-error-sub">{error}</p></div>
          <button className="btn btn-primary btn-sm" onClick={fetchRooms}>Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="rm-controls">
        <div className="rm-filter-group">
          <span className="rm-filter-label">Status</span>
          {['all','available','occupied'].map(f => (
            <button key={f} className={`rp-pill${filter === f ? ' rp-pill--active' : ''}`}
              onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{background:'rgba(0,0,0,.08)',fontSize:10,fontWeight:800,padding:'1px 6px',borderRadius:100,marginLeft:4}}>
                {f === 'all' ? total : f === 'occupied' ? occupied : available}
              </span>
            </button>
          ))}
        </div>
        <div className="rm-filter-group">
          <span className="rm-filter-label">Type</span>
          {roomTypes.map(t => (
            <button key={t} className={`rp-pill${typeFilter === t ? ' rp-pill--active' : ''}`}
              onClick={() => setTypeFilter(t)}>
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rm-grid">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="rm-card" style={{ gap: 12, padding: 20 }}>
              <Skeleton h={20} w={80} /><Skeleton h={40} /><Skeleton h={16} /><Skeleton h={36} />
            </div>
          ))}
        </div>
      ) : view === 'grid' ? (
        floors.map(floor => {
          const fr = displayed.filter(r => Math.floor(r.roomNumber / 100) === floor);
          if (!fr.length) return null;
          return (
            <div key={floor}>
              <div className="rm-floor-header">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>layers</span>
                Floor {floor}
                <span className="rm-floor-pill">{fr.length} rooms</span>
              </div>
              <div className="rm-grid">
                {fr.map(r => <RoomCard key={r.roomNumber} room={r} onCheckout={setCoRoom} />)}
              </div>
            </div>
          );
        })
      ) : (
        /* List view */
        <div className="rm-list">
          <div className="rm-list-header">
            <span>Room #</span><span>Type</span><span>Floor</span>
            <span>Rate/Night</span><span>Status</span><span>Guest</span><span>Action</span>
          </div>
          {displayed.map(r => {
            const cfg = STATUS[r.status] || STATUS.available;
            return (
              <div key={r.roomNumber} className="rm-list-row">
                <span className="rm-list-num">Room {r.roomNumber}</span>
                <span>{r.roomType}</span>
                <span>Floor {Math.floor(r.roomNumber / 100)}</span>
                <span>${r.basePrice}</span>
                <span>
                  <span className="rm-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                    <span className="material-symbols-outlined rm-status-icon">{cfg.icon}</span>
                    {cfg.label}
                  </span>
                </span>
                <span className="rm-list-guest">{r.guest || '—'}</span>
                <span>
                  {r.status === 'occupied' && (
                    <button className="rm-action-btn rm-action-btn--checkout" onClick={() => setCoRoom(r)}>
                      <span className="material-symbols-outlined">logout</span>Check-out
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Checkout modal */}
      {coRoom && (
        <CheckoutModal
          room={coRoom}
          onClose={() => setCoRoom(null)}
          onConfirm={handleCheckout}
          loading={coLoading}
        />
      )}
    </div>
  );
}
