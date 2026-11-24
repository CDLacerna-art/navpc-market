import React from 'react';
import Badge from './Badge';
import { ShieldCheck, Store, ShoppingBag } from 'lucide-react';

export default function RoleBadge({ role, size = 'sm' }) {
  switch (role) {
    case 'admin':
      return (
        <Badge variant="danger" size={size} icon={ShieldCheck}>
          Administrator
        </Badge>
      );
    case 'seller':
      return (
        <Badge variant="primary" size={size} icon={Store}>
          Student Seller
        </Badge>
      );
    case 'buyer':
    default:
      return (
        <Badge variant="neutral" size={size} icon={ShoppingBag}>
          Student Buyer
        </Badge>
      );
  }
}
