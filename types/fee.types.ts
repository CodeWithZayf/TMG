/** Fee record from TMG_Fees */
export interface FeeRecord {
  studentId: string;
  monthYear: string;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  paidAt?: string;
  note?: string;
  createdBy: string;
}

export type FeeStatus = 'pending' | 'paid' | 'overdue';

/** Create fee payload */
export interface CreateFeePayload {
  studentId: string;
  monthYear: string;
  amount: number;
  dueDate: string;
  note?: string;
}
