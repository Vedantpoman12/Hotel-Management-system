import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-stone-950 text-stone-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* This is where your pages (Dashboard, Rooms) will render */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;