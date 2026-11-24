import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function MarketplacePlaceholder() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <Card padding={true} className="space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-brand-light text-brand-blue flex items-center justify-center">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <Badge variant="primary" size="md">
          Phase 3 Preview
        </Badge>
        <h2 className="text-xl font-bold text-content-heading">
          Marketplace Catalog Route Connected
        </h2>
        <p className="text-xs sm:text-sm text-content-muted max-w-md mx-auto">
          The routing foundation is established. The full interactive product grid, filter sidebar, price filter, and search features will be implemented in Phase 3.
        </p>
        <div className="pt-4">
          <Link to="/">
            <Button variant="secondary" leftIcon={ArrowLeft}>
              Return to Homepage
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
