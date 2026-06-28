/**
 * __DEV__ guarded logger.
 * No-ops in production builds.
 */
export function log(...args: unknown[]): void {
  if (__DEV__) {
    console.log('[TMG]', ...args);
  }
}

export function logError(...args: unknown[]): void {
  if (__DEV__) {
    console.error('[TMG ERROR]', ...args);
  }
}

export function logWarn(...args: unknown[]): void {
  if (__DEV__) {
    console.warn('[TMG WARN]', ...args);
  }
}
