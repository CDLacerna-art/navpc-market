import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const variants = {
    primary: 'bg-brand-blue hover:bg-brand-dark text-white shadow-sm focus:ring-brand-blue/50 border border-transparent',
    secondary: 'bg-white hover:bg-gray-50 text-content-body border border-surface-border shadow-sm focus:ring-brand-blue/30',
    outline: 'bg-transparent hover:bg-brand-light text-brand-blue border border-brand-blue/40 focus:ring-brand-blue/30',
    subtle: 'bg-brand-light hover:bg-blue-100 text-brand-blue focus:ring-brand-blue/30 border border-transparent',
    danger: 'bg-status-danger hover:bg-red-700 text-white shadow-sm focus:ring-status-danger/40 border border-transparent',
    ghost: 'bg-transparent hover:bg-gray-100 text-content-body focus:ring-gray-300 border border-transparent',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-0.5 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" aria-hidden="true" />}
          {children}
          {RightIcon && <RightIcon className="w-4 h-4 shrink-0" aria-hidden="true" />}
        </>
      )}
    </button>
  );
}
