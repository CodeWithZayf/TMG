import {
  signIn,
  signOut,
  confirmSignIn,
  fetchAuthSession,
  type SignInOutput,
} from 'aws-amplify/auth';
import { log, logError } from '@/utils/log';

/**
 * Sign in with email + password.
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<SignInOutput> {
  try {
    const result = await signIn({ username: email, password });
    log('loginWithEmail success:', result.nextStep);
    return result;
  } catch (error) {
    logError('loginWithEmail failed:', error);
    throw error;
  }
}

/**
 * Initiate phone OTP sign-in.
 * After this, user receives SMS code and must call verifyOtp().
 */
export async function loginWithPhone(phone: string): Promise<SignInOutput> {
  try {
    const result = await signIn({ username: phone });
    log('loginWithPhone success:', result.nextStep);
    return result;
  } catch (error) {
    logError('loginWithPhone failed:', error);
    throw error;
  }
}

/**
 * Confirm sign-in with OTP code.
 */
export async function verifyOtp(otp: string): Promise<SignInOutput> {
  try {
    const result = await confirmSignIn({ challengeResponse: otp });
    log('verifyOtp success:', result.nextStep);
    return result;
  } catch (error) {
    logError('verifyOtp failed:', error);
    throw error;
  }
}

/**
 * Confirm sign-in with new password (forced password change on first login).
 */
export async function confirmNewPassword(
  newPassword: string
): Promise<SignInOutput> {
  try {
    const result = await confirmSignIn({ challengeResponse: newPassword });
    log('confirmNewPassword success:', result.nextStep);
    return result;
  } catch (error) {
    logError('confirmNewPassword failed:', error);
    throw error;
  }
}

/**
 * Sign out the current user.
 */
export async function logout(): Promise<void> {
  try {
    await signOut();
    log('logout success');
  } catch (error) {
    logError('logout failed:', error);
    throw error;
  }
}

/**
 * Get the current auth session. Returns null if not authenticated.
 */
export async function getCurrentSession() {
  try {
    const session = await fetchAuthSession();
    if (!session.tokens?.idToken) return null;
    return session;
  } catch {
    return null;
  }
}
