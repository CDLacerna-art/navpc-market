import React from 'react';

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon: Icon,
  dot = false,
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    primary: 'bg-brand-light text-brand-dark border border-brand-200',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
    success: 'bg-green-50 text-status-success border border-green-200',
    warning: 'bg-amber-50 text-status-warning border border-amber-200',
    danger: 'bg-red-50 text-status-danger border border-red-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
  };

  const dotColors = {
    primary: 'bg-brand-blue',
    neutral: 'bg-gray-500',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    danger: 'bg-status-danger',
    info: 'bg-sky-500',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-gray-400'}`} />}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </span>
  );
}
