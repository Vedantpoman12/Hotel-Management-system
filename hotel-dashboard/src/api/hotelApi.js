const BASE = 'http://localhost:8080/api';

const req = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
};

// ─── Rooms ────────────────────────────────────────────────────────
export const getRooms    = ()            => req('/rooms');

// ─── Bookings ─────────────────────────────────────────────────────
export const getBookings = ()            => req('/bookings');

// ─── Stats ────────────────────────────────────────────────────────
export const getStats    = ()            => req('/stats');

// ─── Book a room ──────────────────────────────────────────────────
export const bookRoom    = (payload)     => req('/book', { method: 'POST', body: JSON.stringify(payload) });

// ─── Check-out ────────────────────────────────────────────────────
export const checkOut    = (roomNumber)  => req(`/checkout/${roomNumber}`, { method: 'POST' });
