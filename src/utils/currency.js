/**
 * Philippine Peso Currency Formatter
 * Standardized across NavPC Market for all prices, totals, and balances.
 */
export function formatPHP(amount) {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

export function formatCompactPHP(amount) {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  if (numericAmount >= 1000) {
    return `₱${(numericAmount / 1000).toFixed(1)}k`;
  }
  return `₱${numericAmount.toFixed(0)}`;
}
