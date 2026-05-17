import { PaymentRepository, PaymentNotPendingError } from '../domain/PaymentRepository.js';
import { Clock } from '../domain/Clock.js';
import { PaymentDTO } from '@alentapp/shared';

export class MarkPaymentAsPaidUseCase {
    constructor(
        private readonly paymentRepo: PaymentRepository,
        private readonly clock: Clock,
    ) {}

    async execute(id: string): Promise<PaymentDTO> {
        const payment = await this.paymentRepo.findById(id);

        if (!payment) {
            throw new Error('El pago no existe');
        }

        if (payment.status === 'Pagado') {
            return payment;
        }

        if (payment.status === 'Cancelado') {
            throw new PaymentNotPendingError('Cancelado');
        }

        return await this.paymentRepo.markAsPaidIfPending(id, this.clock.now());
    }
}
