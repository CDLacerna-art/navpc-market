import React from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPlaceholder() {
  const { profile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="danger" size="sm">Admin Moderation Console</Badge>
          <h1 className="text-xl sm:text-2xl font-bold text-content-heading mt-1">Platform Moderation</h1>
          <p className="text-xs text-content-muted">Active Admin: {profile?.full_name} ({profile?.college_program})</p>
        </div>
        <Link to="/">
          <Button variant="secondary" size="sm" leftIcon={ArrowLeft}>
            Home
          </Button>
        </Link>
      </div>

      <Card padding={true} className="text-center py-12 space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-status-danger flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <Badge variant="danger" size="md">Phase 8 Preview</Badge>
        <h3 className="text-base font-bold text-content-heading">Administrator Console Initialized</h3>
        <p className="text-xs text-content-muted max-w-sm mx-auto">
          The administrator routing and privilege scope are registered. User role management, product moderation (Approve / Ban), category administration, and student reports will arrive in Phase 8.
        </p>
      </Card>
    </div>
  );
}
