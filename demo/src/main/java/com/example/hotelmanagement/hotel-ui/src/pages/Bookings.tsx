 import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Calendar, Phone } from "lucide-react";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/bookings")
      .then(res => setBookings(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-stone-100">Guest Records</h1>
      <div className="bg-stone-800/80 border border-stone-700/50 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-stone-900/50 text-stone-500 text-xs uppercase tracking-widest">
            <tr>
              <th className="p-4">Guest</th>
              <th className="p-4">Room</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-700/30">
            {bookings.map((b: any, i) => (
              <tr key={i} className="hover:bg-stone-700/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-xs">{b.guest.name[0]}</div>
                    <div>
                      <p className="font-medium text-stone-200">{b.guest.name}</p>
                      <p className="text-[10px] text-stone-500">{b.guest.contactNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-stone-300 text-sm">Room {b.room.roomNumber} ({b.room.roomType})</td>
                <td className="p-4 text-stone-300 text-sm">{b.duration} Days</td>
                <td className="p-4">
                  <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-emerald-500/20">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bookings;