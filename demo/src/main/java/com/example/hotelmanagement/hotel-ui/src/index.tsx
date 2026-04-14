import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';

export interface Room {
  roomNumber: number;
  basePrice: number;
  occupied: boolean;
  roomType: "Standard" | "Deluxe" | "Suite";
}

export interface Booking {
  guest: {
    name: string;
    contactNumber: string;
  };
  room: Room;
  duration: number;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);