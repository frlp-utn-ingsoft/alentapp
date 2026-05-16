export type PaymentStatus = 'Pending' | 'Paid' | 'Canceled';

export interface Payment {
  id: string;
  amount: number;
  month: number;
  year: number;
  status: PaymentStatus;
  due_date: Date;
  payment_date: Date | null;
  member_id: string;
}

export interface CreatePaymentDTO {
  member_id: string;
  amount: number;
  month: number;
  year: number;
  due_date: string;
}