import React from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { Store, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SellerDashboardPlaceholder() {
  const { profile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="primary" size="sm">Student Seller Portal</Badge>
          <h1 className="text-xl sm:text-2xl font-bold text-content-heading mt-1">Seller Hub</h1>
          <p className="text-xs text-content-muted">Welcome, {profile?.full_name} ({profile?.college_program})</p>
        </div>
        <Link to="/">
          <Button variant="secondary" size="sm" leftIcon={ArrowLeft}>
            Home
          </Button>
        </Link>
      </div>

      <Card padding={true} className="text-center py-12 space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-brand-blue flex items-center justify-center">
          <Store className="w-6 h-6" />
        </div>
        <Badge variant="primary" size="md">Phase 6 Preview</Badge>
        <h3 className="text-base font-bold text-content-heading">Student Seller Dashboard Initialized</h3>
        <p className="text-xs text-content-muted max-w-sm mx-auto">
          The seller routing and role switcher are ready. Full inventory management, product creation, order dispatch, and Recharts sales analytics will be delivered in Phase 6.
        </p>
      </Card>
    </div>
  );
}
