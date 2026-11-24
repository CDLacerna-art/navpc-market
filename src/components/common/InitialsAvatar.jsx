import React from 'react';

/**
 * Returns initials from a full name (e.g., "Juan Dela Cruz" -> "JD", "Maria Santos" -> "MS")
 */
export function getInitials(name = '') {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deterministic color palette for avatar background based on string hash
 */
const BG_PALETTES = [
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-indigo-600 text-white',
  'bg-purple-600 text-white',
  'bg-amber-600 text-white',
  'bg-cyan-600 text-white',
  'bg-rose-600 text-white',
  'bg-teal-600 text-white',
];

export function getAvatarColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BG_PALETTES.length;
  return BG_PALETTES[index];
}

/**
 * Clean, accessible Initials Avatar component
 */
export default function InitialsAvatar({
  name = 'User',
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl'
  className = '',
  ring = true,
}) {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const ringClass = ring ? 'ring-2 ring-white shadow-xs' : '';

  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-medium select-none ${selectedSize} ${colorClass} ${ringClass} ${className}`}
      aria-label={name}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
}
