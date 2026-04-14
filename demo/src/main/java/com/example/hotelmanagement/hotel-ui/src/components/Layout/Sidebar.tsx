import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  DoorOpen, 
  Users, 
  Settings, 
  LogOut,
  Hotel
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: DoorOpen, label: 'Rooms', path: '/admin/rooms' },
    { icon: Users, label: 'Guests', path: '/admin/bookings' },
  ];

  return (
    <aside className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-amber-600 p-2 rounded-lg text-stone-900">
          <Hotel size={24} strokeWidth={2.5} />
        </div>
        <span className="font-serif text-xl font-medium tracking-tight text-stone-100">
          Hotel
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-amber-600/10 text-amber-500 shadow-[inset_0_0_0_1px_rgba(217,119,6,0.2)]' 
                  : 'text-stone-500 hover:bg-stone-800 hover:text-stone-200'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-stone-800">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-stone-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl text-sm font-medium transition-all">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;