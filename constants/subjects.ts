export const SUBJECTS = [
  'ACCOUNTANCY',
  'BENGALI',
  'BIOLOGY',
  'BUSINESS_STUDIES',
  'CHEMISTRY',
  'COMMERCIAL_APPLICATIONS',
  'COMMERCIAL_STUDIES',
  'COMPUTER_SCIENCE',
  'ECONOMICS',
  'ENGLISH_LANGUAGE',
  'ENGLISH_LITERATURE',
  'GEOGRAPHY',
  'HINDI',
  'HISTORY',
  'MATHEMATICS',
  'PHYSICS',
  'POLITICAL_SCIENCE',
] as const;

export type Subject = typeof SUBJECTS[number];

// Display labels (shown in UI)
export const SUBJECT_LABELS: Record<Subject, string> = {
  ACCOUNTANCY:            'Accountancy',
  BENGALI:                'Bengali',
  BIOLOGY:                'Biology',
  BUSINESS_STUDIES:       'Business Studies',
  CHEMISTRY:              'Chemistry',
  COMMERCIAL_APPLICATIONS:'Commercial Applications',
  COMMERCIAL_STUDIES:     'Commercial Studies',
  COMPUTER_SCIENCE:       'Computer Science',
  ECONOMICS:              'Economics',
  ENGLISH_LANGUAGE:       'English Language',
  ENGLISH_LITERATURE:     'English Literature',
  GEOGRAPHY:              'Geography',
  HINDI:                  'Hindi',
  HISTORY:                'History',
  MATHEMATICS:            'Mathematics',
  PHYSICS:                'Physics',
  POLITICAL_SCIENCE:      'Political Science',
};
