import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Info, CheckCircle, RefreshCcw, Sparkles } from "lucide-react";

const API_BASE = "http://localhost:8080/api";

const Cleaning = () => {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${API_BASE}/rooms`);
            // Only show Cleaning or Maintenance rooms
            setRooms(response.data.filter((r: any) => r.status === 'CLEANING' || r.status === 'MAINTENANCE'));
            setLoading(false);
        } catch (error) {
            console.error("Error fetching cleaning status", error);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleMarkReady = async (roomNumber: number) => {
        try {
            await axios.post(`${API_BASE}/rooms/${roomNumber}/ready`);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update status");
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div className="space-y-8">
            <header>
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif text-stone-100">Housekeeping Queue</h1>
                        <p className="text-stone-500 text-sm">Rooms awaiting preparation for new guests</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={room.roomNumber}
                        className="bg-stone-900/50 border border-stone-800 p-6 rounded-[2rem] flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-4xl font-serif text-stone-600">R{room.roomNumber}</span>
                                <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] uppercase font-bold tracking-widest">
                                    Needs {room.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-medium text-stone-100 mb-2">{room.roomType}</h3>
                            <div className="flex items-center gap-2 text-stone-500 text-xs py-3 px-4 bg-stone-950 rounded-xl border border-stone-800">
                                <Info size={14} /> Last checkout was recent
                            </div>
                        </div>

                        <button 
                            onClick={() => handleMarkReady(room.roomNumber)}
                            className="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 text-stone-950 py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest transition-all"
                        >
                            <CheckCircle size={18} /> Mark as Prepared
                        </button>
                    </motion.div>
                ))}

                {rooms.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-stone-800 rounded-[3rem]">
                        <div className="flex justify-center mb-4 text-stone-700"><RefreshCcw size={40} className="animate-spin-slow" /></div>
                        <p className="text-stone-500 font-serif text-xl">All rooms are currently pristine.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cleaning;
