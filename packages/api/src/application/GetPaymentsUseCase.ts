import { IPaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentDTO } from '@alentapp/shared';

export class GetPaymentsUseCase {
    constructor(private readonly paymentRepository: IPaymentRepository) {}

    async execute(): Promise<PaymentDTO[]> {
        return this.paymentRepository.findAll();
    }
}
