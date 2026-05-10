import { PaymentDTO } from '@alentapp/shared';

export interface PaymentRepository {
  save(payment: Omit<PaymentDTO, 'id' | 'status' | 'payment_date'>): Promise<PaymentDTO>;
  findById(id: string): Promise<PaymentDTO | null>;
  updateStatus(id: string, status: 'Paid' | 'Canceled', paymentDate?: string): Promise<PaymentDTO>;
  findAll(): Promise<PaymentDTO[]>;
}
