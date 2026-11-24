import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { ShieldCheck, MapPin, Heart, ExternalLink, HelpCircle } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../utils/constants';

export default function Footer() {
  return (
    <footer className="bg-surface-white border-t border-surface-border mt-16 text-content-body">
      {/* Upper Footer: Campus trust and academic disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info (2 columns wide on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" />
            <p className="text-xs text-content-muted leading-relaxed max-w-sm">
              NavPC Market is the proposed technology-based student commerce platform for Navotas Polytechnic College. Fostering student entrepreneurship, safe peer-to-peer campus exchanges, and digital commerce.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-bg border border-surface-border text-xs text-content-body">
              <MapPin className="w-3.5 h-3.5 text-brand-blue shrink-0" />
              <span>Navotas Polytechnic College • Navotas City, Metro Manila</span>
            </div>

            {/* Academic Technopreneurship Notice */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-snug">
              <span className="font-semibold block mb-0.5">Academic Compliance Disclosure</span>
              This platform is an independent student project developed as a partial requirement for <strong>Technopreneurship</strong>. It is not an official Navotas Polytechnic College administrative website and does not claim institutional endorsement.
            </div>
          </div>

          {/* Column: Marketplace Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-heading mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/marketplace?category=${cat.slug}`}
                    className="text-content-muted hover:text-brand-blue transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-heading mb-3">
              Platform Links
            </h4>
            <ul className="space-y-2 text-xs text-content-muted">
              <li>
                <Link to="/marketplace" className="hover:text-brand-blue transition-colors">
                  Explore Marketplace
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="hover:text-brand-blue transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link to="/buyer/orders" className="hover:text-brand-blue transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-blue transition-colors">
                  About the Project
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-brand-blue transition-colors">
                  Admin Moderation
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Campus Safety & Guidelines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-heading mb-3">
              Safety & Guidelines
            </h4>
            <div className="space-y-3 text-xs text-content-muted">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <span className="leading-tight">Designated Campus Meetup Zones (SAC, Library, Canteen).</span>
              </div>
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <span className="leading-tight">Student-to-student verified transactions.</span>
              </div>
              <p className="text-[11px] text-content-subtle pt-1">
                Tagline: <em>Your Campus. Your Marketplace.</em>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright bar */}
      <div className="border-t border-surface-border bg-gray-50/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-content-muted">
          <p>© {new Date().getFullYear()} NavPC Market. Built for NPC Technopreneurship.</p>
          <p className="flex items-center gap-1">
            Engineered with React, Vite & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
