import { CreatePaymentRequest, PaymentResponse } from '@alentapp/shared';

export interface PaymentRepository {
    create(payment: CreatePaymentRequest): Promise<PaymentResponse>;
}
