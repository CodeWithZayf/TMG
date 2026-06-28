import { fetchAuthSession } from 'aws-amplify/auth';

const KNOWN_ROLES = ['admin', 'teacher', 'student'] as const;
export type Role = typeof KNOWN_ROLES[number];

/**
 * Resolves the user's role from Cognito JWT groups.
 * Always resolve role this way — never assume array position.
 */
export async function getCurrentRole(): Promise<Role> {
  const session = await fetchAuthSession();
  const groups = (session.tokens?.idToken?.payload['cognito:groups'] as string[]) ?? [];
  const role = groups.find((g): g is Role => KNOWN_ROLES.includes(g as Role));
  if (!role) throw new Error('No valid role — contact admin');
  return role;
}

/**
 * Gets the userId (Cognito sub) from the current session.
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await fetchAuthSession();
  const sub = session.tokens?.idToken?.payload?.sub;
  if (!sub || typeof sub !== 'string') throw new Error('No user ID in session');
  return sub;
}
