import { PaymentDTO } from '@alentapp/shared';
import { PaymentRepository } from '../../domain/PaymentRepository.js';
import { PaymentValidator } from '../../domain/services/PaymentValidator.js';

export class DeletePaymentUseCase {
    constructor(
        private readonly paymentRepo: PaymentRepository,
        private readonly paymentValidator: PaymentValidator,
    ) {}

    async execute(paymentId: string): Promise<PaymentDTO> {
        const existingPayment = await this.paymentRepo.findById(paymentId);

        this.paymentValidator.validatePaymentExists(existingPayment);

        this.paymentValidator.validatePaymentCanBeCanceled(existingPayment);

        return this.paymentRepo.cancel(paymentId);
    }
}