import { MemberRepository } from '../MemberRepository.js';

export class MedicalCertificateValidator {
    constructor(private readonly memberRepo: MemberRepository) {}

    validateDateFormat(date: string): void {
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) {
            throw new Error('Formato de fecha inválido');
        }
        const year = parsedDate.getUTCFullYear();
        if (year < 1000 || year > 9999) {
            throw new Error('Formato de fecha inválido');
        }
    }

    validateExpiryAfterIssue(issueDate: string, expiryDate: string): void {
        const issue = new Date(issueDate);
        const expiry = new Date(expiryDate);
        if (expiry <= issue) {
            throw new Error('La fecha de vencimiento debe ser posterior a la fecha de emisión');
        }
    }

    async validateMemberExists(memberId: string): Promise<void> {
        const member = await this.memberRepo.findById(memberId);
        if (!member) {
            throw new Error('El socio indicado no existe');
        }
    }
}
