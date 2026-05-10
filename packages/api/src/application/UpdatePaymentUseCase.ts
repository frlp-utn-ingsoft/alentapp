import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';
import { PaymentDTO, UpdatePaymentRequest } from '@alentapp/shared';

export class UpdatePaymentUseCase {
    constructor(
        private readonly paymentRepo: PaymentRepository,
        private readonly paymentValidator: PaymentValidator
    ) {}

    async execute(id: string, data: UpdatePaymentRequest): Promise<PaymentDTO> {
        await this.paymentValidator.validateCanUpdate(id);

        return this.paymentRepo.updateStatus(id, 'Paid', data.payment_date);
    }
}
