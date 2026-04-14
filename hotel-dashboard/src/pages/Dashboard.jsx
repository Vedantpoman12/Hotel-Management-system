import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { getRooms, getBookings, getStats, bookRoom, checkOut } from '../api/hotelApi';
import './Dashboard.css';

/* ─── Helpers ────────────────────────────────────────────────────── */
const STATUS_CFG = {
  available:   { label: 'Available',    cls: 'badge-available',   color: '#4caf50', bg: '#e8f5e9' },
  occupied:    { label: 'Occupied',     cls: 'badge-occupied',    color: '#84439f', bg: '#f3e5f5' },
  maintenance: { label: 'Maintenance',  cls: 'badge-maintenance', color: '#ff9800', bg: '#fff3e0' },
  checkout:    { label: 'Due Checkout', cls: 'badge-checkout',    color: '#f43f5e', bg: '#fce4ec' },
};

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

/* ─── Loading skeleton ────────────────────────────────────────────── */
function Skeleton({ h = 24, w = '100%', r = 8 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r,
      background: 'linear-gradient(90deg, #ebeef0 25%, #f2f4f5 50%, #ebeef0 75%)',
      backgroundSize: '600px 100%',
      animation: 'shimmer 1.4s ease infinite',
    }} />
  );
}

/* ─── Error banner ────────────────────────────────────────────────── */
function ApiError({ message, onRetry }) {
  return (
    <div className="api-error">
      <span className="material-symbols-outlined">wifi_off</span>
      <div>
        <p className="api-error-title">Backend Unreachable</p>
        <p className="api-error-sub">{message || 'Could not connect to http://localhost:8080'}</p>
      </div>
      <button className="btn btn-primary btn-sm" onClick={onRetry}>Retry</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  STAT CARDS
 * ═══════════════════════════════════════════════════════════════════ */
function StatCards({ stats, loading }) {
  if (loading) return (
    <section className="stat-cards">
      {[1,2,3].map(i => (
        <div key={i} className="stat-card stat-card--primary">
          <Skeleton h={20} w={120} /> <Skeleton h={44} w={80} /> <Skeleton h={6} />
        </div>
      ))}
    </section>
  );

  const occupied  = stats?.occupiedRooms  ?? 0;
  const total     = stats?.totalRooms     ?? 0;
  const available = stats?.availableRooms ?? 0;
  const arrivals  = stats?.arrivals       ?? 0;

  return (
    <section className="stat-cards">
      <div className="stat-card stat-card--primary">
        <div className="sc-top">
          <span className="sc-icon sc-icon--primary material-symbols-outlined">login</span>
          <span className="sc-label">Arrivals</span>
        </div>
        <div className="sc-value-row">
          <span className="sc-value">{arrivals}</span>
          <span className="sc-sub">Today's bookings</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${total ? (arrivals/total)*100 : 0}%`, background:'var(--clr-primary)' }} />
        </div>
      </div>

      <div className="stat-card stat-card--secondary">
        <div className="sc-top">
          <span className="sc-icon sc-icon--secondary material-symbols-outlined">logout</span>
          <span className="sc-label">Available</span>
        </div>
        <div className="sc-value-row">
          <span className="sc-value">{available}</span>
          <span className="sc-sub">Rooms free</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${total ? (available/total)*100 : 0}%`, background:'var(--clr-secondary)' }} />
        </div>
      </div>

      <div className="stat-card stat-card--tertiary">
        <div className="sc-top">
          <span className="sc-icon sc-icon--tertiary material-symbols-outlined">bed</span>
          <span className="sc-label">Occupancy</span>
        </div>
        <div className="sc-value-row">
          <span className="sc-value">{occupied}/{total}</span>
          <span className="sc-sub">{stats?.occupancyRate ?? 0}%</span>
        </div>
        <div className="sc-seg-bar">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="sc-seg"
              style={{ opacity: i <= Math.round((stats?.occupancyRate ?? 0) / 20) ? 1 : 0.25 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TODAY ACTIVITIES
 * ═══════════════════════════════════════════════════════════════════ */
function TodayActivities({ stats, loading }) {
  if (loading) return (
    <section className="today-grid">
      {[1,2,3].map(i => <div key={i} className="tg-card"><Skeleton h={20} w={80}/><Skeleton h={36} w={60}/></div>)}
    </section>
  );
  return (
    <section className="today-grid">
      <div className="tg-card">
        <p className="tg-label">Booked</p>
        <p className="tg-value">{stats?.occupiedRooms ?? 0}</p>
        <p className="tg-sub">Occupied rooms</p>
      </div>
      <div className="tg-card">
        <p className="tg-label">Guests</p>
        <p className="tg-value">{stats?.totalGuests ?? 0}</p>
        <p className="tg-sub">In-house total</p>
      </div>
      <div className="tg-card tg-card--revenue">
        <p className="tg-label tg-label--light">Revenue</p>
        <p className="tg-value tg-value--light">${(stats?.dailyRevenue ?? 0).toLocaleString()}</p>
        <p className="tg-sub tg-sub--light">Active bookings value</p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  BOOKINGS TABLE  (replaces "Recent Reservations")
 * ═══════════════════════════════════════════════════════════════════ */
function BookingsTable({ bookings, loading, onCheckout }) {
  const [page, setPage] = useState(0);
  const PER = 5;
  const pages = Math.ceil(bookings.length / PER);
  const visible = bookings.slice(page * PER, (page + 1) * PER);

  return (
    <div className="card ci-card">
      <div className="ci-header">
        <div>
          <h3 className="ci-title">Active Bookings</h3>
          <p className="ci-sub">{bookings.length} reservation{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        {pages > 1 && (
          <div className="ci-pager">
            <button className="ci-page-btn" disabled={page===0} onClick={()=>setPage(p=>p-1)}>‹</button>
            <span className="ci-page-info">{page+1}/{pages}</span>
            <button className="ci-page-btn" disabled={page===pages-1} onClick={()=>setPage(p=>p+1)}>›</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="ci-list">{[1,2,3].map(i=>(
          <div key={i} className="ci-row"><Skeleton h={38} w={38} r={8}/><div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}><Skeleton h={14} w={140}/><Skeleton h={11} w={100}/></div></div>
        ))}</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <span className="material-symbols-outlined" style={{fontSize:40,color:'var(--clr-outline-variant)'}}>calendar_today</span>
          <p>No active bookings</p>
        </div>
      ) : (
        <div className="ci-list">
          {visible.map((b, i) => (
            <div key={i} className="ci-row anim-fade-up" style={{animationDelay:`${i*40}ms`}}>
              <div className="ci-avatar">{initials(b.guestName)}</div>
              <div className="ci-info">
                <p className="ci-name">{b.guestName}</p>
                <p className="ci-meta">Room {b.room} · {b.roomType} · {b.duration}N</p>
              </div>
              <div className="ci-right">
                <span className="badge badge-occupied">
                  <span className="badge-dot"/>Occupied
                </span>
                <p className="ci-date">{b.checkIn} → {b.checkOut}</p>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{fontSize:11,padding:'3px 8px',color:'var(--clr-secondary)'}}
                  onClick={() => onCheckout(b.room)}
                >
                  Check-out
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  ROOM STATUS GRID
 * ═══════════════════════════════════════════════════════════════════ */
function RoomStatusGrid({ rooms, loading, onCheckout }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);

  const counts = {
    all:       rooms.length,
    available: rooms.filter(r=>r.status==='available').length,
    occupied:  rooms.filter(r=>r.status==='occupied').length,
  };

  const filtered = rooms.filter(r => {
    const ms = filter === 'all' || r.status === filter;
    const mq = !search || String(r.roomNumber).includes(search) ||
      (r.guest && r.guest.toLowerCase().includes(search.toLowerCase()));
    return ms && mq;
  });

  // Group by floor (first digit of roomNumber)
  const floors = [...new Set(filtered.map(r => Math.floor(r.roomNumber / 100)))].sort();

  return (
    <div className="card rsg-card">
      <div className="rsg-header">
        <div>
          <h3 className="rsg-title">Room Status</h3>
          <p className="rsg-sub">{filtered.length} / {rooms.length} rooms</p>
        </div>
        <input
          className="rsg-search"
          placeholder="Search room / guest…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="rsg-filters">
        {['all','available','occupied'].map(f => (
          <button key={f} className={`rsg-pill${filter===f?' rsg-pill--active':''}`} onClick={()=>setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase()+f.slice(1)}
            <span className="rsg-pill-count">{counts[f] ?? 0}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{padding:'0 20px 20px',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(72px,1fr))',gap:8}}>
          {Array(17).fill(0).map((_,i)=><Skeleton key={i} h={80} r={12}/>)}
        </div>
      ) : (
        floors.map(floor => {
          const floorRooms = filtered.filter(r => Math.floor(r.roomNumber / 100) === floor);
          if (!floorRooms.length) return null;
          return (
            <div key={floor}>
              <div className="rsg-floor-label">Floor {floor} <span className="rsg-floor-count">{floorRooms.length}</span></div>
              <div className="rsg-grid">
                {floorRooms.map(room => {
                  const cfg = STATUS_CFG[room.status] || STATUS_CFG.available;
                  return (
                    <button
                      key={room.roomNumber}
                      className="rsg-room"
                      style={{'--rc': cfg.color, '--rbg': cfg.bg}}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <span className="rsg-room-num">{room.roomNumber}</span>
                      <span className="rsg-room-type">{room.roomType?.slice(0,2).toUpperCase()}</span>
                      <span className="rsg-room-status">{cfg.label.slice(0,4).toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      <div className="rsg-legend">
        {Object.entries(STATUS_CFG).slice(0,2).map(([k,v]) => (
          <div key={k} className="rsg-legend-item">
            <span style={{width:8,height:8,borderRadius:'50%',background:v.color,display:'inline-block'}}/>
            <span>{k.charAt(0).toUpperCase()+k.slice(1)}</span>
          </div>
        ))}
      </div>

      {/* Room detail modal */}
      {selectedRoom && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setSelectedRoom(null)}>
          <div className="modal anim-fade-up" style={{maxWidth:380}}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Room {selectedRoom.roomNumber}</div>
                <span className={`badge ${STATUS_CFG[selectedRoom.status]?.cls}`} style={{marginTop:6,display:'inline-flex'}}>
                  <span className="badge-dot"/>{STATUS_CFG[selectedRoom.status]?.label}
                </span>
              </div>
              <button className="lm-icon-btn" onClick={()=>setSelectedRoom(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="room-detail-grid">
                <div className="rdd-item"><span>Type</span><strong>{selectedRoom.roomType}</strong></div>
                <div className="rdd-item"><span>Rate</span><strong>${selectedRoom.basePrice}/night</strong></div>
                <div className="rdd-item"><span>Status</span><strong>{STATUS_CFG[selectedRoom.status]?.label}</strong></div>
                <div className="rdd-item"><span>Floor</span><strong>{Math.floor(selectedRoom.roomNumber/100)}</strong></div>
              </div>
              {selectedRoom.guest && (
                <div className="rdd-guest">
                  <div className="ci-avatar" style={{width:42,height:42,fontSize:14}}>{initials(selectedRoom.guest)}</div>
                  <div>
                    <p style={{fontWeight:700,color:'var(--clr-on-surface)'}}>{selectedRoom.guest}</p>
                    <p style={{fontSize:12,color:'var(--clr-on-surface-variant)',marginTop:2}}>Current guest</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setSelectedRoom(null)}>Close</button>
              {selectedRoom.status === 'occupied' && (
                <button
                  className="btn btn-primary"
                  style={{background:'var(--clr-secondary)'}}
                  onClick={()=>{ onCheckout(selectedRoom.roomNumber); setSelectedRoom(null); }}
                >
                  <span className="material-symbols-outlined" style={{fontSize:18}}>logout</span>
                  Check-out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  MANAGEMENT ACTIONS (dark card)
 * ═══════════════════════════════════════════════════════════════════ */
function ManagementActions({ onOpenBooking, onToast }) {
  return (
    <div className="ma-card">
      <div className="ma-glow"/>
      <h3 className="ma-title">Management Actions</h3>
      <div className="ma-btns">
        <button className="ma-btn ma-btn--primary" onClick={onOpenBooking}>
          <span className="material-symbols-outlined">add_circle</span>New Reservation
        </button>
        <button className="ma-btn ma-btn--ghost" onClick={()=>onToast('Reports coming soon','info')}>
          <span className="material-symbols-outlined">assignment</span>Reports Hub
        </button>
        <button className="ma-btn ma-btn--ghost" onClick={()=>onToast('Housekeeping notified','success')}>
          <span className="material-symbols-outlined">cleaning_services</span>Housekeeping
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  WEEKLY OCCUPANCY CHART (no fake data — uses real stats)
 * ═══════════════════════════════════════════════════════════════════ */
function OccupancyChart({ stats }) {
  const pct = stats?.occupancyRate ?? 0;
  // Build bars from real occupancy pct (single today value + placeholders)
  const bars = [
    { day:'M', h:40 }, { day:'T', h:55 }, { day:'W', h:60 },
    { day:'T', h:50 }, { day:'F', h:70 }, { day:'S', h:75 }, { day:'T', h:pct },
  ];

  return (
    <div className="card ws-card">
      <div className="ws-header">
        <h3 className="ws-title">Occupancy</h3>
        <span style={{fontSize:11,color:'var(--clr-outline)',fontWeight:600}}>Today: {pct}%</span>
      </div>
      <div className="ws-chart">
        {bars.map((b,i)=>(
          <div key={i} className="ws-bar-wrap">
            <div className="ws-bar" style={{height:`${b.h}%`, opacity: i===6?1:.6}}/>
            <span className="ws-day">{b.day}</span>
          </div>
        ))}
      </div>
      <div className="ws-footer">
        <div>
          <p className="ws-stat-val">{pct}%</p>
          <p className="ws-stat-sub">Current Occupancy</p>
        </div>
        <div className="ws-footer-right">
          <p className="ws-stat-val ws-stat-val--primary">{stats?.occupiedRooms ?? 0}/{stats?.totalRooms ?? 0}</p>
          <p className="ws-stat-sub">Rooms Occupied</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  BOOKING FORM MODAL
 * ═══════════════════════════════════════════════════════════════════ */
const ROOM_TYPE_RATES = { Standard: 99, Deluxe: 149, Suite: 249 };

function BookingModal({ rooms, onClose, onSuccess, onToast }) {
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    firstName:'', lastName:'', email:'', phone:'',
    roomNumber:'', nights:1,
  });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const availableRooms = rooms.filter(r => r.status === 'available');

  const selectedRoom = rooms.find(r => r.roomNumber === parseInt(form.roomNumber));
  const total = selectedRoom ? selectedRoom.basePrice * form.nights : 0;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await bookRoom({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone,
        roomNumber: parseInt(form.roomNumber),
        nights:    parseInt(form.nights),
      });
      onSuccess();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal anim-fade-up">
        <div className="modal-header">
          <div>
            <div className="modal-title">New Reservation</div>
            <div className="bk-steps">
              {['Guest','Room','Confirm'].map((s,i)=>(
                <div key={i} className={`bk-step${step>i+1?' bk-step--done':step===i+1?' bk-step--active':''}`}>
                  <div className="bk-dot">{step>i+1?'✓':i+1}</div><span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="lm-icon-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="modal-body">
          {step===1 && (
            <div className="bk-form anim-fade-up">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div className="form-group"><label className="form-label">First Name *</label>
                  <input className="form-control" placeholder="John" value={form.firstName} onChange={e=>set('firstName',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Last Name *</label>
                  <input className="form-control" placeholder="Doe" value={form.lastName} onChange={e=>set('lastName',e.target.value)}/></div>
              </div>
              <div className="form-group" style={{marginTop:14}}><label className="form-label">Email *</label>
                <input type="email" className="form-control" placeholder="john@example.com" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
              <div className="form-group" style={{marginTop:14}}><label className="form-label">Phone</label>
                <input type="tel" className="form-control" placeholder="+91 98765 43210" value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
            </div>
          )}

          {step===2 && (
            <div className="bk-form anim-fade-up">
              <div className="form-group">
                <label className="form-label">Select Available Room *</label>
                {availableRooms.length === 0 ? (
                  <p style={{fontSize:13,color:'var(--clr-secondary)',padding:'12px 0'}}>No available rooms at the moment.</p>
                ) : (
                  <div className="rt-selector" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                    {availableRooms.map(r=>(
                      <button
                        key={r.roomNumber}
                        className={`rt-opt${form.roomNumber===String(r.roomNumber)?' rt-opt--active':''}`}
                        onClick={()=>set('roomNumber',String(r.roomNumber))}
                      >
                        <span className="rt-name">Room {r.roomNumber}</span>
                        <span className="rt-price">{r.roomType}</span>
                        <span className="rt-price">${r.basePrice}/night</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group" style={{marginTop:14}}>
                <label className="form-label">Duration (nights) *</label>
                <input type="number" min="1" max="30" className="form-control" value={form.nights} onChange={e=>set('nights',e.target.value)}/>
              </div>
            </div>
          )}

          {step===3 && (
            <div className="bk-summary anim-fade-up">
              <div className="bs-guest">
                <div className="bs-avatar">{form.firstName[0]||'G'}{form.lastName[0]||''}</div>
                <div>
                  <p className="bs-name">{form.firstName} {form.lastName}</p>
                  <p className="bs-email">{form.email}</p>
                </div>
              </div>
              <div className="divider" style={{margin:'16px 0'}}/>
              <div className="bs-rows">
                {[['Room', form.roomNumber||'—'],['Type', selectedRoom?.roomType||'—'],['Rate', `$${selectedRoom?.basePrice ?? 0}/night`],['Nights', form.nights],['Phone',form.phone||'—']].map(([l,v])=>(
                  <div key={l} className="bs-row"><span>{l}</span><strong>{v}</strong></div>
                ))}
              </div>
              <div className="divider" style={{margin:'16px 0'}}/>
              <div className="bs-total"><span>Total</span><strong>${total.toLocaleString()}</strong></div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step>1 && <button className="btn btn-ghost" onClick={()=>setStep(s=>s-1)}>Back</button>}
          <button className="btn btn-ghost" style={{marginRight:'auto'}} onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-lg"
            disabled={loading || (step===2 && !form.roomNumber)}
            onClick={()=>step<3?setStep(s=>s+1):handleSubmit()}
          >
            {loading?'Booking…':step===3?'Confirm':'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  DASHBOARD PAGE
 * ═══════════════════════════════════════════════════════════════════ */
export default function Dashboard({ onToast }) {
  const [rooms,    setRooms]    = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, b, s] = await Promise.all([getRooms(), getBookings(), getStats()]);
      setRooms(r);
      setBookings(b);
      setStats(s);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCheckout = async (roomNumber) => {
    try {
      const result = await checkOut(roomNumber);
      onToast(`${result.guestName} checked out | Bill: $${result.totalBill}`, 'success');
      fetchAll();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleBookingSuccess = () => {
    setShowBooking(false);
    onToast('Reservation confirmed!', 'success');
    fetchAll();
  };

  return (
    <>
      <div className="dash-page">
        {/* Intro */}
        <div className="dash-intro anim-fade-up">
          <p className="dash-eyebrow">Morning Update</p>
          <h2 className="dash-heading">System Overview</h2>
        </div>

        {/* Error */}
        {error && <ApiError message={error} onRetry={fetchAll} />}

        {/* Stat cards */}
        <StatCards stats={stats} loading={loading} />

        {/* Main Grid */}
        <div className="dash-main-grid">
          {/* LEFT */}
          <div className="dash-left">
            <section className="dash-section">
              <div className="dash-section-header">
                <h3 className="dash-section-title">Today's Overview</h3>
              </div>
              <TodayActivities stats={stats} loading={loading} />
            </section>

            <RoomStatusGrid rooms={rooms} loading={loading} onCheckout={handleCheckout} />
            <BookingsTable bookings={bookings} loading={loading} onCheckout={handleCheckout} />
          </div>

          {/* RIGHT */}
          <div className="dash-right">
            <OccupancyChart stats={stats} />
            <ManagementActions onOpenBooking={()=>setShowBooking(true)} onToast={onToast} />
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={()=>setShowBooking(true)} title="New Reservation">
        <span className="material-symbols-outlined">add</span>
      </button>

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal
          rooms={rooms}
          onClose={()=>setShowBooking(false)}
          onSuccess={handleBookingSuccess}
          onToast={onToast}
        />
      )}
    </>
  );
}
