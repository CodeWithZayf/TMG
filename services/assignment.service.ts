import { apiGet } from '@/services/api';
import type { TeacherAssignment } from '@/types/user.types';

/**
 * Get all assignments for a teacher.
 */
export async function getTeacherAssignments(teacherId: string) {
  return apiGet<{ items: TeacherAssignment[] }>(`/assignments/teacher/${teacherId}`);
}

/**
 * Get all subjects taught in a class (from TeacherAssignments).
 * Returns list of { classId, subject, teacherId, teacherName }.
 */
export async function getClassSubjects(classId: string) {
  return apiGet<{
    items: Array<{
      classId: string;
      subject: string;
      teacherId: string;
      teacherName?: string;
    }>;
  }>(`/assignments/class/${classId}`);
}
