import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, Search, Phone, Fingerprint, Calendar } from "lucide-react";

const API_BASE = "http://localhost:8080/api";

const GuestManagement = () => {
    const [guests, setGuests] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const response = await axios.get(`${API_BASE}/guests`);
                setGuests(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching guests", error);
            }
        };
        fetchGuests();
    }, []);

    const filteredGuests = guests.filter(g => 
        g.name.toLowerCase().includes(search.toLowerCase()) || 
        g.contactNumber.includes(search)
    );

    if (loading) return <div className="text-white">Loading Guests...</div>;

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-serif text-stone-100">Guest Directory</h1>
                    <p className="text-stone-500 text-sm mt-2 font-medium uppercase tracking-[0.2em]">Grand Azure Historical Records</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
                    <input 
                        className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-12 pr-6 py-4 text-sm text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500/50 transition-all"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-stone-900/50 border border-stone-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-stone-950/50 border-b border-stone-800">
                            <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-stone-300 font-bold">Guest Particulars</th>
                            <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-stone-300 font-bold">Contact</th>
                            <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-stone-300 font-bold">Identity Proof</th>
                            <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-stone-300 font-bold text-right">Reference ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/50">
                        {filteredGuests.map((guest, i) => (
                            <motion.tr 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                key={guest.guestId} 
                                className="group hover:bg-stone-800/20 transition-colors"
                            >
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 font-serif border border-stone-700 group-hover:bg-amber-600 group-hover:text-stone-950 transition-all">
                                            {guest.name[0]}
                                        </div>
                                        <div className="text-stone-100 font-medium">{guest.name}</div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-stone-400 text-sm">
                                        <Phone size={14} className="text-stone-600" /> {guest.contactNumber}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-stone-400 text-sm">
                                        <Fingerprint size={14} className="text-stone-600" /> 
                                        {guest.idProof && guest.idProof !== "N/A" ? guest.idProof : <span className="opacity-50 italic text-stone-500">Unprovided</span>}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right font-mono text-[10px] text-stone-600">
                                    {guest.guestId.substring(0, 13)}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                
                {filteredGuests.length === 0 && (
                    <div className="p-20 text-center text-stone-700 font-serif italic text-lg">
                        No historical records found for this query.
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuestManagement;
