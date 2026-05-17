import { CreatePaymentRequest, GetPaymentsQuery, PaymentResponse } from '@alentapp/shared';

export interface PaymentRepository {
    create(payment: CreatePaymentRequest): Promise<PaymentResponse>;
    findAll(query: GetPaymentsQuery): Promise<PaymentResponse[]>;
    findById(id: string): Promise<PaymentResponse | null>;
}
