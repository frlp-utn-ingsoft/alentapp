import { PaymentStatus } from '@alentapp/shared';

export class PaymentValidator {
    static canEdit(currentStatus: PaymentStatus): void {
        if (currentStatus === 'Paid' || currentStatus === 'Canceled') {
            throw new Error('No se puede editar un pago cerrado');
        }
    }

    static canCancel(currentStatus: PaymentStatus): void {
        if (currentStatus === 'Paid') {
            throw new Error('No se puede anular un pago cobrado');
        }
    }

    static validateAmount(amount: number): void {
        if (amount <= 0) {
            throw new Error('El monto debe ser mayor a 0');
        }
    }
}