import { MemberRepository } from '../MemberRepository.js';
import { PaymentRepository } from '../PaymentRepository.js';

export class PaymentValidator {
    constructor(
        private readonly memberRepo: MemberRepository,
        private readonly paymentRepo: PaymentRepository
    ) {}

    validateAmount(amount: number): void {
        if (amount === undefined || amount === null) {
            throw new Error('El monto es requerido');
        }
        if (amount <= 0) {
            throw new Error('El monto debe ser mayor a cero');
        }
    }

    validateMonth(month: number): void {
        if (month === undefined || month === null) {
            throw new Error('El mes es requerido');
        }
        if (month < 1 || month > 12) {
            throw new Error('El mes debe estar entre 1 y 12');
        }
    }

    validateYear(year: number): void {
        if (year === undefined || year === null) {
            throw new Error('El año es requerido');
        }
        if (year < 1900) {
            throw new Error('El año es inválido');
        }
    }

    async validateMemberExists(memberId: string): Promise<void> {
        if (!memberId) {
            throw new Error('El ID del socio es requerido');
        }
        const member = await this.memberRepo.findById(memberId);
        if (!member) {
            throw new Error('No existe un socio con ese ID');
        }
    }

    async validateCanUpdate(id: string): Promise<void> {
        const payment = await this.paymentRepo.findById(id);
        if (!payment) throw new Error('No existe un pago con ese ID');

        if (payment.status === 'Paid') {
            throw new Error('El pago ya fue confirmado y no puede modificarse');
        }
        if (payment.status === 'Canceled') {
            throw new Error('El pago está cancelado y no puede modificarse');
        }
    }

    async validateCanCancel(id: string): Promise<void> {
        const payment = await this.paymentRepo.findById(id);
        if (!payment) throw new Error('No existe un pago con ese ID');

        if (payment.status === 'Paid') {
            throw new Error('No se puede cancelar un pago ya confirmado');
        }
        if (payment.status === 'Canceled') {
            throw new Error('El pago ya se encuentra cancelado');
        }
    }
}
