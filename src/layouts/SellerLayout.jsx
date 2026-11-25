import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Boxes,
  ShoppingBag,
  BarChart3,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Store,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import RoleBadge from '../components/common/RoleBadge';
import InitialsAvatar from '../components/common/InitialsAvatar';

export default function SellerLayout() {
  const { user, profile, role, logout, isDemoMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/seller/dashboard', icon: LayoutDashboard },
    { label: 'My Products', path: '/seller/products', icon: Package },
    { label: 'Add Product', path: '/seller/products/new', icon: PlusCircle },
    { label: 'Inventory', path: '/seller/inventory', icon: Boxes },
    { label: 'Campus Orders', path: '/seller/orders', icon: ShoppingBag, badge: 'Phase 7' },
    { label: 'Analytics', path: '/seller/analytics', icon: BarChart3 },
    { label: 'Store Settings', path: '/seller/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg-surface flex flex-col md:flex-row font-sans text-content-body antialiased">
      {/* MOBILE HEADER */}
      <header className="md:hidden bg-white border-b border-ui-border px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-content-secondary hover:text-content-heading hover:bg-slate-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-md bg-brand-blue flex items-center justify-center text-white font-bold text-xs">
              NP
            </div>
            <span className="font-bold text-content-heading text-sm">Seller Hub</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/marketplace"
            className="text-xs font-medium text-brand-blue flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <span>Market</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <InitialsAvatar name={profile?.full_name || 'Seller'} size="xs" />
        </div>
      </header>

      {/* MOBILE SLIDE-OUT BACKDROP */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-ui-border flex flex-col z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* SIDEBAR BRANDING HEADER */}
        <div className="p-5 border-b border-ui-border">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-sm shadow-xs">
                NP
              </div>
              <div>
                <span className="font-extrabold text-content-heading text-base leading-tight block">
                  NavPC<span className="text-brand-blue">Market</span>
                </span>
                <span className="text-[10px] text-content-muted font-medium block">
                  Student Seller Hub
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-content-muted hover:text-content-heading p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SELLER IDENTITY CARD */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-ui-border">
            <div className="flex items-center space-x-2.5">
              <InitialsAvatar name={profile?.full_name || 'Seller'} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-content-heading truncate">
                  {profile?.full_name || 'Student Seller'}
                </p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <RoleBadge role={role || 'seller'} size="sm" />
                </div>
              </div>
            </div>
            {isDemoMode && (
              <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center space-x-1">
                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                <span>Demo Evaluation Mode</span>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/seller/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'text-content-body hover:bg-slate-100 hover:text-content-heading'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-content-secondary'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER & LOGOUT */}
        <div className="p-3 border-t border-ui-border space-y-1">
          <Link
            to="/marketplace"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium text-content-body hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-content-secondary" />
            <span>Back to Marketplace</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* DESKTOP TOP HEADER */}
        <header className="hidden md:flex bg-white border-b border-ui-border px-8 py-3.5 items-center justify-between sticky top-0 z-20 shadow-xs">
          <div>
            <span className="text-xs text-content-muted font-medium">NavPC Student Merchant Dashboard</span>
            <h2 className="text-sm font-bold text-content-heading">
              {profile?.full_name ? `${profile.full_name}'s Campus Store` : 'Campus Merchant Workspace'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/marketplace"
              className="text-xs font-semibold text-brand-blue flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <span>Explore Marketplace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-ui-border" />
            <div className="flex items-center space-x-2">
              <InitialsAvatar name={profile?.full_name || 'Seller'} size="sm" />
              <div className="text-left">
                <p className="text-xs font-semibold text-content-heading leading-tight">{profile?.full_name}</p>
                <p className="text-[10px] text-content-muted leading-tight">Student Seller</p>
              </div>
            </div>
          </div>
        </header>

        {/* SUBPAGE CONTENT OUTLET */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
