import { apiGet, apiPost } from '@/services/api';
import type {
  AttendanceRecord,
  AttendanceResult,
  SubmitAttendancePayload,
} from '@/types/attendance.types';
import type { PaginatedResponse } from '@/types/user.types';

/**
 * Submit attendance for a class on a given date.
 * records: { [studentId]: 'present' | 'absent' | 'late' }
 */
export async function submitAttendance(payload: SubmitAttendancePayload) {
  return apiPost<AttendanceResult>('/attendance', payload);
}

/**
 * Get attendance records for a class on a specific date.
 */
export async function getClassAttendance(classId: string, date: string) {
  return apiGet<{ items: AttendanceRecord[] }>('/attendance', { classId, date });
}

/**
 * Get a student's attendance history (paginated, newest first).
 */
export async function getStudentAttendance(studentId: string, nextToken?: string) {
  const query: Record<string, string> = { studentId };
  if (nextToken) query.nextToken = nextToken;
  return apiGet<PaginatedResponse<AttendanceRecord>>('/attendance/student', query);
}
