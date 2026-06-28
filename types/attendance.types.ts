/** Attendance record from TMG_Attendance */
export interface AttendanceRecord {
  'classId#studentId': string;
  date: string;
  classId: string;
  studentId: string;
  status: AttendanceStatus;
  markedBy: string;
  sessionLocked: boolean;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

/** Submit attendance payload */
export interface SubmitAttendancePayload {
  classId: string;
  date: string;
  records: Record<string, AttendanceStatus>;
}

/** Attendance submission result */
export interface AttendanceResult {
  written: number;
  skipped: number;
}

/** Attendance summary stats */
export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}
