import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import RoleSwitchBanner from '../components/layout/RoleSwitchBanner';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-content-body antialiased">
      {/* Top Demo Simulation Banner */}
      <RoleSwitchBanner />

      {/* Main Sticky Navigation */}
      <Navbar />

      {/* Content Area */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer with Technopreneurship compliance */}
      <Footer />
    </div>
  );
}
