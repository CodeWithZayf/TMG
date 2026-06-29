import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/store/auth.store';
import {
  loginWithEmail,
  loginWithPhone,
  verifyOtp,
  confirmNewPassword,
  logout as authLogout,
  getCurrentSession,
} from '@/services/auth.service';
import { getCurrentRole, getCurrentUserId } from '@/utils/auth';
import { apiGet } from '@/services/api';
import { saveFcmToken } from '@/services/notifications.service';
import { log, logError } from '@/utils/log';
import type { Role } from '@/utils/auth';
import type { User } from '@/types/user.types';

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<'DONE' | 'NEW_PASSWORD_REQUIRED' | 'ERROR'>;
  submitNewPassword: (newPassword: string) => Promise<void>;
  loginPhone: (phone: string) => Promise<boolean>;
  submitOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

/**
 * Post-login flow shared by all auth methods:
 * fetchAuthSession → getCurrentRole → apiGet('/users/me') → Zustand → saveFcmToken → navigate
 */
async function postLoginFlow(setUser: (userId: string, name: string, role: Role) => void): Promise<void> {
  const role = await getCurrentRole();
  const userId = await getCurrentUserId();

  // Fetch user profile from DynamoDB via Lambda
  const user = await apiGet<User>('/users/me');

  // Write to Zustand
  setUser(userId, user.name, role);

  // Save FCM token (non-blocking, non-throwing)
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') {
      const tokenData = await Notifications.getDevicePushTokenAsync();
      await saveFcmToken(tokenData.data);
    }
  } catch {
    // FCM registration is non-critical
  }

  // Navigate to role group
  log('Routing to role group:', role);
  if (role === 'admin') {
    router.replace('/(admin)');
  } else if (role === 'teacher') {
    router.replace('/(teacher)');
  } else {
    router.replace('/(student)');
  }
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  /**
   * Email + password login.
   * Returns 'DONE' if complete, 'NEW_PASSWORD_REQUIRED' if Cognito forces password change,
   * or 'ERROR' on failure (error message available via `error` state).
   */
  const login = useCallback(async (email: string, password: string): Promise<'DONE' | 'NEW_PASSWORD_REQUIRED' | 'ERROR'> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginWithEmail(email, password);

      if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setIsLoading(false);
        return 'NEW_PASSWORD_REQUIRED';
      }

      if (result.isSignedIn) {
        await postLoginFlow(setUser);
        setIsLoading(false);
        return 'DONE';
      }

      setError('Unexpected sign-in step');
      setIsLoading(false);
      return 'ERROR';
    } catch (e: any) {
      const message = e.message || 'Login failed';
      if (message.includes('Incorrect username or password') || message.includes('UserNotFoundException')) {
        setError('Wrong credentials');
      } else if (message.includes('User is disabled')) {
        setError('Account disabled — contact admin');
      } else {
        setError(message);
      }
      setIsLoading(false);
      return 'ERROR';
    }
  }, [setUser]);

  /**
   * Submit new password for forced password change flow.
   */
  const submitNewPassword = useCallback(async (newPassword: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await confirmNewPassword(newPassword);
      if (result.isSignedIn) {
        await postLoginFlow(setUser);
      }
    } catch (e: any) {
      setError(e.message || 'Password change failed');
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  /**
   * Initiate phone OTP sign-in.
   * Returns true if OTP was sent, false on error.
   */
  const loginPhone = useCallback(async (phone: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await loginWithPhone(phone);
      setIsLoading(false);
      return true;
    } catch (e: any) {
      setError(e.message || 'Phone login failed');
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Submit OTP for phone sign-in.
   */
  const submitOtp = useCallback(async (otp: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyOtp(otp);
      if (result.isSignedIn) {
        await postLoginFlow(setUser);
      }
    } catch (e: any) {
      setError(e.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  /**
   * Sign out and clear state.
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authLogout();
    } catch {
      // Sign out locally even if remote call fails
    }
    clear();
    router.replace('/(auth)/login');
  }, [clear]);

  /**
   * Check for existing session on app start.
   * Returns true if authenticated, false otherwise.
   */
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const session = await getCurrentSession();
      if (!session) return false;

      await postLoginFlow(setUser);
      return true;
    } catch (e) {
      logError('Session check failed:', e);
      return false;
    }
  }, [setUser]);

  return {
    isLoading,
    error,
    login,
    submitNewPassword,
    loginPhone,
    submitOtp,
    logout,
    checkSession,
  };
}
