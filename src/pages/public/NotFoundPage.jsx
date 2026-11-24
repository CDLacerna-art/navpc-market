import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-status-warning flex items-center justify-center">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-content-heading">Page Not Found</h1>
      <p className="text-xs sm:text-sm text-content-muted">
        The campus link or page you are looking for does not exist or has been relocated.
      </p>
      <div className="pt-2">
        <Link to="/">
          <Button variant="primary" leftIcon={Home}>
            Back to NavPC Market
          </Button>
        </Link>
      </div>
    </div>
  );
}
