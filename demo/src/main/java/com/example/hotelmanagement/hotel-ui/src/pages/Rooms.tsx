import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { DoorOpen, LogIn, LogOut, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const Rooms = () => {
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    idProof: "",
    nights: 1
  });

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

  useEffect(() => {
    if (location.state?.selectedRoom) {
      const room = location.state.selectedRoom;
      // Only auto-open modal if the room is not occupied
      if (!room.occupied) {
        setSelectedRoom(room);
      }
    }
  }, [location]);

  const handleCheckOut = async (roomNumber: number) => {
    try {
      const res = await axios.post(`${API_BASE}/checkout/${roomNumber}`);
      alert(`Check-out success! Total Bill: ₹${res.data.totalBill}`);
      fetchRooms();
    } catch (error: any) {
      alert(error.response?.data?.message || "Checkout failed");
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/book`, {
        roomNumber: selectedRoom.roomNumber,
        ...formData
      });
      alert(`Room ${selectedRoom.roomNumber} booked successfully!`);
      setSelectedRoom(null);
      setFormData({ firstName: "", lastName: "", phone: "", idProof: "", nights: 1 });
      fetchRooms();
    } catch (error: any) {
      alert(error.response?.data?.message || "Booking failed");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-stone-900 text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-stone-100">Room Management</h1>
        <div className="flex gap-4">
            <span className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Available
            </span>
            <span className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Occupied
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room: any) => (
          <motion.div 
            layout
            key={room.roomNumber} 
            className="bg-stone-800/50 border border-stone-700/50 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 transition-all ${room.occupied ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-stone-700/50 rounded-xl text-stone-300">
                <DoorOpen size={24} />
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                room.occupied ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {room.occupied ? 'Occupied' : 'Vacant'}
              </span>
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-stone-100">Room {room.roomNumber}</h3>
                <p className="text-stone-500 text-sm font-medium uppercase tracking-widest">{room.roomType}</p>
                <p className="text-stone-300 mt-2 font-serif text-lg">₹{room.basePrice} <span className="text-xs text-stone-500">/ night</span></p>
                
                {room.occupied && (
                    <div className="mt-4 p-3 bg-stone-900/50 rounded-xl border border-stone-700/30">
                        <p className="text-[10px] uppercase text-stone-500 mb-1">Current Guest</p>
                        <p className="text-stone-200 font-medium">{room.guest || "Unknown"}</p>
                    </div>
                )}
            </div>
            
            <div className="mt-6 flex gap-3 relative z-10">
              {room.occupied ? (
                <button 
                  onClick={() => handleCheckOut(room.roomNumber)}
                  className="flex-1 bg-stone-700 hover:bg-rose-600/20 hover:text-rose-400 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Process Check-Out
                </button>
              ) : (
                <button 
                  onClick={() => setSelectedRoom(room)}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-stone-950 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-amber-600/10"
                >
                  Check-In Guest
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Check-In Modal */}
      <AnimatePresence>
        {selectedRoom && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-3xl p-8 shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-serif text-stone-100">Guest Check-In</h2>
                            <p className="text-stone-500 text-xs uppercase tracking-widest mt-1">Room {selectedRoom.roomNumber} - {selectedRoom.roomType}</p>
                        </div>
                        <button onClick={() => setSelectedRoom(null)} className="p-2 text-stone-500 hover:text-stone-100 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleCheckIn} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-stone-500 font-bold tracking-widest ml-1">First Name</label>
                                <input 
                                    required
                                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 focus:outline-none focus:border-amber-500/50 transition-colors"
                                    value={formData.firstName}
                                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-stone-500 font-bold tracking-widest ml-1">Last Name</label>
                                <input 
                                    required
                                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 focus:outline-none focus:border-amber-500/50 transition-colors"
                                    value={formData.lastName}
                                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-stone-500 font-bold tracking-widest ml-1">Phone Number</label>
                            <input 
                                required
                                type="tel"
                                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 focus:outline-none focus:border-amber-500/50 transition-colors"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-stone-500 font-bold tracking-widest ml-1">ID Proof</label>
                            <input 
                                required
                                type="text"
                                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 focus:outline-none focus:border-amber-500/50 transition-colors"
                                value={formData.idProof}
                                onChange={e => setFormData({...formData, idProof: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-stone-500 font-bold tracking-widest ml-1">Number of Nights</label>
                            <input 
                                required
                                type="number"
                                min="1"
                                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 focus:outline-none focus:border-amber-500/50 transition-colors"
                                value={formData.nights}
                                onChange={e => setFormData({...formData, nights: parseInt(e.target.value)})}
                            />
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-xl shadow-amber-600/10 mt-4"
                        >
                            Confirm Booking
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Rooms;
