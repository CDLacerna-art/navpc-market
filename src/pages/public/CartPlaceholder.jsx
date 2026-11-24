import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export default function CartPlaceholder() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <Card padding={true} className="space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-brand-light text-brand-blue flex items-center justify-center">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <Badge variant="primary" size="md">
          Phase 4 Preview
        </Badge>
        <h2 className="text-xl font-bold text-content-heading">
          Campus Shopping Cart Route Ready
        </h2>
        <p className="text-xs sm:text-sm text-content-muted max-w-md mx-auto">
          The cart navigation and header counter badge are in place. The live checkout and campus meetup scheduling modal will be implemented in Phase 4.
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
