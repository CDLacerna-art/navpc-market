import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Store, ShoppingBag, Info } from 'lucide-react';

export default function RoleSwitchBanner() {
  const { role, switchRole, isDemoMode, profile } = useAuth();

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Campus project indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-blue text-white uppercase tracking-wider">
            NPC Technopreneurship
          </span>
          <span className="hidden sm:inline text-slate-300">
            NavPC Market Prototype •
          </span>
          <span className="text-slate-400">
            {isDemoMode ? 'Local Campus Demo Mode' : 'Connected to Supabase'}
          </span>
        </div>

        {/* Right: Quick Role Switcher for instant testing */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] text-slate-400 hidden md:inline">
            Active Role: <strong className="text-white capitalize">{profile?.full_name || role}</strong>
          </span>
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => switchRole('buyer')}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                role === 'buyer'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Student Buyer role"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => switchRole('seller')}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                role === 'seller'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Student Seller role"
            >
              <Store className="w-3 h-3" />
              <span>Seller</span>
            </button>
            <button
              type="button"
              onClick={() => switchRole('admin')}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                role === 'admin'
                  ? 'bg-status-danger text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Administrator role"
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
