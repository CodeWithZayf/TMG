import { format, parseISO, isValid } from 'date-fns';

/**
 * Returns today's date as YYYY-MM-DD string.
 */
export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Returns current month-year as YYYY-MM string.
 */
export function monthYearString(): string {
  return format(new Date(), 'yyyy-MM');
}

/**
 * Formats an ISO date string to a readable format.
 * Example: "2025-08-15" → "15 Aug 2025"
 */
export function formatDate(isoDate: string): string {
  const date = parseISO(isoDate);
  if (!isValid(date)) return isoDate;
  return format(date, 'dd MMM yyyy');
}

/**
 * Formats an ISO timestamp to date + time.
 * Example: "2025-08-15T09:30:00.000Z" → "15 Aug 2025, 9:30 AM"
 */
export function formatDateTime(isoTimestamp: string): string {
  const date = parseISO(isoTimestamp);
  if (!isValid(date)) return isoTimestamp;
  return format(date, 'dd MMM yyyy, h:mm a');
}

/**
 * Formats YYYY-MM to a readable month-year.
 * Example: "2025-08" → "August 2025"
 */
export function formatMonthYear(monthYear: string): string {
  const date = parseISO(`${monthYear}-01`);
  if (!isValid(date)) return monthYear;
  return format(date, 'MMMM yyyy');
}

/**
 * Returns relative time label for a timestamp.
 * Example: "2 hours ago", "Yesterday", "15 Aug"
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const date = parseISO(isoTimestamp);
  if (!isValid(date)) return isoTimestamp;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return format(date, 'dd MMM');
}
