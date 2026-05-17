import { MemberRepository } from '../MemberRepository.js';

export class PaymentValidator {
    constructor(private readonly memberRepository: MemberRepository) {}

    async validateMemberExists(memberId: string): Promise<void> {
        const member = await this.memberRepository.findById(memberId);
        if (!member) {
            throw new Error('Error: El socio especificado no existe');
        }
    }

    validateAmount(amount: number): void {
        if (amount <= 0) {
            throw new Error('Error: El monto debe ser mayor a cero');
        }
    }

    validateMonth(month: number): void {
        if (month < 1 || month > 12) {
            throw new Error('Error: Mes inválido. Debe estar entre 1 y 12');
        }
    }

    validateYear(year: number): void {
        if (year < 1900 || year > 2100) {
            throw new Error('Error: Año inválido. Debe estar entre 1900 y 2100');
        }
    }

    async validateAll(data: {
        member_id: string;
        amount: number;
        month: number;
        year: number;
    }): Promise<void> {
        await this.validateMemberExists(data.member_id);
        this.validateAmount(data.amount);
        this.validateMonth(data.month);
        this.validateYear(data.year);
    }
}
