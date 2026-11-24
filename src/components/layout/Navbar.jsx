import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import RoleBadge from '../common/RoleBadge';
import Button from '../common/Button';
import InitialsAvatar from '../common/InitialsAvatar';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Store,
  ShieldCheck,
  User,
  ShoppingBag,
  Heart,
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { role, profile, logout, switchRole } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'text-brand-blue font-semibold'
        : 'text-content-body hover:text-brand-blue'
    }`;

  const handleBecomeSeller = () => {
    // If not yet a seller in demo mode, activate seller view
    if (role !== 'seller') {
      switchRole('seller');
    }
    navigate('/seller/dashboard');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-white border-b border-surface-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <Logo size="md" />
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search calculators, uniforms, snacks, gadgets..."
                className="w-full bg-surface-bg border border-surface-border rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-content-heading placeholder:text-content-subtle focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
              />
              <Search className="w-4 h-4 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/marketplace" className={navLinkClass}>
              Marketplace
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            
            {/* Become a Seller Link */}
            <button
              type="button"
              onClick={handleBecomeSeller}
              className="inline-flex items-center gap-1 text-sm font-medium text-content-body hover:text-brand-blue transition-colors"
            >
              <Store className="w-4 h-4 text-brand-blue" />
              <span>Become a Seller</span>
            </button>

            {/* Quick role-specific destination pill */}
            {role === 'seller' && (
              <NavLink to="/seller/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-dark bg-brand-light px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                <Store className="w-3.5 h-3.5" />
                <span>Seller Center</span>
              </NavLink>
            )}

            {role === 'admin' && (
              <NavLink to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Moderation</span>
              </NavLink>
            )}
          </nav>

          {/* Right Action Icons & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Shopping Cart Button with Dynamic Badge Count */}
            <Link
              to="/cart"
              className="relative p-2 text-content-body hover:text-brand-blue hover:bg-surface-bg rounded-lg transition-colors"
              title="Campus Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-brand-blue text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-bg border border-transparent hover:border-surface-border transition-colors text-left focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                <InitialsAvatar
                  name={profile?.full_name || 'NPC Student'}
                  size="sm"
                  className="ring-1 ring-surface-border"
                />
                <div className="hidden xl:flex flex-col">
                  <span className="text-xs font-semibold text-content-heading line-clamp-1 leading-tight">
                    {profile?.full_name || 'NPC Student'}
                  </span>
                  <span className="text-[10px] text-content-muted capitalize leading-tight">
                    {role === 'seller' ? 'Student Seller' : role === 'admin' ? 'Administrator' : 'Student Buyer'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-content-muted hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-surface-border py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-surface-border flex items-center gap-2.5">
                      <InitialsAvatar
                        name={profile?.full_name || 'NPC Student'}
                        size="md"
                        className="ring-1 ring-surface-border"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-content-heading line-clamp-1">{profile?.full_name}</p>
                        <p className="text-[11px] text-content-muted truncate">{profile?.email}</p>
                        <div className="mt-1">
                          <RoleBadge role={role} />
                        </div>
                      </div>
                    </div>

                    <div className="py-1 text-xs">
                      <Link
                        to="/buyer/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-content-body hover:bg-surface-bg transition-colors"
                      >
                        <User className="w-4 h-4 text-content-muted" />
                        <span>Buyer Dashboard</span>
                      </Link>
                      <Link
                        to="/buyer/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-content-body hover:bg-surface-bg transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-content-muted" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/buyer/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-content-body hover:bg-surface-bg transition-colors"
                      >
                        <Heart className="w-4 h-4 text-content-muted" />
                        <span>Saved Wishlist</span>
                      </Link>

                      <div className="border-t border-surface-border my-1" />

                      <Link
                        to="/seller/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-brand-dark font-medium hover:bg-brand-light transition-colors"
                      >
                        <Store className="w-4 h-4 text-brand-blue" />
                        <span>Seller Hub</span>
                      </Link>

                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-red-700 font-medium hover:bg-red-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        <span>Admin Console</span>
                      </Link>
                    </div>

                    <div className="border-t border-surface-border pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-content-muted hover:text-status-danger hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Reset Session / Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-content-body hover:bg-surface-bg rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campus products..."
              className="w-full bg-surface-bg border border-surface-border rounded-lg pl-9 pr-4 py-2 text-xs text-content-heading placeholder:text-content-subtle focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            <Search className="w-4 h-4 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-border bg-white px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-brand-light text-brand-dark font-semibold' : 'text-content-body hover:bg-surface-bg'
                }`
              }
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-brand-light text-brand-dark font-semibold' : 'text-content-body hover:bg-surface-bg'
                }`
              }
            >
              Marketplace
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-brand-light text-brand-dark font-semibold' : 'text-content-body hover:bg-surface-bg'
                }`
              }
            >
              About
            </NavLink>
            <button
              type="button"
              onClick={handleBecomeSeller}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-content-body hover:bg-surface-bg text-left"
            >
              <Store className="w-4 h-4 text-brand-blue" />
              <span>Become a Seller</span>
            </button>
            <NavLink
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-content-body hover:bg-surface-bg"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-brand-blue" />
                <span>Shopping Cart</span>
              </div>
              <span className="bg-brand-blue text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {totalItems} items
              </span>
            </NavLink>
          </nav>

          <div className="pt-2 border-t border-surface-border flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-content-muted px-1">
              Campus Portals
            </span>
            <Link
              to="/seller/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-brand-dark text-xs font-semibold"
            >
              <Store className="w-4 h-4 text-brand-blue" />
              <span>Student Seller Hub</span>
            </Link>
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-semibold"
            >
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>Admin Moderation</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
