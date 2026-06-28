/** Salary record from TMG_Salary */
export interface SalaryRecord {
  teacherId: string;
  monthYear: string;
  amount: number;
  status: SalaryStatus;
  paidAt?: string;
  note?: string;
  createdBy: string;
}

export type SalaryStatus = 'pending' | 'paid';

/** Create salary payload */
export interface CreateSalaryPayload {
  teacherId: string;
  monthYear: string;
  amount: number;
  note?: string;
}
