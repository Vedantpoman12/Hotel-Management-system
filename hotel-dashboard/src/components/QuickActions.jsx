import { useState } from 'react';
import {
  X, Check, Calendar, Coffee, CreditCard, Wrench, Sparkles, UserPlus,
} from 'lucide-react';
import './QuickActions.css';

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Presidential'];
const RATES = { Standard: 99, Deluxe: 149, Suite: 249, Presidential: 499 };

function BookingModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', roomType:'Deluxe', checkIn:'', checkOut:'', guests:'1', specialRequests:'' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
    : 0;
  const total = nights * RATES[form.roomType];

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else { setLoading(true); setTimeout(() => { setLoading(false); onSuccess(); }, 1200); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">New Reservation</div>
            <div className="bk-steps">
              {['Guest Info', 'Room & Dates', 'Confirm'].map((s, i) => (
                <div key={i} className={`bk-step${step > i+1 ? ' bk-step--done' : step === i+1 ? ' bk-step--active' : ''}`}>
                  <div className="bk-dot">{step > i+1 ? <Check size={10}/> : i+1}</div>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="lm-icon-btn" onClick={onClose}><X size={18}/></button>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="bk-form anim-fade-up">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-control" placeholder="John" value={form.firstName} onChange={e=>set('firstName',e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className="form-control" placeholder="Doe" value={form.lastName} onChange={e=>set('lastName',e.target.value)}/>
                </div>
              </div>
              <div className="form-group" style={{marginTop:14}}>
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" placeholder="john@example.com" value={form.email} onChange={e=>set('email',e.target.value)}/>
              </div>
              <div className="form-group" style={{marginTop:14}}>
                <label className="form-label">Phone</label>
                <input type="tel" className="form-control" placeholder="+91 98765 43210" value={form.phone} onChange={e=>set('phone',e.target.value)}/>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bk-form anim-fade-up">
              <div className="form-group">
                <label className="form-label">Room Type *</label>
                <div className="rt-selector">
                  {ROOM_TYPES.map(type => (
                    <button
                      key={type}
                      className={`rt-opt${form.roomType===type?' rt-opt--active':''}`}
                      onClick={()=>set('roomType',type)}
                    >
                      <span className="rt-name">{type}</span>
                      <span className="rt-price">${RATES[type]}/night</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:14 }}>
                <div className="form-group">
                  <label className="form-label">Check-in *</label>
                  <input type="date" className="form-control" value={form.checkIn} onChange={e=>set('checkIn',e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Check-out *</label>
                  <input type="date" className="form-control" value={form.checkOut} onChange={e=>set('checkOut',e.target.value)}/>
                </div>
              </div>
              <div className="form-group" style={{marginTop:14}}>
                <label className="form-label">Guests</label>
                <select className="form-control" value={form.guests} onChange={e=>set('guests',e.target.value)}>
                  {[1,2,3,4].map(n=><option key={n} value={n}>{n} Guest{n>1?'s':''}</option>)}
                </select>
              </div>
              <div className="form-group" style={{marginTop:14}}>
                <label className="form-label">Special Requests</label>
                <textarea className="form-control" rows={3} style={{resize:'vertical'}} placeholder="High floor, late check-in…" value={form.specialRequests} onChange={e=>set('specialRequests',e.target.value)}/>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bk-summary anim-fade-up">
              <div className="bs-guest">
                <div className="bs-avatar">{(form.firstName[0]||'G')}{(form.lastName[0]||'')}</div>
                <div>
                  <p className="bs-name">{form.firstName||'Guest'} {form.lastName}</p>
                  <p className="bs-email">{form.email}</p>
                </div>
              </div>
              <div className="divider" style={{margin:'16px 0'}}/>
              <div className="bs-rows">
                {[['Room Type',form.roomType],['Check-in',form.checkIn||'—'],['Check-out',form.checkOut||'—'],['Nights',nights],['Guests',form.guests]].map(([l,v])=>(
                  <div key={l} className="bs-row"><span>{l}</span><strong>{v}</strong></div>
                ))}
              </div>
              <div className="divider" style={{margin:'16px 0'}}/>
              <div className="bs-total">
                <span>Total</span>
                <strong>${total.toLocaleString()}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && <button className="btn btn-ghost" onClick={()=>setStep(s=>s-1)}>Back</button>}
          <button className="btn btn-ghost" onClick={onClose} style={{marginRight:'auto'}}>Cancel</button>
          <button className="btn btn-primary btn-lg" onClick={handleNext} disabled={loading}>
            {loading ? 'Confirming…' : step===3 ? 'Confirm Booking' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* QuickActions renders conditionally based on autoOpen prop */
export default function QuickActions({ onToast, autoOpen, onClose }) {
  const [modal, setModal] = useState(autoOpen || null);

  const close = () => { setModal(null); if (onClose) onClose(); };

  const handleSuccess = () => {
    close();
    onToast('Reservation confirmed!', 'success');
  };

  // If called from Quick Actions panel (no autoOpen), show the grid
  if (!autoOpen) {
    const ACTIONS = [
      { id:'booking',   icon: Calendar,    label:'New Booking',      desc:'Reserve a room',    color:'#84439f', bg:'rgba(132,67,159,.08)' },
      { id:'checkin',   icon: UserPlus,    label:'Walk-in Check-in', desc:'Instant check-in',  color:'#4caf50', bg:'rgba(76,175,80,.08)' },
      { id:'housekeep', icon: Sparkles,    label:'Housekeeping',     desc:'Request cleaning',  color:'#9c27b0', bg:'rgba(156,39,176,.08)' },
      { id:'maint',     icon: Wrench,      label:'Maintenance',      desc:'Report an issue',   color:'#ff9800', bg:'rgba(255,152,0,.08)' },
      { id:'roomsvc',   icon: Coffee,      label:'Room Service',     desc:'Send to room',      color:'#2196f3', bg:'rgba(33,150,243,.08)' },
      { id:'payment',   icon: CreditCard,  label:'Process Payment',  desc:'Checkout billing',  color:'#f43f5e', bg:'rgba(244,63,94,.08)' },
    ];

    const handleAction = id => {
      if (id === 'booking' || id === 'checkin') setModal('booking');
      else if (id === 'housekeep') onToast('Housekeeping team notified', 'success');
      else if (id === 'roomsvc')   onToast('Room service request sent', 'info');
      else if (id === 'payment')   onToast('Payment terminal opened', 'info');
      else if (id === 'maint')     setModal('maintenance');
    };

    return (
      <>
        <div className="qa-grid">
          {ACTIONS.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                className="qa-btn"
                style={{'--qa-color':a.color,'--qa-bg':a.bg}}
                onClick={()=>handleAction(a.id)}
              >
                <div className="qa-icon"><Icon size={18}/></div>
                <div className="qa-text">
                  <span className="qa-label">{a.label}</span>
                  <span className="qa-desc">{a.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
        {modal === 'booking' && <BookingModal onClose={()=>setModal(null)} onSuccess={handleSuccess}/>}
      </>
    );
  }

  // Called with autoOpen="booking" from FAB/Management Actions
  return modal === 'booking'
    ? <BookingModal onClose={close} onSuccess={handleSuccess}/>
    : <BookingModal onClose={close} onSuccess={handleSuccess}/>;
}
