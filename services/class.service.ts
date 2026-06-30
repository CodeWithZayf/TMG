import { apiGet, apiPost } from '@/services/api';
import type { ClassInfo, ClassMember, PaginatedResponse } from '@/types/user.types';

/**
 * Create a new class.
 */
export async function createClass(data: { name: string; section: string }) {
  return apiPost<ClassInfo>('/classes', data);
}

/**
 * List all classes.
 */
export async function listClasses(nextToken?: string) {
  const query: Record<string, string> = {};
  if (nextToken) query.nextToken = nextToken;
  return apiGet<PaginatedResponse<ClassInfo>>('/classes', query);
}

/**
 * Get a single class by ID.
 */
export async function getClass(classId: string) {
  return apiGet<ClassInfo>(`/classes/${classId}`);
}

/**
 * Get the roster (members) for a class.
 */
export async function getClassRoster(classId: string, nextToken?: string) {
  const query: Record<string, string> = {};
  if (nextToken) query.nextToken = nextToken;
  return apiGet<PaginatedResponse<ClassMember>>(`/classes/${classId}/roster`, query);
}
