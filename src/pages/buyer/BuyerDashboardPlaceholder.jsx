import React from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BuyerDashboardPlaceholder({ title = "Buyer Dashboard", phase = "Phase 7" }) {
  const { profile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="neutral" size="sm">Student Buyer Portal</Badge>
          <h1 className="text-xl sm:text-2xl font-bold text-content-heading mt-1">{title}</h1>
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
          <ShoppingBag className="w-6 h-6" />
        </div>
        <Badge variant="primary" size="md">{phase} Preview</Badge>
        <h3 className="text-base font-bold text-content-heading">{title} Initialized</h3>
        <p className="text-xs text-content-muted max-w-sm mx-auto">
          The layout and authentication state are wired. Full order tracking, live status milestones, and wishlist will arrive in {phase}.
        </p>
      </Card>
    </div>
  );
}
