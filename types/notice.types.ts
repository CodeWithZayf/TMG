import type { Subject } from '@/constants/subjects';

/** Notice from TMG_Notices */
export interface Notice {
  noticeId: string;
  scope: 'global' | 'subject';
  classId?: string;
  subject?: Subject;
  'classId#subject'?: string;
  title: string;
  body: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

/** Create notice payload */
export interface CreateNoticePayload {
  scope: 'global' | 'subject';
  classId?: string;
  subject?: Subject;
  title: string;
  body: string;
}
