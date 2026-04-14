import { useState, useEffect, useCallback, useMemo } from 'react';
import { getRooms, getBookings, bookRoom, checkOut } from '../api/hotelApi';
import './ReservationsPage.css';

/* ─── Helpers ──────────────────────────────────────────────────────── */
function initials(name = '') {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function avatarColor(name = '') {
  const colors = [
    ['#e9aaff','#5d1c79'], ['#ccdff6','#3e5063'], ['#ffd9de','#a50041'],
    ['#d1fae5','#065f46'], ['#fef3c7','#92400e'], ['#dbeafe','#1e40af'],
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function Skeleton({ h = 20, w = '100%', r = 8 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r, flexShrink: 0,
      background: 'linear-gradient(90deg,#ebeef0 25%,#f2f4f5 50%,#ebeef0 75%)',
      backgroundSize: '600px 100%', animation: 'shimmer 1.4s ease infinite',
    }} />
  );
}

/* ─── New Booking Modal ─────────────────────────────────────────────── */
function NewBookingModal({ rooms, onClose, onSuccess, onToast }) {
  const [step, setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]       = useState({
    firstName: '', lastName: '', email: '', phone: '',
    roomNumber: '', nights: 1,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const available    = rooms.filter(r => r.status === 'available');
  const selectedRoom = rooms.find(r => r.roomNumber === parseInt(form.roomNumber));
  const total        = selectedRoom ? selectedRoom.basePrice * parseInt(form.nights || 1) : 0;

  const canNext = () => {
    if (step === 1) return form.firstName && form.lastName && form.email;
    if (step === 2) return form.roomNumber && parseInt(form.nights) >= 1;
    return true;
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await bookRoom({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone,
        roomNumber: parseInt(form.roomNumber),
        nights:    parseInt(form.nights),
      });
      onSuccess(`Booking confirmed! Room ${form.roomNumber} reserved for ${form.firstName} ${form.lastName}`);
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal anim-fade-up">
        {/* Header */}
        <div className="modal-header">
          <div>
            <p className="modal-title">New Reservation</p>
            <div className="bk-steps">
              {['Guest Info', 'Room & Stay', 'Confirm'].map((s, i) => (
                <div key={i} className={`bk-step${step > i + 1 ? ' bk-step--done' : step === i + 1 ? ' bk-step--active' : ''}`}>
                  <div className="bk-dot">{step > i + 1 ? '✓' : i + 1}</div>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="lm-icon-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Step 1 — Guest Info */}
          {step === 1 && (
            <div className="bk-form anim-fade-up">
              <div className="rp-form-row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-control" placeholder="John" value={form.firstName}
                    onChange={e => set('firstName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className="form-control" placeholder="Doe" value={form.lastName}
                    onChange={e => set('lastName', e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" placeholder="john@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Phone</label>
                <input type="tel" className="form-control" placeholder="+91 98765 43210"
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 2 — Room & Stay */}
          {step === 2 && (
            <div className="bk-form anim-fade-up">
              <div className="form-group">
                <label className="form-label">Select Room *</label>
                {available.length === 0
                  ? <p className="rp-no-rooms">No rooms available at the moment.</p>
                  : (
                    <div className="rp-room-grid">
                      {available.map(r => (
                        <button
                          key={r.roomNumber}
                          className={`rp-room-opt${form.roomNumber === String(r.roomNumber) ? ' rp-room-opt--active' : ''}`}
                          onClick={() => set('roomNumber', String(r.roomNumber))}
                        >
                          <span className="rp-room-num">Room {r.roomNumber}</span>
                          <span className="rp-room-type">{r.roomType}</span>
                          <span className="rp-room-price">${r.basePrice}<small>/night</small></span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Number of Nights *</label>
                <input type="number" min="1" max="60" className="form-control"
                  value={form.nights} onChange={e => set('nights', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 3 — Summary */}
          {step === 3 && (
            <div className="bk-summary anim-fade-up">
              <div className="bs-guest">
                <div className="bs-avatar" style={{ background: avatarColor(form.firstName + form.lastName)[0], color: avatarColor(form.firstName + form.lastName)[1] }}>
                  {form.firstName[0]}{form.lastName[0]}
                </div>
                <div>
                  <p className="bs-name">{form.firstName} {form.lastName}</p>
                  <p className="bs-email">{form.email}</p>
                </div>
              </div>
              <div className="divider" style={{ margin: '16px 0' }} />
              <div className="bs-rows">
                {[
                  ['Room',  `${form.roomNumber} — ${selectedRoom?.roomType || ''}`],
                  ['Rate',  `$${selectedRoom?.basePrice ?? 0}/night`],
                  ['Nights', form.nights],
                  ['Phone',  form.phone || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="bs-row"><span>{l}</span><strong>{v}</strong></div>
                ))}
              </div>
              <div className="divider" style={{ margin: '16px 0' }} />
              <div className="bs-total"><span>Total Estimate</span><strong>${total.toLocaleString()}</strong></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {step > 1 && <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>Back</button>}
          <button className="btn btn-ghost" style={{ marginRight: 'auto' }} onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-lg"
            disabled={!canNext() || submitting}
            onClick={() => step < 3 ? setStep(s => s + 1) : handleConfirm()}
          >
            {submitting ? 'Confirming…' : step === 3 ? 'Confirm Booking' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Checkout Confirm Modal ────────────────────────────────────────── */
function CheckoutModal({ booking, onClose, onConfirm, loading }) {
  const total = booking.totalAmount?.toFixed(2) ?? '—';
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal anim-fade-up" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <p className="modal-title">Confirm Check-out</p>
          <button className="lm-icon-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="co-summary">
            <div className="co-icon">
              <span className="material-symbols-outlined">hotel</span>
            </div>
            <div className="co-rows">
              {[
                ['Guest',    booking.guestName],
                ['Room',     `${booking.room} — ${booking.roomType}`],
                ['Duration', `${booking.duration} night${booking.duration !== 1 ? 's' : ''}`],
                ['Check-in', booking.checkIn],
                ['Bill',     `$${total}`],
              ].map(([l, v]) => (
                <div key={l} className="co-row">
                  <span>{l}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ background: 'var(--clr-secondary)' }}
            disabled={loading}
            onClick={onConfirm}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            {loading ? 'Processing…' : 'Check out Guest'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Booking Card ──────────────────────────────────────────────────── */
function BookingCard({ booking, onCheckout, idx }) {
  const [bg, fg] = avatarColor(booking.guestName);
  return (
    <div className="rp-card anim-fade-up" style={{ animationDelay: `${idx * 40}ms` }}>
      {/* Left accent */}
      <div className="rp-card-accent" />

      {/* Avatar + guest */}
      <div className="rp-card-guest">
        <div className="rp-avatar" style={{ background: bg, color: fg }}>
          {initials(booking.guestName)}
        </div>
        <div>
          <p className="rp-guest-name">{booking.guestName}</p>
          <p className="rp-guest-contact">{booking.guestContact || 'No contact'}</p>
        </div>
      </div>

      {/* Room info */}
      <div className="rp-card-room">
        <span className="rp-room-badge">Room {booking.room}</span>
        <span className="rp-room-type-tag">{booking.roomType}</span>
      </div>

      {/* Stay details */}
      <div className="rp-card-dates">
        <div className="rp-date-item">
          <span className="material-symbols-outlined rp-date-icon">login</span>
          <div>
            <p className="rp-date-label">Check-in</p>
            <p className="rp-date-val">{booking.checkIn}</p>
          </div>
        </div>
        <div className="rp-date-arrow">→</div>
        <div className="rp-date-item">
          <span className="material-symbols-outlined rp-date-icon">logout</span>
          <div>
            <p className="rp-date-label">Check-out</p>
            <p className="rp-date-val">{booking.checkOut}</p>
          </div>
        </div>
        <div className="rp-nights-badge">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>nights_stay</span>
          {booking.duration}N
        </div>
      </div>

      {/* Bill + action */}
      <div className="rp-card-actions">
        <div className="rp-bill">
          <p className="rp-bill-label">Total</p>
          <p className="rp-bill-amount">${(booking.totalAmount ?? 0).toLocaleString()}</p>
        </div>
        <button className="rp-checkout-btn" onClick={() => onCheckout(booking)}>
          <span className="material-symbols-outlined">logout</span>
          Check-out
        </button>
      </div>
    </div>
  );
}

/* ─── Empty State ───────────────────────────────────────────────────── */
function EmptyState({ onNew }) {
  return (
    <div className="rp-empty">
      <div className="rp-empty-icon">
        <span className="material-symbols-outlined">calendar_today</span>
      </div>
      <h3 className="rp-empty-title">No Active Reservations</h3>
      <p className="rp-empty-sub">All rooms are currently available. Create a new booking to get started.</p>
      <button className="btn btn-primary btn-lg" onClick={onNew}>
        <span className="material-symbols-outlined">add</span>
        New Reservation
      </button>
    </div>
  );
}

/* ─── Reservations Page ─────────────────────────────────────────────── */
export default function ReservationsPage({ onToast }) {
  const [bookings,     setBookings]     = useState([]);
  const [rooms,        setRooms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState('');
  const [filterType,   setFilterType]   = useState('all');
  const [showNew,      setShowNew]      = useState(false);
  const [checkingOut,  setCheckingOut]  = useState(null); // booking object
  const [coLoading,    setCoLoading]    = useState(false);
  const [sortField,    setSortField]    = useState('guestName');
  const [sortDir,      setSortDir]      = useState('asc');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [b, r] = await Promise.all([getBookings(), getRooms()]);
      setBookings(b);
      setRooms(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* Sort + filter */
  const roomTypes = useMemo(() => ['all', ...new Set(bookings.map(b => b.roomType))], [bookings]);

  const displayed = useMemo(() => {
    let list = [...bookings];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.guestName?.toLowerCase().includes(q) ||
        String(b.room).includes(q) ||
        b.roomType?.toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') list = list.filter(b => b.roomType === filterType);
    list.sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return list;
  }, [bookings, search, filterType, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleCheckout = async () => {
    if (!checkingOut) return;
    setCoLoading(true);
    try {
      const result = await checkOut(checkingOut.room);
      onToast(`✓ ${result.guestName} checked out — Bill: $${result.totalBill}`, 'success');
      setCheckingOut(null);
      fetchAll();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setCoLoading(false);
    }
  };

  const handleBookingSuccess = (msg) => {
    setShowNew(false);
    onToast(msg, 'success');
    fetchAll();
  };

  const sortIcon = (field) => sortField === field
    ? (sortDir === 'asc' ? '↑' : '↓') : <span style={{ opacity: .3 }}>↕</span>;

  /* Stats bar */
  const occupied  = rooms.filter(r => r.status === 'occupied').length;
  const available = rooms.filter(r => r.status === 'available').length;

  return (
    <div className="rp-page anim-fade-up">
      {/* Page header */}
      <div className="rp-page-header">
        <div>
          <p className="dash-eyebrow">Reservations</p>
          <h2 className="dash-heading">Active Bookings</h2>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowNew(true)}>
          <span className="material-symbols-outlined">add</span>
          New Booking
        </button>
      </div>

      {/* Stats strip */}
      <div className="rp-stats-strip">
        <div className="rp-stat">
          <span className="material-symbols-outlined rp-stat-icon rp-stat-icon--primary">book_online</span>
          <div>
            <p className="rp-stat-val">{bookings.length}</p>
            <p className="rp-stat-label">Active Bookings</p>
          </div>
        </div>
        <div className="rp-stat-divider" />
        <div className="rp-stat">
          <span className="material-symbols-outlined rp-stat-icon rp-stat-icon--occupied">bed</span>
          <div>
            <p className="rp-stat-val">{occupied}</p>
            <p className="rp-stat-label">Occupied Rooms</p>
          </div>
        </div>
        <div className="rp-stat-divider" />
        <div className="rp-stat">
          <span className="material-symbols-outlined rp-stat-icon rp-stat-icon--available">meeting_room</span>
          <div>
            <p className="rp-stat-val">{available}</p>
            <p className="rp-stat-label">Available Rooms</p>
          </div>
        </div>
        <div className="rp-stat-divider" />
        <div className="rp-stat">
          <span className="material-symbols-outlined rp-stat-icon rp-stat-icon--revenue">payments</span>
          <div>
            <p className="rp-stat-val">
              ${bookings.reduce((s, b) => s + (b.totalAmount ?? 0), 0).toLocaleString()}
            </p>
            <p className="rp-stat-label">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="api-error">
          <span className="material-symbols-outlined">wifi_off</span>
          <div>
            <p className="api-error-title">Cannot reach backend</p>
            <p className="api-error-sub">{error}</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={fetchAll}>Retry</button>
        </div>
      )}

      {/* Controls */}
      <div className="rp-controls">
        {/* Search */}
        <div className="rp-search-wrap">
          <span className="material-symbols-outlined rp-search-icon">search</span>
          <input
            className="rp-search"
            placeholder="Search guest, room number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="rp-search-clear" onClick={() => setSearch('')}>
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {/* Room type filter */}
        <div className="rp-filter-pills">
          {roomTypes.map(t => (
            <button
              key={t}
              className={`rp-pill${filterType === t ? ' rp-pill--active' : ''}`}
              onClick={() => setFilterType(t)}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="rp-sort">
          <span className="rp-sort-label">Sort:</span>
          {[['guestName','Guest'],['room','Room'],['checkIn','Check-in'],['totalAmount','Bill']].map(([f, l]) => (
            <button
              key={f}
              className={`rp-sort-btn${sortField === f ? ' rp-sort-btn--active' : ''}`}
              onClick={() => handleSort(f)}
            >
              {l} {sortIcon(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="rp-count">
          {displayed.length === bookings.length
            ? `Showing all ${bookings.length} reservation${bookings.length !== 1 ? 's' : ''}`
            : `Showing ${displayed.length} of ${bookings.length} reservations`}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="rp-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="rp-card" style={{ gap: 16, padding: '20px 24px' }}>
              <Skeleton h={44} w={44} r={12} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Skeleton h={16} w={160} />
                <Skeleton h={12} w={100} />
              </div>
              <Skeleton h={36} w={100} r={10} />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState onNew={() => setShowNew(true)} />
      ) : displayed.length === 0 ? (
        <div className="rp-empty" style={{ minHeight: 300 }}>
          <div className="rp-empty-icon">
            <span className="material-symbols-outlined">search_off</span>
          </div>
          <h3 className="rp-empty-title">No Matches</h3>
          <p className="rp-empty-sub">Try changing your search or filter.</p>
          <button className="btn btn-ghost" onClick={() => { setSearch(''); setFilterType('all'); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="rp-list">
          {displayed.map((b, i) => (
            <BookingCard key={`${b.room}-${i}`} booking={b} onCheckout={setCheckingOut} idx={i} />
          ))}
        </div>
      )}

      {/* Modals */}
      {showNew && (
        <NewBookingModal
          rooms={rooms}
          onClose={() => setShowNew(false)}
          onSuccess={handleBookingSuccess}
          onToast={onToast}
        />
      )}
      {checkingOut && (
        <CheckoutModal
          booking={checkingOut}
          onClose={() => setCheckingOut(null)}
          onConfirm={handleCheckout}
          loading={coLoading}
        />
      )}
    </div>
  );
}
