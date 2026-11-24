import React from 'react';

export default function Card({
  children,
  className = '',
  hoverable = false,
  padding = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-white border border-surface-border rounded-xl shadow-card transition-all duration-200 ${
        hoverable ? 'hover:shadow-card-hover hover:border-blue-200 cursor-pointer' : ''
      } ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-surface-border pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-base font-semibold text-content-heading ${className}`}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-xs text-content-muted mt-0.5 ${className}`}>
      {children}
    </p>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={className}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`border-t border-surface-border pt-4 mt-4 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};
