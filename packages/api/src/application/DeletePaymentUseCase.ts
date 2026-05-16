import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';

export class CancelPaymentUseCase {
    constructor(private paymentRepository: PaymentRepository) {}

    async execute(id: string): Promise<void> {
        // 1. Verificar existencia
        const existingPayment = await this.paymentRepository.findById(id);
        if (!existingPayment) {
            throw new Error('El pago no existe');
        }

        // 2. Validar que no esté cobrado (Regla del TDD-0015)
        PaymentValidator.canCancel(existingPayment.status);

        // 3. Ejecutar baja lógica explícita
        await this.paymentRepository.updateStatus(id, 'Canceled');
    }
}