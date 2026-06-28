import type { Subject } from '@/constants/subjects';

/** Exam definition from TMG_Exams */
export interface Exam {
  examId: string;
  classId: string;
  subject: Subject;
  examName: string;
  totalMarks: number;
  date: string;
  createdBy: string;
}

/** Exam marks from TMG_ExamMarks */
export interface ExamMark {
  examId: string;
  studentId: string;
  marks: number;
  percentage: number;
  subject: Subject;
  enteredBy: string;
  enteredAt: string;
}

/** Create exam payload */
export interface CreateExamPayload {
  classId: string;
  subject: Subject;
  examName: string;
  totalMarks: number;
  date: string;
}

/** Submit marks payload */
export interface SubmitMarksPayload {
  examId: string;
  totalMarks: number;
  marks: Record<string, number>; // studentId → marks
}

/** Assessment from TMG_Assessments */
export interface Assessment {
  assessmentId: string;
  'classId#subject': string;
  classId: string;
  subject: Subject;
  title: string;
  description?: string;
  dueDate: string;
  maxScore: number;
  createdBy: string;
}

/** Note from TMG_Notes */
export interface Note {
  noteId: string;
  'classId#subject': string;
  classId: string;
  subject: Subject;
  title: string;
  content: string;
  uploadedBy: string;
  createdAt: string;
}
