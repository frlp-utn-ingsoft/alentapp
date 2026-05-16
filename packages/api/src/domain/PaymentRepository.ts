import { PaymentDTO, CreatePaymentRequest } from '@alentapp/shared';

export interface PaymentRepository {
    create(data: CreatePaymentRequest): Promise<PaymentDTO>;
    findById(id: string): Promise<PaymentDTO | null>;
    findAll(): Promise<PaymentDTO[]>;
}