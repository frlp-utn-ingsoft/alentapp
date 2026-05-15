import { PaymentRepository } from '../PaymentRepository.js';

export class PaymentValidator {
    constructor(private readonly paymentRepo: PaymentRepository) {}

    validateFields(data: {
        member_id?: string;
        amount?: number;
        month?: number;
        year?: number;
        due_date?: string;
    }): void {
        if (
            !data.member_id ||
            data.amount === undefined ||
            data.month === undefined ||
            data.year === undefined ||
            !data.due_date
        ) {
            throw new Error('Faltan campos obligatorios');
        }
    }

    validateAmount(amount: number): void {
        if (amount <= 0) {
            throw new Error('El monto debe ser mayor a cero');
        }
    }

    validateMonth(month: number): void {
        if (month < 1 || month > 12) {
            throw new Error('El mes debe estar entre 1 y 12');
        }
    }

    validateYear(year: number): void {
        if (!Number.isInteger(year) || year < 1900) {
            throw new Error('El año es inválido');
        }
    }

    validateDueDate(dueDate: string): void {
        if (!this.isValidDateOnly(dueDate)) {
            throw new Error('La fecha de vencimiento es inválida.');
        }
    }

    async validateUniquePayment(
        member_id: string,
        month: number,
        year: number,
        excludePaymentId?: string,
    ): Promise<void> {
        const existingPayment = await this.paymentRepo.findByMemberMonthYear(
            member_id,
            month,
            year,
        );

        if (existingPayment && existingPayment.id !== excludePaymentId) {
            throw new Error(
                'Ya existe un pago para este miembro en el mes y año especificados',
            );
        }
    }

    private isValidDateOnly(dateStr: string): boolean {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return false;
        }

        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));

        return (
            date.getUTCFullYear() === year &&
            date.getUTCMonth() === month - 1 &&
            date.getUTCDate() === day
        );
    }
}
