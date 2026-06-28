import { apiPost } from '@/services/api';
import { log, logError } from '@/utils/log';

/**
 * Save the device's FCM push token to the backend.
 * Called on every app launch and whenever the token refreshes.
 */
export async function saveFcmToken(token: string): Promise<void> {
  try {
    await apiPost('/users/fcm-token', { fcmToken: token });
    log('FCM token saved');
  } catch (error) {
    logError('Failed to save FCM token:', error);
    // Don't throw — non-critical, retried on next launch
  }
}
