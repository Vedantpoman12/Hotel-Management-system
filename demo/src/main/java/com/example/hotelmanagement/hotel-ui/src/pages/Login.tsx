import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Hotel, User, Lock } from "lucide-react";

const API_BASE = "http://localhost:8080/api/auth";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE}/login`, { username, password });
            localStorage.setItem("user", JSON.stringify(res.data));
            
            if (res.data.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/portal");
            }
        } catch (err) {
            setError("Invalid credentials. Try admin/admin123 or customer/cust123");
        }
    };

    return (
        <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative background blur */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-stone-600/10 rounded-full blur-3xl" />

                <div className="relative z-10 text-center mb-10">
                    <div className="w-16 h-16 bg-amber-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/10">
                        <Hotel className="text-amber-500" size={32} />
                    </div>
                    <h1 className="text-3xl font-serif text-stone-100 font-medium tracking-tight">Welcome Back</h1>
                    <p className="text-stone-500 text-sm mt-3 font-medium uppercase tracking-[0.2em]">Grand Azure Resort</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                    {error && (
                        <p className="text-rose-400 bg-rose-400/10 border border-rose-400/20 px-4 py-3 rounded-2xl text-xs text-center font-medium">
                            {error}
                        </p>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase text-stone-500 font-bold tracking-widest ml-4">Username</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600"><User size={18} /></span>
                            <input 
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-stone-800/50 border border-stone-700/50 rounded-2xl pl-12 pr-6 py-4 text-stone-100 focus:outline-none focus:border-amber-500/50 focus:bg-stone-800 transition-all placeholder:text-stone-700"
                                placeholder="Enter username"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase text-stone-500 font-bold tracking-widest ml-4">Password</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600"><Lock size={18} /></span>
                            <input 
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-stone-800/50 border border-stone-700/50 rounded-2xl pl-12 pr-6 py-4 text-stone-100 focus:outline-none focus:border-amber-500/50 focus:bg-stone-800 transition-all placeholder:text-stone-700"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <motion.button 
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 py-5 rounded-2xl font-bold uppercase tracking-[0.15em] text-sm transition-all shadow-xl shadow-amber-600/10 flex items-center justify-center gap-2 group"
                    >
                        Login to Portal
                        <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </form>

                <div className="mt-8 text-center text-stone-600 text-xs">
                    <p>Demo Admin: admin / admin123</p>
                    <p className="mt-1">Demo Customer: customer / cust123</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
