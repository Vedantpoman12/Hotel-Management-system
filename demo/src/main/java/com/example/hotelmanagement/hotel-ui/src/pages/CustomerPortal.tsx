import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogOut, Star, MapPin, Coffee, Wifi, ShieldCheck, Waves, X, Calendar, CheckCircle, BellRing, DoorClosed } from "lucide-react";

const API_BASE = "http://localhost:8080/api";

const CustomerPortal = () => {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [nights, setNights] = useState(1);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [idProof, setIdProof] = useState("");
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [roomCredentials, setRoomCredentials] = useState<any>(null);
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const navigate = useNavigate();

    const fetchRooms = async () => {
        try {
            const [roomsRes, bookingsRes] = await Promise.all([
                axios.get(`${API_BASE}/rooms`),
                axios.get(`${API_BASE}/bookings`)
            ]);
            
            setRooms(roomsRes.data.filter((r: any) => String(r.status).toUpperCase() === 'AVAILABLE'));
            
            const userBookings = bookingsRes.data.filter((b: any) => b.guest.name === user.fullName);
            setMyBookings(userBookings);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    useEffect(() => { fetchRooms(); }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleOrderService = async (roomNumber: number, serviceName: string, price: number) => {
        try {
            await axios.post(`${API_BASE}/bookings/${roomNumber}/services`, { serviceName, price });
            alert(`Thanks! ${serviceName} will be delivered to Room ${roomNumber} shortly.`);
        } catch (error: any) {
            alert("Failed to order room service.");
        }
    };

    const handleCheckOut = async (roomNumber: number) => {
        try {
            const res = await axios.post(`${API_BASE}/checkout/${roomNumber}`);
            alert(`Check-out successful! Total Bill: ₹${res.data.totalBill}`);
            fetchRooms(); // Refresh UI
        } catch (error: any) {
            alert(error.response?.data?.message || "Checkout failed");
        }
    };

    const handleReserve = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE}/book`, {
                roomNumber: selectedRoom.roomNumber,
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                idProof: idProof,
                nights: nights
            });
            setRoomCredentials({ username: res.data.portalUsername, password: res.data.portalPassword });
            setBookingSuccess(true);
        } catch (error: any) {
            alert(error.response?.data?.message || "Booking failed");
        }
    };

    const handleAcknowledgeKeys = () => {
        setBookingSuccess(false);
        setRoomCredentials(null);
        setSelectedRoom(null);
        fetchRooms();
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-stone-950 text-amber-500 font-serif text-2xl animate-pulse text-center">Azure Resort<br/><span className="text-xs uppercase tracking-[0.5em] text-stone-600 mt-4 block">Loading Sanctuaries</span></div>;

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100">
            <nav className="border-b border-stone-800/50 px-8 py-6 flex justify-between items-center bg-stone-950/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-stone-950 font-serif text-xl font-bold">A</div>
                    <div>
                        <h1 className="text-xl font-serif tracking-tight">Grand Azure</h1>
                        <p className="text-[9px] text-amber-500 uppercase tracking-[0.3em] font-bold">Guest Portal</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-stone-400 font-medium hidden md:block italic">Welcome back, {user.fullName}</span>
                    <button onClick={handleLogout} className="p-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-500 hover:text-rose-400 hover:bg-rose-400/5 transition-all">
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-8 py-16">
                <header className="mb-16">
                    <div className="flex items-center gap-2 mb-4">
                        {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-amber-500 text-amber-500" />)}
                        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest ml-2">Five Star Sanctuary</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-serif text-stone-100 mb-6 leading-tight max-w-2xl">Discover Your Perfect Escape.</h2>
                    <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-stone-500">
                        <span className="flex items-center gap-2 px-4 py-2 bg-stone-900 rounded-full border border-stone-800"><Wifi size={14} /> Ultra Fast Wifi</span>
                        <span className="flex items-center gap-2 px-4 py-2 bg-stone-900 rounded-full border border-stone-800"><Coffee size={14} /> Luxury Breakfast</span>
                        <span className="flex items-center gap-2 px-4 py-2 bg-stone-900 rounded-full border border-stone-800"><ShieldCheck size={14} /> 24/7 Security</span>
                    </div>
                </header>

                {myBookings.length > 0 && (
                    <section className="mb-20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                            <h3 className="text-2xl font-serif text-stone-100">Your Active Stays</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {myBookings.map((b) => (
                                <motion.div key={b.room.roomNumber} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-stone-900 border border-amber-500/30 shadow-[0_0_40px_-10px_rgba(217,119,6,0.1)] rounded-[2rem] p-8">
                                    <div className="flex justify-between items-start mb-6 border-b border-stone-800 pb-6">
                                        <div>
                                            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-1">Checked In: {b.checkIn}</p>
                                            <h4 className="text-3xl font-serif text-stone-100">Room {b.room.roomNumber}</h4>
                                            <p className="text-stone-400 text-sm mt-1">{b.room.roomType} • {b.duration} Nights</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Current Bill</p>
                                            <p className="text-2xl font-serif text-stone-100">₹{b.totalAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        <button onClick={() => handleOrderService(b.room.roomNumber, "Breakfast Delivery", 800)} className="bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-300 font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex flex-col items-center gap-1.5 group">
                                            <Coffee size={16} className="text-stone-500 group-hover:text-stone-900" /> Breakfast
                                        </button>
                                        <button onClick={() => handleOrderService(b.room.roomNumber, "Laundry Service", 500)} className="bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-300 font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex flex-col items-center gap-1.5 group">
                                            <Waves size={16} className="text-stone-500 group-hover:text-stone-900" /> Laundry
                                        </button>
                                        <button onClick={() => handleOrderService(b.room.roomNumber, "Spa Massage", 2500)} className="bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-300 font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex flex-col items-center gap-1.5 group">
                                            <BellRing size={16} className="text-stone-500 group-hover:text-stone-900" /> Massage
                                        </button>
                                        <button onClick={() => handleCheckOut(b.room.roomNumber)} className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-stone-950 text-rose-400 font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex flex-col items-center gap-1.5 group">
                                            <DoorClosed size={16} className="text-rose-400 group-hover:text-stone-900" /> Express Out
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {rooms.map((room, i) => (
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={room.roomNumber} className="group">
                            <div className="relative aspect-[16/10] bg-stone-900 rounded-[2rem] overflow-hidden mb-6 border border-stone-800 group-hover:border-amber-500/30 transition-all duration-700">
                                <div className="absolute inset-0 bg-gradient-to-tr from-stone-950 via-stone-900 to-stone-800 opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Waves size={80} className="text-stone-800/50 group-hover:scale-110 group-hover:text-amber-500/10 transition-all duration-700" />
                                </div>
                                <div className="absolute top-6 left-6"><span className="px-4 py-1.5 bg-stone-950/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-stone-800/50">Luxury {room.roomType}</span></div>
                                <div className="absolute bottom-6 right-6 flex items-end flex-col">
                                    <p className="text-stone-400 text-xs mb-1 uppercase font-bold tracking-widest">Rate starting from</p>
                                    <p className="text-4xl font-serif text-amber-500">₹{room.basePrice.toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-serif text-stone-100 mb-2 truncate group-hover:text-amber-500 transition-colors">The {room.roomType} Room {room.roomNumber}</h3>
                                    <p className="text-stone-500 text-sm flex items-center gap-2"><MapPin size={14} className="text-amber-600" /> North Wing, Ocean Side View</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setSelectedRoom(room)} className="px-10 py-4 bg-stone-100 text-stone-950 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-white/5 active:scale-95">
                                        Reserve Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {rooms.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-stone-800 rounded-[3rem]">
                        <p className="text-stone-500 font-serif text-xl italic">Our sanctuaries are currently full. Please contact concierge.</p>
                    </div>
                )}
            </main>

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedRoom && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                            {bookingSuccess && roomCredentials ? (
                                <div className="py-10 text-center">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={40} />
                                    </motion.div>
                                    <h3 className="text-2xl font-serif text-stone-100 mb-2">Sanctuary Reserved</h3>
                                    <p className="text-stone-400 text-sm mb-6">Secure your Digital Room Keys below.</p>
                                    
                                    <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 mb-6 font-mono text-left space-y-4">
                                        <div>
                                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-1">Portal Username</p>
                                            <p className="text-amber-500 text-xl font-bold">{roomCredentials.username}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-1">Portal Password</p>
                                            <p className="text-amber-500 text-xl font-bold">{roomCredentials.password}</p>
                                        </div>
                                    </div>
                                    
                                    <button onClick={handleAcknowledgeKeys} className="w-full px-6 py-4 bg-stone-100 text-stone-950 rounded-2xl font-bold uppercase tracking-widest text-xs transition-colors hover:bg-amber-500 shadow-xl shadow-white/5 active:scale-95">
                                        I've Saved My Keys
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h2 className="text-3xl font-serif text-stone-100">Reserve Stay</h2>
                                            <p className="text-amber-500 text-[10px] uppercase tracking-widest font-bold mt-1">Room {selectedRoom.roomNumber} · {selectedRoom.roomType}</p>
                                        </div>
                                        <button onClick={() => setSelectedRoom(null)} className="p-2 text-stone-500 hover:text-stone-100 transition-colors"><X size={24} /></button>
                                    </div>
                                    <form onSubmit={handleReserve} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] border-stone-700 uppercase text-stone-500 font-bold tracking-widest ml-1">First Name</label>
                                                <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-stone-800 border-stone-700 border rounded-2xl px-4 py-3.5 text-stone-100 focus:outline-none focus:border-amber-500/50 transition-all text-sm placeholder:text-stone-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] border-stone-700 uppercase text-stone-500 font-bold tracking-widest ml-1">Last Name</label>
                                                <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-stone-800 border-stone-700 border rounded-2xl px-4 py-3.5 text-stone-100 focus:outline-none focus:border-amber-500/50 transition-all text-sm placeholder:text-stone-600" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] border-stone-700 uppercase text-stone-500 font-bold tracking-widest ml-1">Contact Phone</label>
                                                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-stone-800 border-stone-700 border rounded-2xl px-4 py-3.5 text-stone-100 focus:outline-none focus:border-amber-500/50 transition-all text-sm placeholder:text-stone-600 space-y-1" placeholder="+91 99999-99999" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] border-stone-700 uppercase text-stone-500 font-bold tracking-widest ml-1">ID Number</label>
                                                <input required type="text" value={idProof} onChange={e => setIdProof(e.target.value)} className="w-full bg-stone-800 border-stone-700 border rounded-2xl px-4 py-3.5 text-stone-100 focus:outline-none focus:border-amber-500/50 transition-all text-sm placeholder:text-stone-600" placeholder="Passport/DL" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] border-stone-700 uppercase text-stone-500 font-bold tracking-widest ml-1">Length of Stay (Nights)</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={20} />
                                                <input required type="number" min="1" value={nights} onChange={e => setNights(parseInt(e.target.value))} className="w-full bg-stone-800 border-stone-700 border rounded-2xl pl-12 pr-6 py-4 text-stone-100 focus:outline-none focus:border-amber-500/50 transition-all" />
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-stone-800 flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] uppercase text-stone-600 font-bold tracking-widest">Total Amount</p>
                                                <p className="text-3xl font-serif text-amber-500">₹{(selectedRoom.basePrice * nights).toLocaleString()}</p>
                                            </div>
                                            <button type="submit" className="px-10 py-5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-600/20 active:scale-95">Confirm Stay</button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerPortal;
