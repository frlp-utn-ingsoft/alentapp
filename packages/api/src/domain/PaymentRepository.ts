import type { CreatePaymentRequest, PaymentDTO } from '@alentapp/shared';

export interface PaymentRepository {
    create(payment: CreatePaymentRequest): Promise<PaymentDTO>;
    findAll(): Promise<PaymentDTO[]>;
}
