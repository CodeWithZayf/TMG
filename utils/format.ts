/**
 * Currency and number formatting utilities.
 */

/**
 * Formats a number as Indian Rupees.
 * Example: 15000 → "₹15,000"
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a number as percentage.
 * Example: 76.5 → "76.5%"
 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

/**
 * Formats a large number with suffix.
 * Example: 1500 → "1.5K"
 */
export function formatCompact(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}
