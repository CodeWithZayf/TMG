/**
 * TMG — The Modern Gurukul
 * Design system color palette
 */

export const COLORS = {
  // Primary brand
  primary: {
    50:  '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5', // Primary indigo
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Neutrals
  neutral: {
    50:  '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic
  success: {
    light: '#D1FAE5',
    main:  '#10B981',
    dark:  '#047857',
  },
  warning: {
    light: '#FEF3C7',
    main:  '#F59E0B',
    dark:  '#B45309',
  },
  error: {
    light: '#FEE2E2',
    main:  '#EF4444',
    dark:  '#B91C1C',
  },
  info: {
    light: '#DBEAFE',
    main:  '#3B82F6',
    dark:  '#1D4ED8',
  },

  // Backgrounds
  background: {
    primary:   '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary:  '#F3F4F6',
  },

  // Text
  text: {
    primary:   '#111827',
    secondary: '#6B7280',
    tertiary:  '#9CA3AF',
    inverse:   '#FFFFFF',
  },

  // Attendance status
  attendance: {
    present: '#10B981',
    absent:  '#EF4444',
    late:    '#F59E0B',
  },

  // Fee status
  fee: {
    paid:    '#10B981',
    pending: '#F59E0B',
    overdue: '#EF4444',
  },

  // Borders
  border: {
    light:   '#E5E7EB',
    default: '#D1D5DB',
    dark:    '#9CA3AF',
  },
} as const;

/**
 * Subject pill colors — deterministic color per subject via hash.
 * 8-color palette that cycles for 17 subjects.
 */
export const SUBJECT_COLORS = [
  '#4F46E5', // Indigo
  '#7C3AED', // Violet
  '#2563EB', // Blue
  '#0891B2', // Cyan
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#DB2777', // Pink
] as const;

/**
 * Returns a deterministic color for a subject string.
 */
export function getSubjectColor(subject: string): string {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[index];
}
