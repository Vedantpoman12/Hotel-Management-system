import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bed, IndianRupee, Users, CheckCircle2, TrendingUp, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

interface Room {
  roomNumber: number;
  roomType: string;
  basePrice: number;
  occupied: boolean;
  guest?: string;
}

interface Booking {
  guest: { name: string; contactNumber: string };
  room: { roomNumber: number; roomType: string };
  duration: number;
  checkIn: string;
  totalAmount: number;
}

const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        axios.get(`${API_BASE}/rooms`),
        axios.get(`${API_BASE}/bookings`)
      ]);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const totalRooms = rooms.length;
  const available = rooms.filter(r => !r.occupied).length;
  const occupied = rooms.filter(r => r.occupied).length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;
  const todaysRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const stats = [
    { label: "Total Rooms", value: totalRooms, icon: Bed, color: "bg-blue-500/10 text-blue-400", borderColor: "border-blue-500/20" },
    { label: "Available", value: available, icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-400", borderColor: "border-emerald-500/20" },
    { label: "Occupied", value: occupied, icon: Users, color: "bg-amber-500/10 text-amber-400", borderColor: "border-amber-500/20" },
    { label: "Occupancy Rate", value: `${occupancyRate}%`, icon: TrendingUp, color: "bg-purple-500/10 text-purple-400", borderColor: "border-purple-500/20" },
    { label: "Daily Revenue", value: `₹${todaysRevenue.toLocaleString()}`, icon: IndianRupee, color: "bg-amber-500/10 text-amber-400", borderColor: "border-amber-500/30" },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center bg-stone-900 text-white">Loading...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-serif font-medium text-stone-100">Hotel Overview</h1>
        <p className="text-stone-500 text-sm mt-2">Real-time room status from Java Backend</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-stone-900/50 border ${stat.borderColor} rounded-2xl p-6 backdrop-blur-md`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}><stat.icon size={20} /></div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-stone-100">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>



      {/* Active Bookings Section */}
      {bookings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif text-stone-200">Current Guests</h2>
            <button
              onClick={() => navigate("/admin/bookings")}
              className="text-xs text-stone-500 hover:text-amber-500 font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
            >
              See All <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.slice(0, 6).map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-stone-900/50 border border-stone-800 rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-500 font-serif text-xl border border-amber-500/10">
                  {b.guest.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-100 font-semibold truncate">{b.guest.name}</p>
                  <p className="text-xs text-stone-500">Room {b.room.roomNumber} · {b.duration} {b.duration === 1 ? 'Night' : 'Nights'}</p>
                </div>
                <div className="text-right">
                  <p className="text-stone-200 font-serif">₹{b.totalAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-stone-600 flex items-center gap-1 justify-end"><Clock size={10} /> {b.checkIn}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Room Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif text-stone-200">All Rooms</h2>
          <button
            onClick={() => navigate("/admin/rooms")}
            className="text-xs text-stone-500 hover:text-amber-500 font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            Manage All <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {rooms.map((room, i) => (
            <motion.div
              key={room.roomNumber}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate("/admin/rooms", { state: { selectedRoom: room } })}
              className="bg-stone-900/80 border border-stone-800 rounded-2xl overflow-hidden shadow-xl cursor-pointer group hover:border-stone-700 transition-all"
            >
              <div className={`h-1.5 ${room.occupied ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-stone-500 uppercase">Room {room.roomNumber}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold border ${
                    room.occupied ? 'border-amber-500/20 text-amber-400 bg-amber-500/5' : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                  }`}>
                    {room.occupied ? 'Occupied' : 'Vacant'}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-stone-200 mb-0.5">{room.roomType}</h3>
                <p className="text-stone-400 text-xs flex items-center gap-0.5">
                  ₹{room.basePrice.toLocaleString()} <span className="text-stone-600">/ night</span>
                </p>

                {room.occupied && room.guest && (
                  <div className="mt-3 pt-3 border-t border-stone-800/50">
                    <p className="text-[10px] text-stone-600 uppercase tracking-widest">Guest</p>
                    <p className="text-stone-300 text-sm font-medium truncate">{room.guest}</p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    Manage <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;