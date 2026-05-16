import {
    PaymentDTO,
    PaymentStatus,
    UpdatePaymentRequest,
} from '@alentapp/shared';
import { PaymentRepository } from '../../domain/PaymentRepository.js';
import { PaymentValidator } from '../../domain/services/PaymentValidator.js';

export class UpdatePaymentUseCase {
    constructor(
        private readonly paymentRepo: PaymentRepository,
        private readonly paymentValidator: PaymentValidator,
    ) {}

    async execute(
        paymentId: string,
        data: UpdatePaymentRequest,
    ): Promise<PaymentDTO> {
        this.paymentValidator.validateUpdatePayload(data);

        const existingPayment = await this.paymentRepo.findById(paymentId);
        this.paymentValidator.validatePaymentExists(existingPayment);

        const requestedStatus = data.status;

        this.paymentValidator.validateStatus(requestedStatus);

        const resolvedStatus = this.resolveStatus(
            existingPayment,
            requestedStatus,
        );

        const resolvedPaymentDate = this.resolvePaymentDate(
            resolvedStatus,
            data.payment_date,
        );

        return this.paymentRepo.update(
            paymentId,
            {
                status: resolvedStatus,
                payment_date: resolvedPaymentDate,
            }
        );
    }

    private resolveStatus(
        payment: PaymentDTO,
        requestedStatus: PaymentStatus,
    ): PaymentStatus {
        const today = this.getTodayDateOnly();

        const paymentIsExpired =
            payment.due_date < today &&
            payment.status !== 'Pagado' &&
            payment.status !== 'Cancelado';

        if (paymentIsExpired && requestedStatus !== 'Pagado') {
            return 'Vencido';
        }

        return requestedStatus;
    }

    private resolvePaymentDate(
        status: PaymentStatus,
        paymentDate?: string | null,
    ): string | null {
        if (status === 'Pagado') {
            return paymentDate ?? this.getTodayDateOnly();
        }

        return null;
    }

    private getTodayDateOnly(): string {
        return new Date().toISOString().split('T')[0];
    }
}