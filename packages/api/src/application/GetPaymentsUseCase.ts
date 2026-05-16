import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentDTO } from '@alentapp/shared';

export class GetPaymentsUseCase {
    constructor(private paymentRepository: PaymentRepository) {}

    async execute(): Promise<PaymentDTO[]> {
        return this.paymentRepository.findAll();
    }
}