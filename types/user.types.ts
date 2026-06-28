import type { Subject } from '@/constants/subjects';

/** User record from TMG_Users table */
export interface User {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'teacher' | 'student';
  classId?: string;       // students only
  rollNo?: string;        // students only
  parentPhone?: string;   // students only
  fcmToken?: string;
  active: boolean;
  createdAt: string;
}

/** Teacher assignment from TMG_TeacherAssignments */
export interface TeacherAssignment {
  teacherId: string;
  'classId#subject': string;
  classId: string;
  subject: Subject;
  assignedAt: string;
  assignedBy: string;
}

/** Student subject enrollment from TMG_StudentSubjects */
export interface StudentSubject {
  studentId: string;
  'classId#subject': string;
  classId: string;
  subject: Subject;
  enrolledAt: string;
  enrolledBy: string;
}

/** Class from TMG_Classes */
export interface ClassInfo {
  classId: string;
  name: string;
  section: string;
  createdAt: string;
}

/** Class member from TMG_ClassMembers */
export interface ClassMember {
  classId: string;
  userId: string;
  role: 'student';
  joinedAt: string;
}

/** Paginated response from Lambda list endpoints */
export interface PaginatedResponse<T> {
  items: T[];
  nextToken?: string;
}

/** Create teacher payload */
export interface CreateTeacherPayload {
  name: string;
  email: string;
  phone?: string;
  assignments: Array<{ classId: string; subject: Subject }>;
}

/** Create student payload */
export interface CreateStudentPayload {
  name: string;
  email: string;
  phone?: string;
  rollNo: string;
  classId: string;
  parentPhone?: string;
  subjects: Subject[];
}
