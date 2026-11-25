import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';
import Button from '../common/Button';

/**
 * RequireAuth Guard
 * Ensures user is authenticated (or running in explicit demo mode).
 */
export function RequireAuth({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-content-muted">Verifying campus session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * RequireRole Guard
 * Ensures user possesses one of the allowed roles (e.g. ['seller', 'admin'] or ['admin']).
 * Renders an informative Access Denied screen instead of a blank page.
 */
export function RequireRole({ allowedRoles = [], roleTitle = 'Authorized Personnel', children }) {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-content-muted">Verifying credentials and role permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRole = allowedRoles.includes(role);

  if (!hasRole) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-status-danger border border-red-200 flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-heading">
            Access Restricted
          </h1>
          <p className="text-sm text-content-muted max-w-md mx-auto leading-relaxed">
            This portal is restricted to <strong>{roleTitle}</strong>. Your account currently holds the <span className="capitalize font-semibold text-brand-dark bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{role || 'buyer'}</span> role.
          </p>
        </div>

        <div className="p-4 bg-surface-bg border border-surface-border rounded-xl max-w-md mx-auto text-xs text-content-muted space-y-2 text-left">
          <div className="flex items-center gap-2 font-semibold text-content-heading">
            <Lock className="w-4 h-4 text-brand-blue shrink-0" />
            <span>Role-Based Access Enforcement</span>
          </div>
          <p>
            In accordance with NavPC Market governance rules, student accounts are initially provisioned as buyers. Administrative or seller privileges must be granted by platform administrators.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button variant="secondary" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button variant="primary" onClick={() => window.location.href = '/marketplace'}>
            Explore Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
