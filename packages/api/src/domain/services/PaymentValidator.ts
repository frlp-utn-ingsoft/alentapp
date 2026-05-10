import { MemberRepository } from '../MemberRepository.js';

export class PaymentValidator {
    constructor(private readonly memberRepo: MemberRepository) {}

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
}
