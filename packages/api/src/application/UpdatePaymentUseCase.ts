import { PaymentRepository } from '../domain/PaymentRepository.js';
import { UpdatePaymentRequest, PaymentDTO } from '@alentapp/shared';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';

export class UpdatePaymentUseCase {
    constructor(private paymentRepository: PaymentRepository) {}

    async execute(id: string, data: UpdatePaymentRequest): Promise<PaymentDTO> {
        // 1. Verificar existencia
        const existingPayment = await this.paymentRepository.findById(id);
        if (!existingPayment) {
            throw new Error('El pago no existe');
        }

        // 2. Validar inmutabilidad (Regla del TDD-0014)
        PaymentValidator.canEdit(existingPayment.status);

        // 3. Si mandan un monto nuevo, validarlo
        if (data.amount !== undefined) {
            PaymentValidator.validateAmount(data.amount);
        }

        // 4. Actualizar (el PostgresRepository se encarga de setear payment_date si status == 'Paid')
        return this.paymentRepository.update(id, data);
    }
}