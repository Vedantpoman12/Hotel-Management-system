import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bed, IndianRupee, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = "http://localhost:8080/api";

interface Room {
  roomNumber: number;
  roomType: string;
  basePrice: number;
  occupied: boolean;
}

const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/rooms`);
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch rooms", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Total Rooms", value: rooms.length, icon: Bed, color: "bg-blue-500/10 text-blue-400" },
    { label: "Available", value: rooms.filter(r => !r.occupied).length, icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-400" },
    { label: "Occupied", value: rooms.filter(r => r.occupied).length, icon: Users, color: "bg-amber-500/10 text-amber-400" },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center bg-stone-900 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-stone-950 p-8 space-y-8 text-stone-100">
      <header>
        <h1 className="text-3xl font-serif font-medium">Hotel Overview</h1>
        <p className="text-stone-500 text-sm mt-2">Real-time room status from Java Backend</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}><stat.icon size={20} /></div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <motion.div
            key={room.roomNumber}
            whileHover={{ y: -5 }}
            className="bg-stone-900/80 border border-stone-800 rounded-2xl overflow-hidden shadow-xl"
          >
            <div className={`h-2 ${room.occupied ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-stone-500 uppercase">Room {room.roomNumber}</span>
                <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold border ${
                  room.occupied ? 'border-amber-500/20 text-amber-400 bg-amber-500/5' : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                }`}>
                  {room.occupied ? 'Occupied' : 'Vacant'}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-1">{room.roomType}</h3>
              <p className="text-stone-400 text-sm flex items-center gap-1">
                <IndianRupee size={14} /> {room.basePrice.toLocaleString()} / night
              </p>
              
              <button className="w-full mt-6 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 transition-colors text-sm font-medium">
                Manage Room
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;