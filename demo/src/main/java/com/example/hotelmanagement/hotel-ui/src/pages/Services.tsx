import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Coffee, Utensils, Check, Clock, TrendingUp } from "lucide-react";

const API_BASE = "http://localhost:8080/api";

const ServiceManagement = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_BASE}/services/pending`);
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching service orders", error);
        }
    };

    useEffect(() => { 
        fetchOrders();
        const intv = setInterval(fetchOrders, 10000);
        return () => clearInterval(intv);
    }, []);

    const handleComplete = async (id: number) => {
        try {
            await axios.post(`${API_BASE}/services/${id}/complete`);
            fetchOrders();
        } catch (error) {
            alert("Failed to complete order");
        }
    };

    if (loading) return <div className="text-white">Loading Orders...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif text-stone-100 italic font-medium underline underline-offset-8 decoration-amber-500/50">Room Service Desk</h1>
                    <p className="text-stone-500 text-sm mt-4">Fulfilling guest requests in real-time</p>
                </div>
                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center gap-4">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><TrendingUp size={16} /></div>
                    <div className="pr-4">
                        <p className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">Active Requests</p>
                        <p className="text-xl font-bold text-stone-100">{orders.length}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={order.id}
                        className="bg-stone-900/50 border border-stone-800 p-6 rounded-3xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-stone-800 rounded-2xl flex items-center justify-center text-amber-500 border border-stone-700">
                                {order.serviceName.toLowerCase().includes("breakfast") ? <Utensils size={24} /> : <Coffee size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-stone-100">{order.serviceName}</h3>
                                <p className="text-stone-500 text-sm">Room <span className="text-amber-500 font-bold">{order.roomNumber}</span> · {order.guest}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-stone-200 font-serif text-xl">₹{order.price}</p>
                                <p className="text-[10px] text-stone-600 flex items-center gap-1 justify-end uppercase font-bold tracking-widest leading-none mt-1">
                                    <Clock size={10} /> Pending
                                </p>
                            </div>
                            <button 
                                onClick={() => handleComplete(order.id)}
                                className="p-4 bg-stone-800 hover:bg-emerald-600 hover:text-stone-950 rounded-2xl transition-all text-stone-400"
                            >
                                <Check size={24} />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {orders.length === 0 && (
                    <div className="py-20 text-center border border-stone-800 rounded-[3rem] bg-stone-900/10">
                        <p className="text-stone-700 font-serif text-2xl">No pending requests.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceManagement;
