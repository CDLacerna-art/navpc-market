import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({
  size = 'md',
  showSubtitle = true,
  linkTo = '/',
  className = '',
}) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const subtitleSizes = {
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Minimalist Storefront Icon */}
      <div className={`${iconSizes[size] || iconSizes.md} rounded-xl bg-brand-blue flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-105`}>
        <svg
          viewBox="0 0 24 24"
          className="w-5/6 h-5/6 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Storefront awning */}
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
          <path d="M2 7h20" />
          <path d="M7 11a2.5 2.5 0 0 1-5 0V7h5v4z" />
          <path d="M12 11a2.5 2.5 0 0 1-5 0V7h5v4z" />
          <path d="M17 11a2.5 2.5 0 0 1-5 0V7h5v4z" />
          <path d="M22 11a2.5 2.5 0 0 1-5 0V7h5v4z" />
        </svg>
      </div>

      {/* Wordmark and Tagline */}
      <div className="flex flex-col text-left">
        <span className={`font-bold tracking-tight text-content-heading leading-tight ${titleSizes[size] || titleSizes.md}`}>
          Nav<span className="text-brand-blue">PC</span> <span className="font-semibold text-content-heading">Market</span>
        </span>
        {showSubtitle && (
          <span className={`font-medium text-content-muted leading-tight tracking-normal ${subtitleSizes[size] || subtitleSizes.md}`}>
            NPC Student Marketplace
          </span>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="group inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
