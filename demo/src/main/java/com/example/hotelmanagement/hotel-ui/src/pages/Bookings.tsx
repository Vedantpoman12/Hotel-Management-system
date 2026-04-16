import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Calendar, Phone, History, MapPin, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const Bookings = () => {
  const [activeBookings, setActiveBookings] = useState([]);
  const [guestHistory, setGuestHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const [bookingsRes, guestsRes] = await Promise.all([
        axios.get(`${API_BASE}/bookings`),
        axios.get(`${API_BASE}/guests`)
      ]);
      setActiveBookings(bookingsRes.data);
      setGuestHistory(guestsRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredHistory = guestHistory.filter((g: any) => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.contactNumber.includes(search)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-4xl font-serif text-stone-100 mb-2">Registry & Records</h1>
            <p className="text-stone-500 text-sm">Monitor current occupancy and historical guest data</p>
        </div>
        
        <div className="flex bg-stone-900/50 p-1 rounded-2xl border border-stone-800">
            <button 
                onClick={() => setActiveTab("active")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'active' ? 'bg-amber-600 text-stone-950 shadow-lg' : 'text-stone-500 hover:text-stone-300'
                }`}
            >
                Active Bookings
            </button>
            <button 
                onClick={() => setActiveTab("history")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'history' ? 'bg-amber-600 text-stone-950 shadow-lg' : 'text-stone-500 hover:text-stone-300'
                }`}
            >
                Guest History
            </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "active" ? (
          <motion.div 
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-stone-900/50 border border-stone-800 rounded-3xl overflow-hidden backdrop-blur-md">
                <table className="w-full text-left">
                    <thead className="bg-stone-800/50 text-stone-500 text-[10px] uppercase font-bold tracking-[0.2em]">
                        <tr>
                            <th className="p-6">Guest Details</th>
                            <th className="p-6">Room Assigned</th>
                            <th className="p-6">Duration</th>
                            <th className="p-6">Check-In Date</th>
                            <th className="p-6 text-right">Total Bill</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/50">
                        {activeBookings.length > 0 ? activeBookings.map((b: any, i) => (
                        <tr key={i} className="hover:bg-stone-800/30 transition-colors group">
                            <td className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-500 font-serif text-xl border border-amber-500/10">
                                    {b.guest.name[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-stone-100 text-lg group-hover:text-amber-500 transition-colors">{b.guest.name}</p>
                                    <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                                        <Phone size={12} className="text-stone-600" /> {b.guest.contactNumber}
                                    </p>
                                </div>
                            </div>
                            </td>
                            <td className="p-6">
                                <span className="bg-stone-800 text-stone-200 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-stone-700">
                                    ROOM {b.room.roomNumber} • {b.room.roomType}
                                </span>
                            </td>
                            <td className="p-6">
                                <div className="flex items-center gap-2 text-stone-300 text-sm">
                                    <Calendar size={14} className="text-amber-500/50" />
                                    {b.duration} Nights
                                </div>
                            </td>
                            <td className="p-6 text-stone-400 text-sm font-mono">{b.checkIn}</td>
                            <td className="p-6 text-right font-serif text-xl text-stone-100">₹{b.totalAmount}</td>
                        </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-stone-500 italic">No active bookings found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
                <input 
                    type="text"
                    placeholder="Search guests by name or phone..."
                    className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-12 pr-6 py-3.5 text-stone-100 focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHistory.map((g: any) => (
                    <motion.div 
                        layout
                        key={g.guestId}
                        className="bg-stone-900 border border-stone-800 rounded-3xl p-6 hover:border-stone-700 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-stone-800 flex items-center justify-center text-2xl font-serif text-amber-500 group-hover:scale-110 transition-transform">
                                {g.name[0]}
                            </div>
                            <History size={20} className="text-stone-700" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-100 mb-1">{g.name}</h3>
                        <p className="text-stone-500 text-xs mb-4 flex items-center gap-1.5 uppercase tracking-widest font-bold">
                            <MapPin size={12} /> {g.idProof || "N/A"}
                        </p>
                        
                        <div className="space-y-3 pt-4 border-t border-stone-800">
                            <div className="flex justify-between text-xs">
                                <span className="text-stone-600 uppercase font-bold tracking-widest">Contact</span>
                                <span className="text-stone-300 font-mono">{g.contactNumber}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-stone-600 uppercase font-bold tracking-widest">ID Reference</span>
                                <span className="text-stone-300 truncate max-w-[120px]">{g.idProof}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bookings;