export const AWS_REGION = 'ap-south-1'; // Mumbai

export const TABLES = {
  USERS:                'TMG_Users',
  CLASSES:              'TMG_Classes',
  CLASS_MEMBERS:        'TMG_ClassMembers',
  TEACHER_ASSIGNMENTS:  'TMG_TeacherAssignments',
  STUDENT_SUBJECTS:     'TMG_StudentSubjects',
  ATTENDANCE:           'TMG_Attendance',
  FEES:                 'TMG_Fees',
  SALARY:               'TMG_Salary',
  EXAMS:                'TMG_Exams',
  EXAM_MARKS:           'TMG_ExamMarks',
  NOTES:                'TMG_Notes',
  ASSESSMENTS:          'TMG_Assessments',
  NOTICES:              'TMG_Notices',
  ROUTINES:             'TMG_Routines',
  PTM:                  'TMG_PTM',
  CALENDAR:             'TMG_Calendar',
} as const;

// No BUCKETS — S3 removed entirely

export const LAMBDA = {
  POST_CONFIRMATION: 'tmg-cognito-post-confirmation',
  SUBMIT_ATTENDANCE: 'tmg-submit-attendance',
  POST_NOTICE:       'tmg-post-notice',
  FEE_REMINDER:      'tmg-fee-reminder',
  USER_MANAGEMENT:   'tmg-user-management',
  SALARY_MANAGEMENT: 'tmg-salary-management',
} as const;
