import React, { useState, useEffect } from "react";
import axios from "axios";
import { DoorOpen, LogIn, LogOut, Info } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = "http://localhost:8080/api";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_BASE}/rooms`);
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rooms", error);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleCheckOut = async (roomNumber: number) => {
    try {
      await axios.post(`${API_BASE}/checkout/${roomNumber}`);
      alert(`Room ${roomNumber} checked out successfully!`);
      fetchRooms(); // Refresh the list
    } catch (error) {
      console.error("Checkout failed", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-stone-100">Room Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room: any) => (
          <div key={room.roomNumber} className="bg-stone-800/50 border border-stone-700/50 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-stone-700/50 rounded-xl text-stone-300">
                <DoorOpen size={24} />
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                room.occupied ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {room.occupied ? 'Occupied' : 'Vacant'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-stone-100">Room {room.roomNumber}</h3>
            <p className="text-stone-500 text-sm font-medium uppercase tracking-widest">{room.roomType}</p>
            
            <div className="mt-6 flex gap-3">
              {room.occupied ? (
                <button 
                  onClick={() => handleCheckOut(room.roomNumber)}
                  className="flex-1 bg-stone-700 hover:bg-rose-600/20 hover:text-rose-400 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Check Out
                </button>
              ) : (
                <button className="flex-1 bg-amber-600 hover:bg-amber-500 text-stone-900 py-2 rounded-lg text-sm font-bold transition-all">
                  Check In
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rooms;