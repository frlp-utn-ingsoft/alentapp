import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';
import { PaymentDTO } from '@alentapp/shared';

export class CancelPaymentUseCase {
    constructor(
        private readonly paymentRepo: PaymentRepository,
        private readonly paymentValidator: PaymentValidator
    ) {}

    async execute(id: string): Promise<PaymentDTO> {
        await this.paymentValidator.validateCanCancel(id);

        return this.paymentRepo.updateStatus(id, 'Canceled');
    }
}
