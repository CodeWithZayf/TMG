import { apiGet, apiPost, apiPut, apiDel } from '@/services/api';
import type {
  User,
  PaginatedResponse,
  CreateTeacherPayload,
  CreateStudentPayload,
} from '@/types/user.types';

/**
 * Create a teacher with optional assignments.
 * Returns { userId, tempPassword, message }.
 */
export async function createTeacher(data: CreateTeacherPayload) {
  return apiPost<{ userId: string; tempPassword: string; message: string }>(
    '/users',
    { role: 'teacher', ...data }
  );
}

/**
 * Create a student with optional subject enrollments.
 * Returns { userId, tempPassword, message }.
 */
export async function createStudent(data: CreateStudentPayload) {
  return apiPost<{ userId: string; tempPassword: string; message: string }>(
    '/users',
    { role: 'student', ...data }
  );
}

/**
 * Update user fields (admin only).
 */
export async function updateUser(userId: string, data: Partial<Pick<User, 'name' | 'phone' | 'rollNo' | 'parentPhone' | 'active'>>) {
  return apiPut<{ userId: string; updated: string[] }>(`/users/${userId}`, data);
}

/**
 * Deactivate user (admin only).
 */
export async function deactivateUser(userId: string) {
  return apiDel(`/users/${userId}`);
}

/**
 * List users filtered by role. Uses RoleIndex GSI.
 */
export async function listUsers(role?: string, nextToken?: string) {
  const query: Record<string, string> = {};
  if (role) query.role = role;
  if (nextToken) query.nextToken = nextToken;
  return apiGet<PaginatedResponse<User>>('/users', query);
}

/**
 * Get a single user's profile by ID.
 */
export async function getUserProfile(userId: string) {
  return apiGet<User>(`/users/${userId}`);
}
