import React from 'react';
import {
  BookOpen,
  Utensils,
  Shirt,
  Laptop,
  Sparkles,
  Package
} from 'lucide-react';

/**
 * Returns icon and styling for category placeholder
 */
const CATEGORY_MAP = {
  'school-supplies': {
    icon: BookOpen,
    bg: 'bg-blue-50 text-blue-600',
    border: 'border-blue-200',
    label: 'School Supplies',
  },
  'food-beverages': {
    icon: Utensils,
    bg: 'bg-amber-50 text-amber-600',
    border: 'border-amber-200',
    label: 'Food & Beverages',
  },
  'clothing-accessories': {
    icon: Shirt,
    bg: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-200',
    label: 'Clothing & Accessories',
  },
  'electronics': {
    icon: Laptop,
    bg: 'bg-purple-50 text-purple-600',
    border: 'border-purple-200',
    label: 'Electronics',
  },
  'digital-services': {
    icon: Sparkles,
    bg: 'bg-indigo-50 text-indigo-600',
    border: 'border-indigo-200',
    label: 'Digital Services',
  },
  'others': {
    icon: Package,
    bg: 'bg-slate-50 text-slate-600',
    border: 'border-slate-200',
    label: 'Other Products',
  },
};

export default function CategoryPlaceholder({
  categorySlug = 'others',
  categoryName = 'Marketplace Item',
  className = '',
}) {
  const match = CATEGORY_MAP[categorySlug] || CATEGORY_MAP['others'];
  const IconComponent = match.icon;

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center p-4 select-none ${match.bg} ${className}`}
      aria-label={categoryName}
    >
      <div className="p-3 bg-white/80 rounded-2xl shadow-xs border border-white/60 mb-2">
        <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
      </div>
      <span className="text-[11px] font-bold tracking-wider uppercase text-center px-2 line-clamp-1 opacity-80">
        {categoryName || match.label}
      </span>
      <span className="text-[9px] text-content-muted/70 tracking-wide mt-0.5">
        Sample Listing
      </span>
    </div>
  );
}
